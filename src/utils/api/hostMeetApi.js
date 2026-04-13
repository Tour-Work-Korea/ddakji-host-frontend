import api from './axiosInstance';

const hostMeetApi = {
  // 사장님 파티 공고 전체 조회
  getMyParties: () =>
    api.get('/host/parties/templates'),

  // 파티 공고 상세 조회
  getPartyDetail: (partyId) =>
    api.get(`/host/parties/daily/${partyId}`),

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

  // 파티 해시태그 (시설/서비스) 리스트 조회
  getPartyFacilities: () =>
    api.get('/host/parties/facilities'),


};

export default hostMeetApi;
