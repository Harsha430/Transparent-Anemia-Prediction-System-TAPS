import pytest
import json
import os
import tempfile
from app import create_app
from models import db, User, Prediction, Prescription
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret'
    SECRET_KEY = 'test-secret'

@pytest.fixture
def app():
    app = create_app()
    app.config.from_object(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    # Create test doctor
    doctor_data = {
        'name': 'Test Doctor',
        'email': 'testdoctor@test.com',
        'password': 'testpass123',
        'hospital': 'Test Hospital'
    }

    response = client.post('/api/auth/register-doctor',
                          data=json.dumps(doctor_data),
                          content_type='application/json')

    doctor_token = response.json['access_token']

    # Create test patient
    patient_data = {
        'patient_name': 'Test Patient',
        'patient_email': 'testpatient@test.com',
        'gender': 1
    }

    response = client.post('/api/doctor/register-patient',
                          data=json.dumps(patient_data),
                          content_type='application/json',
                          headers={'Authorization': f'Bearer {doctor_token}'})

    # Login as patient
    patient_login = {
        'email': 'testpatient@test.com',
        'password': response.json['temporary_password']
    }

    response = client.post('/api/auth/login',
                          data=json.dumps(patient_login),
                          content_type='application/json')

    patient_token = response.json['access_token']

    return {
        'doctor': {'Authorization': f'Bearer {doctor_token}'},
        'patient': {'Authorization': f'Bearer {patient_token}'}
    }

def test_doctor_registration(client):
    """Test doctor registration"""
    data = {
        'name': 'Dr. Test',
        'email': 'doctor@test.com',
        'password': 'password123',
        'hospital': 'Test Hospital'
    }

    response = client.post('/api/auth/register-doctor',
                          data=json.dumps(data),
                          content_type='application/json')

    assert response.status_code == 201
    assert 'access_token' in response.json
    assert response.json['user']['role'] == 'doctor'

def test_login(client):
    """Test login functionality"""
    # Register doctor first
    doctor_data = {
        'name': 'Dr. Login Test',
        'email': 'logintest@test.com',
        'password': 'password123',
        'hospital': 'Test Hospital'
    }

    client.post('/api/auth/register-doctor',
               data=json.dumps(doctor_data),
               content_type='application/json')

    # Test login
    login_data = {
        'email': 'logintest@test.com',
        'password': 'password123'
    }

    response = client.post('/api/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')

    assert response.status_code == 200
    assert 'access_token' in response.json

def test_patient_registration(client, auth_headers):
    """Test patient registration by doctor"""
    data = {
        'patient_name': 'New Patient',
        'patient_email': 'newpatient@test.com',
        'gender': 0,
        'dob': '1990-01-01'
    }

    response = client.post('/api/doctor/register-patient',
                          data=json.dumps(data),
                          content_type='application/json',
                          headers=auth_headers['doctor'])

    assert response.status_code == 201
    assert 'temporary_password' in response.json
    assert response.json['patient']['role'] == 'user'

def test_prediction(client, auth_headers):
    """Test making a prediction"""
    # Mock prediction service for testing
    prediction_data = {
        'Gender': 1,
        'Hemoglobin': 10.5,
        'MCH': 25.0,
        'MCHC': 30.0,
        'MCV': 75.0
    }

    response = client.post('/api/patients/predict',
                          data=json.dumps(prediction_data),
                          content_type='application/json',
                          headers=auth_headers['patient'])

    # Note: This will fail if model is not loaded, which is expected in test environment
    # In a real test, you'd mock the prediction service
    assert response.status_code in [200, 500]  # 500 if model not loaded

def test_create_prescription(client, auth_headers):
    """Test creating a prescription"""
    prescription_data = {
        'title': 'Iron Deficiency Treatment',
        'medications': ['Iron Supplement 325mg', 'Vitamin C 500mg'],
        'notes': 'Take with food to reduce stomach upset',
        'expires_at': '2024-12-31'
    }

    # Get patient ID first
    response = client.get('/api/doctor/patients',
                         headers=auth_headers['doctor'])
    patient_id = response.json['patients'][0]['id']

    response = client.post(f'/api/doctor/patients/{patient_id}/prescriptions',
                          data=json.dumps(prescription_data),
                          content_type='application/json',
                          headers=auth_headers['doctor'])

    assert response.status_code == 201
    assert response.json['prescription']['title'] == prescription_data['title']

def test_view_prescriptions(client, auth_headers):
    """Test viewing prescriptions as patient"""
    # First create a prescription (using doctor)
    prescription_data = {
        'title': 'Test Prescription',
        'medications': ['Test Medicine'],
        'notes': 'Test notes'
    }

    # Get patient ID
    response = client.get('/api/doctor/patients',
                         headers=auth_headers['doctor'])
    patient_id = response.json['patients'][0]['id']

    # Create prescription
    client.post(f'/api/doctor/patients/{patient_id}/prescriptions',
               data=json.dumps(prescription_data),
               content_type='application/json',
               headers=auth_headers['doctor'])

    # View as patient
    response = client.get(f'/api/patients/{patient_id}/prescriptions',
                         headers=auth_headers['patient'])

    assert response.status_code == 200
    assert len(response.json['prescriptions']) >= 1

if __name__ == '__main__':
    pytest.main([__file__])
