import api from './axiosInstance';

const buildAuthHeaders = jwtToken =>
  jwtToken
    ? {
        Authorization: `Bearer ${jwtToken}`,
      }
    : {};

const notificationApi = {
  upsertToken: ({deviceId, fcmToken}, jwtToken = null) =>
    api.post(
      '/notifications/token',
      {deviceId, fcmToken},
      {
        withAuth: false,
        headers: buildAuthHeaders(jwtToken),
      },
    ),

  logoutToken: jwtToken =>
    api.post(
      '/notifications/token/logout',
      {},
      {
        withAuth: false,
        headers: buildAuthHeaders(jwtToken),
      },
    ),

  readAll: () =>
    api.patch('/notifications/read-all'),

  getDetail: notificationId =>
    api.get(`/notifications/${notificationId}`),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  getMyNotifications: params =>
    api.get('/notifications/me', {
      params,
    }),
};

export default notificationApi;
