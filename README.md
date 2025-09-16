# Anemia Prediction Full-Stack Application

A production-ready web application for anemia prediction using a trained deep learning model. The application provides role-based access for doctors and patients, with comprehensive prediction and prescription management features.

## Tech Stack

### Backend
- Python 3.9+ with Flask
- Flask-RESTful for API endpoints
- Flask-JWT-Extended for authentication
- SQLAlchemy ORM with PostgreSQL/SQLite
- Keras/TensorFlow for model inference
- SHAP for prediction explanations

### Frontend
- React with Create React App
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

### Infrastructure
- Docker and Docker Compose
- PostgreSQL database
- CORS enabled

## Project Structure

```
anemia-prediction/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── models/
│   └── anemia_dl_model.h5
├── sample_data/
│   └── sample_input.csv
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start with Docker

1. Clone the repository and navigate to the project directory
2. Copy the environment file and update values:
   ```bash
   cp .env.example .env
   ```
3. Build and run the application:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Manual Setup

### Backend Setup

1. Create and activate virtual environment:
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set environment variables:
   ```bash
   # Windows
   set FLASK_APP=app.py
   set FLASK_ENV=development
   set SECRET_KEY=your-secret-key
   set JWT_SECRET_KEY=your-jwt-secret
   set DATABASE_URL=sqlite:///anemia_app.db
   
   # Linux/Mac
   export FLASK_APP=app.py
   export FLASK_ENV=development
   export SECRET_KEY=your-secret-key
   export JWT_SECRET_KEY=your-jwt-secret
   export DATABASE_URL=sqlite:///anemia_app.db
   ```

4. Initialize database:
   ```bash
   flask db upgrade
   ```

5. Run the backend:
   ```bash
   flask run
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register-doctor` - Register a new doctor
- `POST /api/auth/login` - Login (both doctors and patients)

### Doctor Endpoints
- `GET /api/doctor/patients` - List doctor's patients
- `POST /api/doctor/register-patient` - Register a new patient
- `GET /api/doctor/patients/<id>/predictions` - View patient predictions
- `POST /api/doctor/patients/<id>/prescriptions` - Create/update prescription
- `GET /api/doctor/patients/<id>/predictions/export` - Export predictions as CSV

### Patient Endpoints
- `POST /api/predict` - Make anemia prediction
- `GET /api/patients/<id>/prescriptions` - View prescriptions

## Testing

Run backend tests:
```bash
cd backend
pytest tests/
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Model Replacement

To replace the anemia prediction model:

1. Place your new `.h5` model file in the `models/` directory
2. Update the model path in `backend/config.py`
3. Ensure your model expects the same input features: Gender, Hemoglobin, MCH, MCHC, MCV
4. Update preprocessing parameters if needed in `backend/services/prediction_service.py`

## Production Deployment

### Security Considerations

1. Use strong, unique secrets for `SECRET_KEY` and `JWT_SECRET_KEY`
2. Use PostgreSQL instead of SQLite
3. Enable HTTPS/TLS
4. Implement rate limiting
5. Add input validation and sanitization
6. Use environment variables for all sensitive data
7. Implement proper logging and monitoring
8. Add database backups
9. Use a reverse proxy (nginx)
10. Implement proper error handling

### Environment Variables

Required environment variables:
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT signing key
- `DATABASE_URL` - Database connection string
- `MODEL_PATH` - Path to the ML model file
- `FLASK_ENV` - Flask environment (development/production)

## Sample Data

Use the provided `sample_input.csv` file for testing predictions. The file contains sample patient data with the required features.

## Support

For issues or questions, refer to the API documentation or check the test files for usage examples.
