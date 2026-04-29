import api from './axiosInstance';

const presenceApi = {
  heartbeat: () => api.post('/host/presence/heartbeat'),
};

export default presenceApi;
