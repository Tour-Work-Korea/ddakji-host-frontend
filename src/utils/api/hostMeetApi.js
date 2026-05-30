import api from './axiosInstance';

const hostMeetApi = {
  // 오늘 파티 전체 조회
  getTodayParties: () =>
    api.get('/host/parties/daily'),

  // 사장님 파티 공고 전체 조회
  getMyParties: () =>
    api.get('/host/parties/templates'),

  // 오늘 파티 상세 조회
  getPartyDetail: (partyId) =>
    api.get(`/host/parties/daily/${partyId}`),

  // 개별 파티 전체(히스토리) 조회
  getAllParties: () =>
    api.get('/host/parties/all'),

  // 파티 템플릿 상세 조회
  getPartyTemplateDetail: (templateId) =>
    api.get(`/host/parties/templates/${templateId}`),

  // 파티 공고 등록
  createParty: (data) =>
    api.post('/host/parties/templates', data),

  // 파티 공고 수정
  updateParty: (templateId, data) =>
    api.put(`/host/parties/templates/${templateId}`, data),

  // 파티 공고 삭제
  deleteParty: (templateId) =>
    api.delete(`/host/parties/templates/${templateId}`),

  // 오늘 파티 노출 여부 수정
  updatePartyVisibility: (partyId, isVisible) =>
    api.patch(`/host/parties/daily/${partyId}/visibility`, null, {
      params: {
        isVisible,
      },
    }),

  // 오늘 파티 최대 인원 수정
  updatePartyMaxAttendees: (partyId, maxAttendees) =>
    api.patch(`/host/parties/daily/${partyId}/max-attendees`, null, {
      params: {
        maxAttendees,
      },
    }),

  // 날짜별 파티 예약 요약 조회
  getPartyReservationSummary: (guesthouseId, date) =>
    api.get(`/host/parties/daily/${guesthouseId}/reservations/summary`, {
      params: {
        date,
      },
    }),

  // 오늘 파티 취소
  cancelParty: (partyId) =>
    api.patch(`/host/parties/daily/${partyId}/cancel`),

  // 모임 템플릿 신청 오픈 상태 토글 API
  updatePartyApplicationOpen: (templateId, isApplyOpen) =>
    api.patch(`/host/parties/templates/${templateId}/application-open`, null, {
      params: {
        isApplyOpen,
      },
    }),
};

export default hostMeetApi;
