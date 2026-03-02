import axios from 'axios';
import { showToast } from '../components/common/Toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('original_token');
            localStorage.removeItem('impersonated_org_name');
            window.location.href = '/login';
        }

        if (status === 403) {
            showToast('Access denied. You do not have permission to perform this action.');
            window.dispatchEvent(new Event('auth:forbidden'));
        }

        const serverData = error.response?.data || {};
        const enriched = {
            ...serverData,
            status: status || null,
            message:
                serverData.message ||
                (status === 403
                    ? 'Access denied. You do not have permission to perform this action.'
                    : status === 404
                        ? 'Resource not found.'
                        : error.message || 'An unexpected error occurred.'),
        };

        return Promise.reject(enriched);
    }
);

export default api;
