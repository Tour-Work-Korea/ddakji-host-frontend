import api from './axiosInstance';

const settlementApi = {
  // 정산 메인(요약) 데이터 조회
  // GET /api/v1/settlement/host/overview?guesthouseId={id}&yearMonth=YYYY-MM
  getSettlementOverview: (guesthouseId, yearMonth) =>
    api.get('/settlement/host/overview', {
      params: {guesthouseId, yearMonth},
      withAuth: true, // 로그인 토큰 필요
    }),

  // 정산용 공식 은행 목록 조회
  // GET /api/v1/settlement/host/banks
  getSettlementBanks: () =>
    api.get('/settlement/host/banks', {
      withAuth: true,
    }),

  // 정산 계좌 조회
  // GET /api/v1/settlement/host/accounts?guesthouseId={id}
  getSettlementAccount: (guesthouseId) =>
    api.get('/settlement/host/accounts', {
      params: {guesthouseId},
      withAuth: true,
    }),

  // 정산 계좌 변경 신청
  // POST /api/v1/settlement/host/accounts/change-requests
  requestSettlementAccountChange: (guesthouseId, payload) =>
    api.post('/settlement/host/accounts/change-requests', payload, {
      params: {guesthouseId},
      withAuth: true,
    }),

  // 정산 계좌 증빙 파일용 Presigned URL 발급
  // POST /api/v1/settlement/host/accounts/presigned
  getAccountPresignedUrl: (guesthouseId, filename, contentType) =>
    api.post('/settlement/host/accounts/presigned', {}, {
      params: {guesthouseId, filename, contentType},
      withAuth: true,
    }),

  // 정산 상세 내역 조회
  // GET /api/v1/settlement/host/batches/{batchId}
  getSettlementBatchDetail: (batchId) =>
    api.get(`/settlement/host/batches/${batchId}`, {
      withAuth: true,
    }),
};

export default settlementApi;
