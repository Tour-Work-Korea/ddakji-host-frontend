import api from './axiosInstance';

const statisticsApi = {
  getSalesDashboard: (guesthouseId, yearMonth) =>
    api.get('/statistics/host/sales-dashboard', {
      params: { guesthouseId, yearMonth },
      withAuth: true,
    }),
  getReservationMetrics: (guesthouseId, yearMonth) =>
    api.get('/statistics/host/reservation-metrics', {
      params: { guesthouseId, yearMonth },
      withAuth: true,
    }),
};

export default statisticsApi;
