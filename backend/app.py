from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.doctor import doctor_bp
from routes.patient import patient_bp
from services.prediction_service import prediction_service
import logging
import os
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Essential session configuration
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)

    # CORS configuration - Enable credentials for session support
    # Always allow both localhost:3000 and localhost:3001 for development
    allowed_origins = os.getenv('CORS_ORIGINS')
    if allowed_origins:
        allowed_origins = [o.strip() for o in allowed_origins.split(',') if o.strip()]
    else:
        allowed_origins = ['http://localhost:3000', 'http://localhost:3001']
    CORS(app,
         origins=allowed_origins,
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    app.logger.info(f"CORS enabled for origins: {allowed_origins}")

    # Configure logging
    logging.basicConfig(level=logging.INFO)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctor')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')

    # XAI Explanation endpoint
    @app.route('/api/explain', methods=['GET'])
    def get_latest_explanation():
        """Get explanation for the latest prediction"""
        try:
            result = prediction_service.get_latest_explanation()
            return jsonify(result), 200 if result['success'] else 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'service': 'anemia_prediction_api',
            'message': 'Anemia prediction API with XAI is running'
        })

    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'Anemia Prediction API with XAI',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'patients': '/api/patients',
                'doctors': '/api/doctor',
                'health': '/api/health'
            }
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()

    with app.app_context():
        # Load ML model
        model_path = app.config.get('MODEL_PATH', 'anemia_dl_model.h5')
        try:
            prediction_service.load_model(model_path)
            print("✓ ML model loaded successfully")
        except Exception as e:
            print(f"⚠ Warning: Could not load ML model: {e}")
            print("✓ Using enhanced rule-based prediction with XAI")

    print("🚀 Starting Flask server...")
    print("📊 Anemia Prediction API with XAI explanations")
    print("🌐 Frontend URL: http://localhost:3000")
    print("🔗 Backend URL: http://localhost:5000")
    print("🔐 Session-based authentication enabled")
    app.run(debug=True, host='0.0.0.0', port=5000)
