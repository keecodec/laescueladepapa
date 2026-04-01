import axios from 'axios';

// Instance customisée pour inclure automatiquement les cookies de session (RBAC)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true 
});

// Middleware client pour la récupération du token CSRF Flask-WTF
// Obligatoire avant toute requête impactant l'état (POST, PUT, DELETE)
export const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get('/csrf-token');
    // Configure Axios pour toujours envoyer le token via le header 'X-CSRFToken'
    api.defaults.headers.common['X-CSRFToken'] = data.csrf_token;
    return data.csrf_token;
  } catch {
    return null;
  }
};

export default api;
