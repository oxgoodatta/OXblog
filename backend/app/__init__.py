from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.auth import auth_bp
    from app.routes import main_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(main_bp, url_prefix='/api')
    
    # Create tables (this will create fresh tables with new schema)
    with app.app_context():
        db.create_all()
    
    return app