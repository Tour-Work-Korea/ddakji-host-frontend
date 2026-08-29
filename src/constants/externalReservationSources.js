export const DDAKJI_RESERVATION_SOURCE = {
  value: 'DDAKJI',
  label: '게딱지',
  backgroundColor: '#FFF1D6',
  textColor: '#D96A00',
};

export const EXTERNAL_RESERVATION_SOURCES = [
  {
    value: 'NAVER',
    label: '네이버',
    backgroundColor: '#E9F9EF',
    textColor: '#029C47',
  },
  {
    value: 'YEOGIEOTTAE',
    label: '여기어때',
    backgroundColor: '#FFF0F0',
    textColor: '#E8393E',
  },
  {
    value: 'YANOLJA',
    label: '야놀자',
    backgroundColor: '#FCECF5',
    textColor: '#DE2E83',
  },
];

export const getExternalReservationSource = value =>
  EXTERNAL_RESERVATION_SOURCES.find(source => source.value === value);
