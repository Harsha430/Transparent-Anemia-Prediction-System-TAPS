# Transparent Anemia Prediction System (TAPS) 🩸

A comprehensive full-stack web application for anemia prediction with **Explainable AI (XAI)** capabilities. TAPS provides transparent, interpretable machine learning predictions with SHAP-based explanations, enabling healthcare professionals and patients to understand the reasoning behind each prediction.

## 🌟 Key Features

### 🤖 Explainable AI (XAI) Integration
- **SHAP Analysis**: Feature contribution explanations for every prediction
- **Visual Explanations**: Interactive charts showing risk factors
- **Clinical Interpretations**: Medical context and recommendations
- **Rule-Based Fallback**: Enhanced prediction system when ML models are unavailable

### 👥 Role-Based Access Control
- **Patient Portal**: Personal health tracking and prediction history
- **Doctor Dashboard**: Patient management and prescription system
- **Session-Based Authentication**: Secure, persistent login sessions

### 📊 Advanced Prediction System
- **Multiple Input Methods**: Manual entry or CSV file upload
- **Real-Time Validation**: Medical range validation for lab values
- **Comprehensive Results**: Risk levels, confidence scores, and explanations
- **Prediction History**: Track and review past predictions

### 🎨 Modern User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Intuitive Navigation**: Clean, medical-grade UI/UX
- **Real-Time Feedback**: Loading states and error handling
- **Accessibility**: WCAG compliant design

## 🏗️ Tech Stack

### Backend
- **Framework**: Flask (Python 3.9+)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Session-based with Flask sessions
- **ML/AI**: TensorFlow/Keras, SHAP, Plotly for visualizations
- **API**: RESTful endpoints with comprehensive error handling
- **CORS**: Full cross-origin support for frontend integration

### Frontend
- **Framework**: React 18 with Create React App
- **Routing**: React Router for SPA navigation
- **Styling**: Tailwind CSS for responsive design
- **HTTP Client**: Axios with credential support
- **State Management**: React Context for authentication

### DevOps & Infrastructure
- **Containerization**: Docker and Docker Compose ready
- **Version Control**: Git with comprehensive .gitignore
- **Environment**: Configurable for development/production
- **Database**: Automatic schema migration support

## 📁 Project Structure

```
Transparent-Anemia-Prediction-System-TAPS/
├── backend/                          # Flask API backend
│   ├── app.py                       # Main Flask application
│   ├── config.py                    # Configuration settings
│   ├── seed_data.py                 # Database seeding script
│   ├── models/                      # Database models
│   │   └── __init__.py              # User, Prediction, Prescription models
│   ├── routes/                      # API route handlers
│   │   ├── auth.py                  # Authentication endpoints
│   │   ├── patient.py               # Patient-specific endpoints
│   │   └── doctor.py                # Doctor-specific endpoints
│   ├── services/                    # Business logic services
│   │   └── prediction_service.py    # ML prediction with XAI
│   ├── tests/                       # Unit and integration tests
│   ├── instance/                    # SQLite database storage
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Backend container config
├── frontend/                        # React frontend application
│   ├── src/
│   │   ├── App.js                   # Main React application
│   │   ├── components/              # React components
│   │   │   ├── LoginPage.js         # Authentication interface
│   │   │   ├── PatientDashboard.js  # Patient portal
│   │   │   ├── DoctorDashboard.js   # Doctor interface
│   │   │   ├── PredictionForm.js    # Prediction input form
│   │   │   ├── XAIExplanation.js    # XAI visualization component
│   │   │   ├── Navbar.js            # Navigation component
│   │   │   └── ...                  # Additional components
│   │   ├── context/                 # React context providers
│   │   │   └── AuthContext.js       # Authentication state
│   │   └── services/                # API integration
│   │       └── api.js               # Axios HTTP client
│   ├── public/                      # Static assets
│   ├── package.json                 # Node.js dependencies
│   └── Dockerfile                   # Frontend container config
├── sample_data/                     # Example datasets
│   └── sample_input.csv             # Sample prediction data
├── instance/                        # Database files
│   └── anemia_app.db               # SQLite database
├── docker-compose.yml              # Multi-container orchestration
├── .gitignore                      # Git ignore rules
├── .env.example                    # Environment template
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Harsha430/Transparent-Anemia-Prediction-System-TAPS-.git
cd Transparent-Anemia-Prediction-System-TAPS
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python seed_data.py

# Start backend server
python app.py
```
Backend will be available at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
Frontend will be available at `http://localhost:3000`

### 4. Test Credentials
- **Patient Login**: `patient@email.com` / `patient123`
- **Doctor Login**: `doctor@hospital.com` / `doctor123`

## 🐋 Docker Deployment

### Quick Start with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Individual Container Management
```bash
# Backend only
docker build -t taps-backend ./backend
docker run -p 5000:5000 taps-backend

# Frontend only
docker build -t taps-frontend ./frontend
docker run -p 3000:3000 taps-frontend
```

## 📋 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
GET  /api/auth/profile        # Get user profile
POST /api/auth/logout         # User logout
POST /api/auth/register-doctor # Register new doctor
```

### Patient Endpoints
```
POST /api/patients/predict           # Make anemia prediction
GET  /api/patients/dashboard         # Patient dashboard data
GET  /api/patients/predictions       # Prediction history
GET  /api/patients/explanation       # Latest prediction explanation
```

### Doctor Endpoints
```
GET  /api/doctor/patients            # List all patients
POST /api/doctor/register-patient    # Register new patient
GET  /api/doctor/patients/:id/predictions # Patient's predictions
POST /api/doctor/patients/:id/prescriptions # Create prescription
```

## 🧪 Testing the System

### Sample Test Cases

**Iron Deficiency Anemia (Positive Case):**
```json
{
  "Gender": 0,
  "Hemoglobin": 9.5,
  "MCH": 22.0,
  "MCHC": 29.0,
  "MCV": 70.0
}
```

**Normal Values (Negative Case):**
```json
{
  "Gender": 1,
  "Hemoglobin": 14.5,
  "MCH": 30.0,
  "MCHC": 34.0,
  "MCV": 88.0
}
```

**Using CSV Upload:**
Upload the provided `sample_data/sample_input.csv` file through the web interface.

## 🔬 Explainable AI Features

### SHAP Integration
- **Feature Contributions**: See how each lab value affects the prediction
- **Visual Explanations**: Interactive charts and force plots
- **Base vs. Prediction Values**: Understand model decision boundaries

### Clinical Interpretations
- **Risk Level Assessment**: Low, Moderate, High risk categories
- **Medical Recommendations**: Actionable clinical advice
- **Lab Value Analysis**: Interpretation of each blood parameter

### Fallback Intelligence
- **Rule-Based Predictions**: Clinical guideline-based predictions when ML is unavailable
- **Enhanced Accuracy**: Combines medical knowledge with data science
- **Transparent Logic**: Clear explanation of decision factors

## 🛠️ Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///instance/anemia_app.db

# ML Model Configuration
MODEL_PATH=./anemia_dl_model.h5

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### Medical Parameter Ranges
The system validates input within realistic medical ranges:
- **Hemoglobin**: 3.0-25.0 g/dL
- **MCH**: 10.0-50.0 pg
- **MCHC**: 20.0-45.0 g/dL
- **MCV**: 50.0-130.0 fL

## 📊 System Capabilities

### Prediction Accuracy
- **Enhanced Rule-Based Model**: Clinical guideline compliance
- **Multi-Factor Analysis**: Considers all key anemia indicators
- **Confidence Scoring**: Transparent uncertainty quantification

### Scalability Features
- **Session Management**: Efficient user state handling
- **Database Optimization**: Indexed queries and efficient schema
- **API Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Comprehensive error recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript code
- Write comprehensive tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Medical Guidelines**: Based on WHO and clinical anemia diagnostic criteria
- **SHAP Library**: For explainable AI implementations
- **React Community**: For frontend framework and components
- **Flask Ecosystem**: For robust backend infrastructure

## 📞 Support

For support, contact in LinkedIn or create an issue in the GitHub repository.

## 🔄 Version History

- **v1.0.0** (2025-09-16): Initial release with XAI explanations
  - Complete TAPS implementation
  - SHAP-based explainable AI
  - Session-based authentication
  - Responsive React frontend
  - Comprehensive API documentation

---

**Built with ❤️ for transparent, explainable healthcare AI**
