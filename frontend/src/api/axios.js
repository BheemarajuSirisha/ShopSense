import axios from 'axios';
import toast from 'react-hot-toast';

// Determine base URL: environment variable or Vite proxy fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for unified error toasts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const data = error.response.data;
      if (data && data.detail) {
        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (data.detail.message) {
          message = data.detail.message;
          if (Array.isArray(data.detail.errors) && data.detail.errors.length > 0) {
            message += `: ${data.detail.errors.join(', ')}`;
          }
        } else if (Array.isArray(data.detail)) {
          message = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        }
      } else if (error.response.status === 404) {
        message = 'Requested resource not found.';
      } else if (error.response.status === 409) {
        message = 'A conflicting record already exists.';
      } else if (error.response.status >= 500) {
        message = 'Backend server error. Check database connection.';
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Ensure FastAPI is running on port 8000.';
    }

    toast.error(message, {
      style: {
        background: '#4A0D3F',
        color: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #F6D3E6',
        fontSize: '13px',
        fontWeight: '500',
        boxShadow: '0 8px 24px rgba(181, 23, 158, 0.15)',
      },
      iconTheme: {
        primary: '#E14DB0',
        secondary: '#FFFFFF',
      },
    });

    return Promise.reject(error);
  }
);

export default apiClient;
