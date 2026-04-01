from flask import Blueprint, request, jsonify, session
import bcrypt
import re
import logging
from db import execute_query
from functools import wraps
from extensions import limiter

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

def log_audit(user_id, username_attempt, action):
    ip_address = request.remote_addr or 'unknown'
    try:
        execute_query("INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)", 
                      (user_id, username_attempt, action, ip_address), commit=True)
    except Exception:
        logger.warning("Failed to log audit event")

# Middlewares RBAC et Authentification
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            logger.info("Unauthenticated access blocked: %s", request.path)
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
                logger.warning("RBAC violation attempt by user %s on %s", session.get('username'), request.path)
                log_audit(session['user_id'], session.get('username'), f'RBAC_VIOLATION_ATTEMPT_{request.path}')
                return jsonify({"error": "Accès interdit : privilèges insuffisants"}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Données incomplètes"}), 400

    username = data['username']
    password = data['password']

    if not re.match(r'^[\w.-]+$', username):
        logger.warning("Invalid login input format")
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
            
            logger.info("Login success: %s", username)
            log_audit(user['id'], username, 'LOGIN_SUCCESS')
            
            return jsonify({
                "message": "Connexion réussie",
                "user": {
                    "id": user['id'],
                    "username": user['username'],
                    "role": user['role']
                }
            }), 200
        
    logger.info("Login failed for: %s", username)
    log_audit(user['id'] if user else None, username, 'LOGIN_FAILED')
    return jsonify({"error": "Identifiants incorrects"}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    user = session.get('username', 'Inconnu')
    user_id = session.get('user_id')
    session.clear()
    logger.info("Logout: %s", user)
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
