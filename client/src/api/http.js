import axios from 'axios'
const api = axios.create({ 
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', 
    withCredentials: true 
})

let accessToken = null; 
let onSessionRefresh = null;

export function setAccessToken(token) { 
    accessToken = token 
}

export function setSessionRefreshHandler(handler) { 
    onSessionRefresh = handler 
}

api.interceptors.request.use((config) => {
     if (accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`; 
        return config 
     }
})

api.interceptors.response.use(undefined, async (error) => {
     const original = error.config; 
     if (error.response?.status !== 401 || original?._retried || original?.url?.includes('/auth/refresh-token')) return Promise.reject(error); 
     original._retried = true;
     
    try { 
        const { data } = await api.post('/auth/refresh-token');
        setAccessToken(data.accessToken); 
        onSessionRefresh?.(data); 
        original.headers.Authorization = `Bearer ${data.accessToken}`; 
        return api(original) 
    } catch (refreshError) { 
        setAccessToken(null); 
        onSessionRefresh?.(null); 
        return Promise.reject(refreshError);
    } 
});

export default api;
