from flask import Blueprint, request, jsonify, session
from models import db, User, Prediction, Prescription
from services.prediction_service import prediction_service
import pandas as pd
import io
import logging

patient_bp = Blueprint('patient', __name__)
logger = logging.getLogger(__name__)

def require_auth(f):
    """Decorator to require authentication with better debugging"""
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        user_role = session.get('user_role')

        # Debug session info
        logger.info(f"Auth check - Session ID: {user_id}, Role: {user_role}")
        logger.info(f"Session keys: {list(session.keys())}")

        if not user_id:
            logger.warning("Authentication failed - no user_id in session")
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@patient_bp.route('/predict', methods=['POST'])
@require_auth
def make_prediction():
    """Make anemia prediction with XAI explanations"""
    try:
        logger.info("Making prediction request with XAI")

        # Handle both JSON and file upload
        features = None

        if request.is_json:
            # JSON input
            features = request.get_json()
            logger.info(f"Received JSON input: {features}")
        elif 'file' in request.files:
            # CSV file upload
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            if not file.filename.lower().endswith('.csv'):
                return jsonify({'error': 'File must be a CSV'}), 400

            try:
                # Read CSV
                stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
                csv_data = pd.read_csv(stream)

                if len(csv_data) != 1:
                    return jsonify({'error': 'CSV must contain exactly one row of data'}), 400

                features = csv_data.iloc[0].to_dict()
                logger.info(f"Received CSV input: {features}")

            except Exception as e:
                return jsonify({'error': f'Error reading CSV file: {str(e)}'}), 400
        else:
            return jsonify({'error': 'No input data provided'}), 400

        # Make prediction with XAI explanations
        try:
            result = prediction_service.predict(features)
            logger.info(f"Prediction result with explanations: {result}")

        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

        # Save prediction to database
        user_id = session.get('user_id')
        if user_id:
            try:
                prediction_record = Prediction(
                    user_id=user_id,
                    predicted_label=result['predicted_label'],
                    predicted_proba=result['predicted_proba']
                )
                prediction_record.set_input_features(features)
                prediction_record.set_explanation(result['explanations'])

                db.session.add(prediction_record)
                db.session.commit()

                # Add saved prediction ID to result
                result['saved_prediction_id'] = prediction_record.id
                logger.info(f"Prediction with XAI explanations saved with ID: {prediction_record.id}")
            except Exception as e:
                logger.warning(f"Could not save prediction to database: {str(e)}")

        return jsonify(result), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in make_prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/predictions', methods=['GET'])
@require_auth
def get_my_predictions():
    """Get all predictions for the current user"""
    try:
        user_id = session.get('user_id')
        predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
        predictions_data = [pred.to_dict() for pred in predictions]

        logger.info(f"Retrieved {len(predictions_data)} predictions for user {user_id}")

        return jsonify({'predictions': predictions_data}), 200

    except Exception as e:
        logger.error(f"Error getting predictions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/dashboard', methods=['GET'])
@require_auth
def get_patient_dashboard():
    """Get patient dashboard data"""
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get recent predictions
        recent_predictions = Prediction.query.filter_by(user_id=user_id)\
                                           .order_by(Prediction.created_at.desc())\
                                           .limit(5).all()

        # Get active prescriptions
        active_prescriptions = Prescription.query.filter_by(patient_id=user_id)\
                                                .order_by(Prescription.prescribed_at.desc())\
                                                .limit(5).all()

        # Get total count
        total_predictions = Prediction.query.filter_by(user_id=user_id).count()

        # Get doctor info if assigned
        doctor = None
        if user.doctor_id:
            doctor = User.query.get(user.doctor_id)

        dashboard_data = {
            'user': user.to_dict(),
            'recent_predictions': [pred.to_dict() for pred in recent_predictions],
            'active_prescriptions': [pres.to_dict() for pres in active_prescriptions],
            'total_predictions': total_predictions,
            'doctor': doctor.to_dict() if doctor else None
        }

        return jsonify(dashboard_data), 200

    except Exception as e:
        logger.error(f"Error getting dashboard data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/<int:patient_id>/prescriptions', methods=['GET'])
@require_auth
def get_prescriptions(patient_id):
    """Get prescriptions for a patient"""
    try:
        user_id = session.get('user_id')

        # Check if user is accessing their own prescriptions or is a doctor
        user = User.query.get(user_id)
        if user.role != 'doctor' and user_id != patient_id:
            return jsonify({'error': 'Unauthorized access'}), 403

        prescriptions = Prescription.query.filter_by(patient_id=patient_id)\
                                         .order_by(Prescription.prescribed_at.desc()).all()

        return jsonify({
            'prescriptions': [pres.to_dict() for pres in prescriptions]
        }), 200

    except Exception as e:
        logger.error(f"Error getting prescriptions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/explanation', methods=['GET'])
@require_auth
def get_latest_explanation():
    """Get the latest prediction explanation"""
    try:
        result = prediction_service.get_latest_explanation()
        if result['success']:
            return jsonify(result['explanation']), 200
        else:
            return jsonify({'error': result.get('error', 'No recent prediction found')}), 404
    except Exception as e:
        logger.error(f"Error getting explanation: {str(e)}")
        return jsonify({'error': str(e)}), 500
