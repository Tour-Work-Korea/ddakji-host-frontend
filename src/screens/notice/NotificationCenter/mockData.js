export const ROOM_RESERVATION_NOTIFICATIONS = [
  {
    id: 'room-1',
    type: 'roomReservation',
    status: 'confirmed',
    title: '예약이 확정되었습니다',
    lines: [
      '이하늘님, 여성2인실[도미토리], 2명',
      '26.02.11(수) ~ 26.02.12(목)(1박)',
    ],
    date: '26.1.20',
  },
  {
    id: 'room-2',
    type: 'roomReservation',
    status: 'cancelled',
    title: '예약이 취소되었습니다',
    lines: [
      '정재원님, 여성1인실[일반객실], 1명',
      '26.02.11(수) ~ 26.02.13(목)(2박)',
    ],
    date: '26.1.20',
  },
];

export const PARTY_RESERVATION_NOTIFICATIONS = [
  {
    id: 'party-1',
    type: 'partyReservation',
    status: 'confirmed',
    title: '이하늘님(이)이 파티 참여 신청을 했습니다',
    lines: ['이하늘님, 1999년생, 2명', '010-4123-0075'],
    date: '14:20 신청',
  },
  {
    id: 'party-2',
    type: 'partyReservation',
    status: 'cancelled',
    title: '정재원님(이)이 파티 참여를 취소했습니다',
    lines: ['정재원님, 1997년생, 1명', '010-6627-2653'],
    date: '18:20 신청',
  },
];

export const NOTICE_NOTIFICATIONS = [
  {
    id: 'notice-1',
    type: 'notice',
    title: '게스트하우스 홍보용 인스타 피드 제작 지원',
    lines: ['제휴 게스트하우스를 위한 홍보용 인스타 피드를 제작해드립니다.'],
    date: '26.1.20',
  },
];

export const ALL_NOTIFICATIONS = [
  ...ROOM_RESERVATION_NOTIFICATIONS,
  ...PARTY_RESERVATION_NOTIFICATIONS,
  ...NOTICE_NOTIFICATIONS,
];
