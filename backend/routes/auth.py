from flask import Blueprint, request, jsonify, session
from models import db, User
import logging
import secrets
import string

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

def generate_password(length=8):
    """Generate a random password for patient accounts"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

@auth_bp.route('/login', methods=['POST'])
def login():
    """Simple session-based login for both doctors and patients"""
    try:
        data = request.get_json()
        logger.info(f"Login attempt for email: {data.get('email')}")

        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user
        user = User.query.filter_by(email=data['email'].lower()).first()

        if not user or not user.check_password(data['password']):
            logger.warning(f"Login failed for email: {data.get('email')}")
            return jsonify({'error': 'Invalid email or password'}), 401

        # Store user info in session
        session['user_id'] = user.id
        session['user_role'] = user.role
        session.permanent = True

        logger.info(f"User {user.email} logged in successfully with role {user.role}")

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'authenticated': True
        }), 200

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get current user profile from session"""
    try:
        user_id = session.get('user_id')
        user_role = session.get('user_role')

        logger.info(f"Profile request - Session ID: {user_id}, Role: {user_role}")

        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401

        # Get user from database
        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({'error': 'User not found'}), 401

        return jsonify({
            'user': user.to_dict(),
            'authenticated': True
        }), 200

    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user by clearing session"""
    try:
        user_id = session.get('user_id')
        if user_id:
            logger.info(f"User {user_id} logged out")

        session.clear()
        return jsonify({'message': 'Logged out successfully'}), 200

    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register-doctor', methods=['POST'])
def register_doctor():
    """Register a new doctor"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'email', 'password', 'hospital']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Check if email already exists
        if User.query.filter_by(email=data['email'].lower()).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Create new doctor
        doctor = User(
            name=data['name'],
            email=data['email'].lower(),
            role='doctor',
            hospital=data['hospital']
        )
        doctor.set_password(data['password'])

        db.session.add(doctor)
        db.session.commit()

        # Auto-login the new doctor
        session['user_id'] = doctor.id
        session['user_role'] = doctor.role
        session.permanent = True

        logger.info(f"New doctor registered: {doctor.email}")

        return jsonify({
            'message': 'Doctor registered successfully',
            'user': doctor.to_dict(),
            'authenticated': True
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Doctor registration error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    try:
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            if user:
                return jsonify({
                    'authenticated': True,
                    'user': user.to_dict()
                }), 200

        return jsonify({'authenticated': False}), 200

    except Exception as e:
        logger.error(f"Auth check error: {str(e)}")
        return jsonify({'error': str(e)}), 500
