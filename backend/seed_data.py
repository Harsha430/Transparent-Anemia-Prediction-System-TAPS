from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, User, Prediction, Prescription
from config import Config
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    migrate = Migrate(app, db)
    return app

if __name__ == '__main__':
    print('Seed script started')
    try:
        app = create_app()

        with app.app_context():
            print('Creating tables...')
            # Force model registration
            _ = User, Prediction, Prescription
            # Create all tables
            db.create_all()
            print('Tables created')

            # Create sample doctor if not exists
            doctor_email = "doctor@hospital.com"
            doctor = User.query.filter_by(email=doctor_email).first()
            if not doctor:
                doctor = User(
                    name="Dr. Sarah Johnson",
                    email=doctor_email,
                    role="doctor",
                    hospital="General Hospital"
                )
                doctor.set_password("doctor123")
                db.session.add(doctor)
                db.session.commit()
                print("Doctor created.")
            else:
                print("Doctor already exists.")

            # Always create or update sample patient
            patient_email = "patient@email.com"
            patient = User.query.filter_by(email=patient_email).first()
            if not patient:
                patient = User(
                    name="John Doe",
                    email=patient_email,
                    role="user",
                    doctor_id=doctor.id,
                    gender=1  # Male
                )
                patient.set_password("patient123")
                db.session.add(patient)
                db.session.commit()
                print("Patient created.")
            else:
                patient.set_password("patient123")
                db.session.commit()
                print("Patient password reset.")

            # Print all users for debugging
            print("All users in database:")
            for user in User.query.all():
                print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}")

            print("Doctor login: doctor@hospital.com / doctor123")
            print("Patient login: patient@email.com / patient123")

    except Exception as e:
        print(f"Seed script error: {e}")
        import traceback
        traceback.print_exc()
