import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///../instance/anemia_app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = False  # Tokens don't expire for demo
    MODEL_PATH = os.environ.get('MODEL_PATH') or './anemia_dl_model.h5'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')

    # Feature preprocessing parameters (derived from typical anemia datasets)
    FEATURE_MEANS = {
        'Hemoglobin': 12.5,
        'MCH': 28.0,
        'MCHC': 33.5,
        'MCV': 85.0
    }

    FEATURE_STDS = {
        'Hemoglobin': 2.5,
        'MCH': 4.0,
        'MCHC': 2.0,
        'MCV': 8.0
    }
