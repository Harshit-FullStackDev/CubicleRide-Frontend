import axios from 'axios';
import { getToken, clearSession, isExpired } from '../utils/auth';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://api-gateway.jollyhill-fb788985.centralindia.azurecontainerapps.io';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        if (isExpired(token)) {
            clearSession();
            return Promise.reject(new axios.Cancel('Token expired'));
        }
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            clearSession();
            setTimeout(() => { window.location.href = '/login'; }, 0);
        }
        return Promise.reject(error);
    }
);

export default api;
