import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_talisman import Talisman

from auth import auth_bp
from routes import api_bp

app = Flask(__name__)

# Basic security configs
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-dev-secret-key-123')
app.config['SESSION_COOKIE_SECURE'] = False  # False en dev car nous sommes en HTTP (à passer à True en prod)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)  # Exigence : Durée de vie limitée
app.config['WTF_CSRF_CHECK_DEFAULT'] = True # Vérifie par défaut tous les POST/PUT/DELETE

# Allow CORS for development with React
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# 1. Protection contre les failles CSRF
csrf = CSRFProtect(app)

# 2. Ajout des Security Headers de l'OWASP (CSP, X-Frame-Options, X-Content-Type-Options)
csp = {
    'default-src': [
        '\'self\'',
        'http://localhost:5173'
    ]
}
talisman = Talisman(app, force_https=False, content_security_policy=csp)

# Route exposée pour fournir le token CSRF à l'application SPA React
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    # Axios/Fetch l'inclura dans un header 'X-CSRFToken' lors de chaque requête mutative
    return jsonify({"csrf_token": generate_csrf()})

# Enregistrement des routes sécurisées
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(api_bp, url_prefix='/api')

# Endpoint public classique (doit contourner le CSRF si POST, mais ici c'est un GET)
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "GCS Secure API",
        "message": "DevSecOps rules!"
    }), 200

if __name__ == '__main__':
    # Ne jamais utiliser debug=True en production !
    app.run(port=5000)
