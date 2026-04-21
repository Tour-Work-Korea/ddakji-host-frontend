import api from './axiosInstance';

const orderApi = {
  // 예약 대시보드 (홈 화면 용)
  // GET /api/v1/order/host/reservation/dashboard
  getReservationDashboard: (guesthouseId, hostId, baseDate, previewLimit = 5) =>
    api.get('/order/host/reservation/dashboard', {
      params: { guesthouseId, hostId, baseDate, previewLimit },
      withAuth: true,
    }),
};

export default orderApi;
