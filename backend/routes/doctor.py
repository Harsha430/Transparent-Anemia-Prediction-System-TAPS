from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Prediction, Prescription
from routes.auth import generate_password
from datetime import datetime, date
import csv
import io

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    """Get list of all patients (requires authentication)"""
    try:
        patients = User.query.filter_by(role='user').all()

        patients_data = []
        for patient in patients:
            patient_dict = patient.to_dict()
            # Add prediction count
            prediction_count = Prediction.query.filter_by(user_id=patient.id).count()
            patient_dict['prediction_count'] = prediction_count
            patients_data.append(patient_dict)

        print(f"Retrieved {len(patients_data)} patients")
        return jsonify({'patients': patients_data}), 200

    except Exception as e:
        print(f"Error getting patients: {str(e)}")
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/register-patient', methods=['POST'])
@jwt_required()
def register_patient():
    """Register a new patient (requires authentication)"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['patient_name', 'patient_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Check if email already exists
        if User.query.filter_by(email=data['patient_email']).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Use provided password or generate one
        temp_password = data.get('password') or generate_password()

        # Parse date of birth if provided
        dob = None
        if data.get('dob'):
            try:
                dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        # Create new patient (assign to first doctor for simplicity)
        first_doctor = User.query.filter_by(role='doctor').first()
        doctor_id = first_doctor.id if first_doctor else None

        patient = User(
            name=data['patient_name'],
            email=data['patient_email'].lower(),
            role='user',
            doctor_id=doctor_id,
            date_of_birth=dob,
            gender=data.get('gender')  # 0 or 1
        )
        patient.set_password(temp_password)

        db.session.add(patient)
        db.session.commit()

        print(f"Registered new patient: {patient.email}")

        return jsonify({
            'message': 'Patient registered successfully',
            'patient': patient.to_dict(),
            'temporary_password': temp_password
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error registering patient: {str(e)}")
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patients/<int:patient_id>/predictions', methods=['GET'])
@jwt_required()
def get_patient_predictions(patient_id):
    """Get predictions for a specific patient"""
    try:
        # Verify patient exists
        patient = User.query.filter_by(id=patient_id, role='user').first()
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        predictions = Prediction.query.filter_by(user_id=patient_id).order_by(
            Prediction.created_at.desc()
        ).all()

        predictions_data = [pred.to_dict() for pred in predictions]

        print(f"Retrieved {len(predictions_data)} predictions for patient {patient_id}")

        return jsonify({
            'patient': patient.to_dict(),
            'predictions': predictions_data
        }), 200

    except Exception as e:
        print(f"Error getting patient predictions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patients/<int:patient_id>/predictions/export', methods=['GET'])
@jwt_required()
def export_patient_predictions(patient_id):
    """Export patient predictions as CSV"""
    try:
        # Verify patient exists
        patient = User.query.filter_by(id=patient_id, role='user').first()
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        predictions = Prediction.query.filter_by(user_id=patient_id).order_by(
            Prediction.created_at.desc()
        ).all()

        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # Write headers
        writer.writerow([
            'Date', 'Gender', 'Hemoglobin', 'MCH', 'MCHC', 'MCV',
            'Predicted_Label', 'Probability', 'Risk_Level'
        ])

        # Write data
        for pred in predictions:
            features = pred.get_input_features()
            risk_level = 'High' if pred.predicted_proba > 0.7 else 'Moderate' if pred.predicted_proba > 0.3 else 'Low'

            writer.writerow([
                pred.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'Male' if features.get('Gender') == 1 else 'Female',
                features.get('Hemoglobin', ''),
                features.get('MCH', ''),
                features.get('MCHC', ''),
                features.get('MCV', ''),
                'Anemic' if pred.predicted_label == 1 else 'Not Anemic',
                f"{pred.predicted_proba:.3f}",
                risk_level
            ])

        # Create response
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=patient_{patient_id}_predictions.csv'

        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patients/<int:patient_id>/prescriptions', methods=['POST', 'GET'])
@jwt_required()
def manage_prescriptions(patient_id):
    """Create/update or get prescriptions for a patient"""
    try:
        # Verify patient exists
        patient = User.query.filter_by(id=patient_id, role='user').first()
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        if request.method == 'POST':
            # Create/update prescription
            data = request.get_json()

            if not data.get('title'):
                return jsonify({'error': 'Prescription title is required'}), 400

            # Parse expiry date if provided
            expires_at = None
            if data.get('expires_at'):
                try:
                    expires_at = datetime.strptime(data['expires_at'], '%Y-%m-%d')
                except ValueError:
                    return jsonify({'error': 'Invalid expiry date format. Use YYYY-MM-DD'}), 400

            prescription = Prescription(
                patient_id=patient_id,
                doctor_id=patient.doctor_id,  # Use patient's doctor
                title=data['title'],
                notes=data.get('notes', ''),
                expires_at=expires_at
            )

            if data.get('medications'):
                prescription.set_medications(data['medications'])

            db.session.add(prescription)
            db.session.commit()

            return jsonify({
                'message': 'Prescription created successfully',
                'prescription': prescription.to_dict()
            }), 201

        else:
            # Get prescriptions
            prescriptions = Prescription.query.filter_by(
                patient_id=patient_id
            ).order_by(Prescription.created_at.desc()).all()

            prescriptions_data = [presc.to_dict() for presc in prescriptions]

            return jsonify({
                'patient': patient.to_dict(),
                'prescriptions': prescriptions_data
            }), 200

    except Exception as e:
        if request.method == 'POST':
            db.session.rollback()
        return jsonify({'error': str(e)}), 500
