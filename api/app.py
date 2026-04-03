import os
import logging
from datetime import timedelta
from flask import Flask, jsonify

logging.basicConfig(
    level=logging.WARNING if os.environ.get('FLASK_ENV') == 'production' else logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s'
)
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_talisman import Talisman

from auth import auth_bp
from routes import api_bp
from extensions import limiter
from anti_ai import init_anti_ai

app = Flask(__name__)

# Basic security configs
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') != 'development'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)  # Exigence : Durée de vie limitée
app.config['WTF_CSRF_CHECK_DEFAULT'] = True
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB max request body

CORS(app, supports_credentials=True, origins=os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(','))

# 1. Protection contre les failles CSRF
csrf = CSRFProtect(app)
limiter.init_app(app)

csp = {
    'default-src': "'self'",
    'script-src': "'self'",
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:"],
    'font-src': "'self'",
    'connect-src': "'self'",
    'frame-ancestors': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
}
is_dev = os.environ.get('FLASK_ENV') == 'development'
talisman = Talisman(
    app,
    force_https=not is_dev,
    session_cookie_secure=not is_dev,
    content_security_policy=csp,
)

# ══ Anti-AI Security Layer ══
init_anti_ai(app)

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
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    # Ne jamais utiliser debug=True en production !
    app.run(port=5000)
