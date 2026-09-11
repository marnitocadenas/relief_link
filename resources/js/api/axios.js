import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL || '/api',headers:{Accept:'application/json'}});
api.interceptors.request.use(c=>{const token=localStorage.getItem('relieflink_token');if(token)c.headers.Authorization=`Bearer ${token}`;return c;});
api.interceptors.response.use(response=>{
    const method=(response.config.method||'get').toLowerCase();
    const url=response.config.url||'';
    const changesNotificationSource=['post','put','patch','delete'].includes(method)
        && !url.startsWith('/notifications')
        && /^\/(requests|donations|matches|admin\/requests|admin\/matches)(?:\/|$)/.test(url);
    if(changesNotificationSource&&typeof window!=='undefined') window.dispatchEvent(new Event('relieflink:notification-source-changed'));
    return response;
});
export default api;
