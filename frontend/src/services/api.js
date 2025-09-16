import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = null;
    this.axios = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable sending cookies with requests
    });

    // Attach Authorization header if token present
    this.axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      return config;
    });

    // Simple response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if (status === 401) {
          // Broadcast unauthorized event (except for explicit auth endpoints to avoid loops)
            window.dispatchEvent(new CustomEvent('auth-unauthorized'));
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setToken(token) {
    this.token = token;
  }

  // Generic methods
  get(url, config = {}) {
    console.log(`API GET Request to: ${this.axios.defaults.baseURL}${url}`, config);
    return this.axios.get(url, { ...config });
  }

  post(url, data, config = {}) {
    console.log(`API POST Request to: ${this.axios.defaults.baseURL}${url}`);
    console.log('POST Data being sent:', data);
    console.log('POST Headers:', { ...this.axios.defaults.headers, ...config.headers });
    return this.axios.post(url, data, { ...config });
  }

  put(url, data, config = {}) {
    return this.axios.put(url, data, { ...config });
  }

  delete(url, config = {}) {
    return this.axios.delete(url, { ...config });
  }

  // Doctor specific methods
  async getPatients() {
    return this.get('/doctor/patients');
  }

  async registerPatient(patientData) {
    return this.post('/doctor/register-patient', patientData);
  }

  async getPatientPredictions(patientId) {
    return this.get(`/doctor/patients/${patientId}/predictions`);
  }

  async createPrescription(patientId, prescriptionData) {
    return this.post(`/doctor/patients/${patientId}/prescriptions`, prescriptionData);
  }

  async exportPredictions(patientId) {
    const response = await this.get(`/doctor/patients/${patientId}/predictions/export`, {
      responseType: 'blob'
    });
    return response;
  }

  async getDoctorPatientPrescriptions(patientId) {
    return this.get(`/doctor/patients/${patientId}/prescriptions`);
  }

  // Patient specific methods
  async makePrediction(predictionData) {
    return this.post('/patients/predict', predictionData);
  }

  async makePredictionWithFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.post('/patients/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getMyPredictions() {
    return this.get('/patients/predictions');
  }

  async getPrescriptions(patientId) {
    return this.get(`/patients/${patientId}/prescriptions`);
  }

  async getPatientDashboard() {
    return this.get('/patients/dashboard');
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Auth methods
  async logout() {
    return this.post('/auth/logout', {});
  }
}

const api = new ApiService();
export default api;
