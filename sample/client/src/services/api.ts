import axios from 'axios';

const api = axios.create({
	baseURL: '/api', // Use relative path for proxy
	withCredentials: true, // Send cookies with requests
});

export default api;
