import api from './axiosInstance';

// baseURL에서 /api/v1 제거
const API_ORIGIN = (process.env.API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');

const adminApi = {
  // 메인 화면 배너 이미지 3개 조회
  getAdminBanners: () =>
    api.get('/admin/adminImage-list', {
      baseURL: API_ORIGIN,
      withAuth: false,
    }),

  // 이벤트 화면 배너 이미지 3개 조회
  getMeetAdminBanners: () =>
    api.get('/admin/partyBanner-list', {
      baseURL: API_ORIGIN,
      withAuth: false,
    }),

  // 홈 공지사항 조회
  getHomeNotices: () =>
    api.get('/host/notices/home', {
      withAuth: false,
    }),

  // 공지사항 목록 조회
  getAdminNotices: ({category, q, page} = {}) =>
    api.get('/host/notices', {
      withAuth: false,
      params: {
        ...(category ? {category} : {}),
        ...(q ? {q} : {}),
        ...(typeof page === 'number' && page > 0 ? {page} : {}),
      },
    }),

  // 공지사항 상세 조회
  getAdminNoticeDetail: noticeId =>
    api.get(`/host/notices/${noticeId}`, {
      withAuth: false,
    }),
};

export default adminApi;
