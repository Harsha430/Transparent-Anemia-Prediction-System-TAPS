from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import json

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'doctor' or 'user'
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    hospital = db.Column(db.String(200), nullable=True)  # For doctors
    date_of_birth = db.Column(db.Date, nullable=True)  # For patients
    gender = db.Column(db.Integer, nullable=True)  # For patients: 0=female, 1=male
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    patients = db.relationship('User', backref=db.backref('doctor', remote_side=[id]))
    predictions = db.relationship('Prediction', backref='user', lazy='dynamic')
    prescriptions_received = db.relationship('Prescription',
                                           foreign_keys='Prescription.patient_id',
                                           backref='patient', lazy='dynamic')
    prescriptions_given = db.relationship('Prescription',
                                        foreign_keys='Prescription.doctor_id',
                                        backref='doctor', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'hospital': self.hospital,
            'doctor_id': self.doctor_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Prediction(db.Model):
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    input_features = db.Column(db.Text, nullable=False)  # JSON string
    predicted_label = db.Column(db.Integer, nullable=False)  # 0 or 1
    predicted_proba = db.Column(db.Float, nullable=False)
    explanation = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_input_features(self):
        return json.loads(self.input_features)

    def set_input_features(self, features_dict):
        self.input_features = json.dumps(features_dict)

    def get_explanation(self):
        return json.loads(self.explanation) if self.explanation else None

    def set_explanation(self, explanation_dict):
        self.explanation = json.dumps(explanation_dict)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'input_features': self.get_input_features(),
            'predicted_label': self.predicted_label,
            'predicted_proba': self.predicted_proba,
            'explanation': self.get_explanation(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    medications = db.Column(db.Text, nullable=True)  # JSON array
    notes = db.Column(db.Text, nullable=True)
    prescribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_medications(self):
        return json.loads(self.medications) if self.medications else []

    def set_medications(self, medications_list):
        self.medications = json.dumps(medications_list)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'title': self.title,
            'medications': self.get_medications(),
            'notes': self.notes,
            'prescribed_at': self.prescribed_at.isoformat() if self.prescribed_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
