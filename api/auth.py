from flask import Blueprint, request, jsonify, session
import bcrypt
import re
from db import execute_query
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def log_audit(user_id, username_attempt, action):
    ip_address = request.remote_addr or 'unknown'
    try:
        execute_query("INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)", 
                      (user_id, username_attempt, action, ip_address), commit=True)
    except Exception as e:
        print(f"Failed to log audit: {e}")

# Middlewares RBAC et Authentification
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            print(f"[SECURITY] Accès non-authentifié bloqué sur : {request.path}")
            return jsonify({"error": "Authentification requise"}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({"error": "Authentification requise"}), 401
            
            user_role = session.get('role')
            if user_role not in roles:
                print(f"[SECURITY] Tentative d'IDOR / RBAC bypass par {session.get('username')} (rôle: {user_role}) sur {request.path}")
                log_audit(session['user_id'], session.get('username'), f'RBAC_VIOLATION_ATTEMPT_{request.path}')
                return jsonify({"error": "Accès interdit : privilèges insuffisants"}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Données incomplètes"}), 400

    username = data['username']
    password = data['password']

    if not re.match(r'^[\w.-]+$', username):
        print(f"[SECURITY] Input invalide ou attaque tentée sur login username: {username}")
        log_audit(None, username, 'INVALID_INPUT_LOGIN_ATTEMPT')
        return jsonify({"error": "Format d'identifiant invalide"}), 400

    query = "SELECT id, username, password_hash, role FROM users WHERE username = %s"
    user = execute_query(query, (username,), fetch_one=True)

    if user:
        db_hash = user['password_hash']
        if isinstance(db_hash, str):
            db_hash = db_hash.encode('utf-8')
        elif isinstance(db_hash, bytearray):
            db_hash = bytes(db_hash)

        if bcrypt.checkpw(password.encode('utf-8'), db_hash):
            session.clear()
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            session.permanent = True  
            
            print(f"[SECURITY] Connexion réussie pour l'utilisateur: {username}")
            log_audit(user['id'], username, 'LOGIN_SUCCESS')
            
            return jsonify({
                "message": "Connexion réussie",
                "user": {
                    "id": user['id'],
                    "username": user['username'],
                    "role": user['role']
                }
            }), 200
        
    print(f"[SECURITY] Échec de connexion pour l'utilisateur: {username}")
    log_audit(user['id'] if user else None, username, 'LOGIN_FAILED')
    return jsonify({"error": "Identifiants incorrects"}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    user = session.get('username', 'Inconnu')
    user_id = session.get('user_id')
    session.clear()
    print(f"[SECURITY] Déconnexion de l'utilisateur: {user}")
    if user_id:
        log_audit(user_id, user, 'LOGOUT')
    return jsonify({"message": "Déconnexion réussie"}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        "id": session['user_id'],
        "username": session['username'],
        "role": session['role']
    }), 200
