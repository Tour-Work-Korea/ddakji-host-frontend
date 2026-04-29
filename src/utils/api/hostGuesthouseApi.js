import api from './axiosInstance';

const hostGuesthouseApi = {
  // 사장님 전체 게스트하우스 조회
  getMyGuesthouses: () => api.get('/host/guesthouses'),
  // 사장님 전체 게스트하우스 조회 (룸 포함)
  getMyGuesthousesWithRooms: () => api.get('/host/guesthouses/with-rooms'),
  getGuesthouseHashtags: () => api.get('/host/guesthouses/hashtags'),
  getGuesthouseAmenities: () => api.get('/host/guesthouses/amenities'),

  // 특정 게스트하우스 상세 조회
  getGuesthouseDetail: guesthouseId =>
    api.get(`/host/guesthouses/${guesthouseId}`),

  // 게스트하우스 환불 정책 조회
  getGuesthouseRefundPolicies: guesthouseId =>
    api.get(`/host/guesthouses/${guesthouseId}/refund-policy-settings`),

  // 게스트하우스 환불 정책 수정
  updateGuesthouseRefundPolicies: (guesthouseId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}/refund-policy-settings`, payload),

  // 게스트하우스 예약 정책 조회
  getGuesthouseReservationPolicy: guesthouseId =>
    api.get(`/host/guesthouses/${guesthouseId}/reservation-policy`),

  // 게스트하우스 예약 정책 수정
  // body: { reservationPolicy: 'CLOSED' | 'REQUEST_CONFIRMATION' | 'INSTANT_CONFIRMATION' }
  updateGuesthouseReservationPolicy: (guesthouseId, reservationPolicy) =>
    api.put(`/host/guesthouses/${guesthouseId}/reservation-policy`, {
      reservationPolicy,
    }),

  // 게스트하우스 최종 등록
  finalizeGuesthouse: (guesthouseId, dto) =>
    api.post(`/host/guesthouses/${guesthouseId}/finalize`, dto),

  // 게스트하우스 수정

  /** 게스트하우스 기본정보 수정 (이름/주소/전화/소개/체크인아웃/규칙)
   * body {
   *  guesthouseName, guesthouseAddress, guesthousePhone,
   *  guesthouseDetailAddress, guesthouseShortIntro,
   *  guesthouseLongDescription, checkIn, checkOut, rules
   * }
   * 부분 수정 가능: 필요한 필드만 포함해서 보내면 됨
   */
  updateGuesthouseBasic: (guesthouseId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}`, payload),

  /** 게스트하우스 이미지 수정
   * body: [{ guesthouseImageUrl: string, isThumbnail: boolean }, ...]
   * 규칙: 썸네일은 정확히 1개, 기존 포함 모든 이미지의 url 전체 전달
   */
  updateGuesthouseImages: (guesthouseId, images) =>
    api.put(`/host/guesthouses/${guesthouseId}/images`, images),

  /** 게스트하우스 해시태그 수정
   * body: [1,2,3]  // 해시태그 id 배열 (최대 3개, 기존 포함 전체 전달)
   */
  updateGuesthouseHashtags: (guesthouseId, hashtagIds) =>
    api.put(`/host/guesthouses/${guesthouseId}/hashtags`, hashtagIds),

  /** 게스트하우스 편의시설 수정
   * body: [{ amenityId: number, count: number }, ...]
   * 규칙: 기존 포함 모든 편의시설을 전체 전달
   */
  updateGuesthouseAmenities: (guesthouseId, amenities) =>
    api.put(`/host/guesthouses/${guesthouseId}/amenities`, amenities),

  /** 객실 기본 정보 수정
   * body {
   *  roomName, roomType, roomCapacity, roomMaxCapacity,
   *  roomDescription, roomPrice
   * }
   * 부분 수정 가능
   */
  updateRoomBasic: (guesthouseId, roomId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}/rooms/${roomId}`, payload),

  /** 객실 이미지 수정
   * body: [{ roomImageUrl: string, isThumbnail: boolean }, ...]
   * 규칙: 썸네일은 정확히 1개, 기존 포함 모든 이미지의 url 전체 전달
   */
  updateRoomImages: (guesthouseId, roomId, images) =>
    api.put(
      `/host/guesthouses/${guesthouseId}/rooms/${roomId}/images`,
      images
    ),

  /** 객실 추가
   * body {
   *  roomName, roomType, dormitoryGenderType, femaleOnly
   *  roomCapacity, roomMaxCapacity,
   *  roomDescription, roomPrice,
   *  roomExtraFees: [{ startDate, endDate, addPrice }],
   *  roomImages: [{ roomImageUrl, isThumbnail }]
   * }
   */
  createRoom: (guesthouseId, roomPayload) =>
    api.post(`/host/guesthouses/${guesthouseId}/rooms`, roomPayload),

  // 객실 삭제
  deleteRoom: (guesthouseId, roomId) =>
    api.delete(`/host/guesthouses/${guesthouseId}/rooms/${roomId}`),

  // 게스트하우스 전체 객실 예약 상태 변경(예약버튼)
  // body: { roomStatus: 'OPEN' | 'CLOSED' }
  updateRoomsReservationStatus: (guesthouseId, roomStatus) =>
    api.patch(`/host/guesthouses/${guesthouseId}/rooms/reservation-status`, {
      roomStatus,
    }),

  // 객실 고객 노출 여부 변경(노출)
  // body: { isVisible: boolean }
  updateRoomVisibility: (guesthouseId, roomId, isVisible) =>
    api.patch(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/visibility`, {
      isVisible,
    }),

  // 게스트하우스 삭제
  deleteGuesthouse: guesthouseId =>
    api.delete(`/host/guesthouses/${guesthouseId}`),

  // 특정 게스트하우스 리뷰 목록 조회
  getGuesthouseReviews: ({ guesthouseId, page, size, sort }) =>
    api.get(`/${guesthouseId}/reviews`, {
      params: {
        page,
        size,
        sort,
      },
    }),

  // 리뷰에 대한 답글 작성
  postReviewReply: (reviewId, reply) =>
    api.post(`/host/reviews/${reviewId}/replies`, { reply }),

  // 리뷰 삭제 요청
  deleteReview: (reviewId, reason) =>
    api.post(`/host/reviews/${reviewId}`, {
      reason,
    }),

  // 사장님 입점신청서 조회
  getHostApplications: () => api.get('/host/my/application'),

  // 사장님 입점신청서 삭제
  deleteHostApplication: applicationId =>
    api.delete(`/host/my/application/${applicationId}`),

  // 게스트하우스 프로필 수정
  updateGuesthouseProfile: (guesthouseId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}/profile`, payload),

  // 사장님 입점 신청서 등록
  postHostApplication: formData =>
    api.post('/host/my/application', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 입점 신청서 기반 임시 게스트하우스 생성
  tempCreateGuesthouse: payload =>
    api.post('/host/guesthouses/tempCreate', payload),

  // 게하 예약 검색
  searchGuesthouseReservations: (formData) =>
    api.get('/order/host/reservation/search', { params: formData }),

  // 게하 예약 현황 조회
  getGuesthouseReservations: (guesthouseId) =>
    api.get(`/order/host/reservation/${guesthouseId}`),

  // 게하 예약 상세 조회
  getGuesthouseReservationDetail: (reservationId) =>
    api.get(`/order/host/reservation/detail/${reservationId}`),

  // 게하 예약 캘린더 조회
  getGuesthouseReservationCalendar: (formData) =>
    api.get('/order/host/reservation/calendar', { params: formData }),

  // 게하 예약 캘린더 플래그 조회
  getGuesthouseReservationCalendarFlags: (formData) =>
    api.get('/order/host/reservation/calendar/flags', { params: formData }),

  // 호스트 예약 취소
  cancelGuesthouseReservationByHost: (reservationId, payload) =>
    api.post(`/order/host/reservation/${reservationId}/cancel`, payload),

  // 호스트 예약 확정
  approveGuesthouseReservationByHost: (reservationId) =>
    api.post(`/order/host/reservation/${reservationId}/approve`),

  // 호스트 예약 반려
  rejectGuesthouseReservationByHost: (reservationId, payload) =>
    api.post(`/order/host/reservation/${reservationId}/reject`, payload),

  // 특정 객실 기간별 운영 상태/예약 인원/잔여 인원 조회
  // query: { from: 'YYYY-MM-DD', toInclusive: 'YYYY-MM-DD' }
  getRoomInventoryCalendar: (guesthouseId, roomId, from, toInclusive) =>
    api.get(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/inventory/calendar`, {
      params: {
        from,
        toInclusive,
      },
    }),

  // 객실 날짜별 운영 상태 변경 (단건)
  // body: { date: 'YYYY-MM-DD', isClosed: boolean }
  updateRoomStatusByDate: (guesthouseId, roomId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/status`, payload),

  // 객실 날짜별 운영 상태 변경 (여러개 동시) -> 웹용
  // body: [{ date: 'YYYY-MM-DD', isClosed: boolean }, ...]
  // updateRoomStatusesByDates: (guesthouseId, roomId, payload) =>
  //   api.put(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/statuses`, payload),

  // 객실 체크인 안내문 조회
  getRoomCheckinNotice: (guesthouseId, roomId) =>
    api.get(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/checkin-notice`),

  // 객실 체크인 안내문 수정
  updateRoomCheckinNotice: (guesthouseId, roomId, noticeText) =>
    api.put(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/checkin-notice`, {
      noticeText,
    }),

  // 도미토리 예약 가능 베드 수 변경 (단건)
  updateAvailableBeds: (guesthouseId, roomId, payload) =>
    api.patch(
      `/host/guesthouses/${guesthouseId}/rooms/${roomId}/inventory/available-beds`,
      payload
    ),

  // 도미토리 예약 가능 베드 수 변경 (전체)
  bulkUpdateAvailableBeds: (guesthouseId, roomId, payload) =>
    api.patch(
      `/host/guesthouses/${guesthouseId}/rooms/${roomId}/inventory/available-beds/bulk`,
      payload
    ),

  // 게하 예약 취소
  cancelGuesthouseReservation: (reservationId) =>
    api.delete(`/order/reservation/${reservationId}`, {
      data: { type: 'GUESTHOUSE' },
    }),

  // 객실 요금 관리용 객실 목록 조회
  getRoomPricingTargets: (guesthouseId) =>
    api.get(`/host/guesthouses/${guesthouseId}/rooms/pricing-targets`),

  // 객실 월별 요금 달력 조회
  getRoomPricingCalendar: (guesthouseId, roomId, yearMonth) =>
    api.get(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/pricing/calendar`, {
      params: { yearMonth },
    }),

  // 객실 시즌 요금 목록 조회
  getRoomPricingSeasons: (guesthouseId, roomId) =>
    api.get(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/pricing/seasons`),

  // 객실 시즌 요금 전체 교체 저장
  updateRoomPricingSeasons: (guesthouseId, roomId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/pricing/seasons`, payload),

  // 객실 수동 요금 변경
  updateRoomManualPriceOverrides: (guesthouseId, roomId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/pricing/manual-overrides`, payload),

  // 객실 수동 요금 변경 해제
  clearRoomManualPriceOverrides: (guesthouseId, roomId, payload) =>
    api.post(`/host/guesthouses/${guesthouseId}/rooms/${roomId}/pricing/manual-overrides/clear`, payload),
};

export default hostGuesthouseApi;
