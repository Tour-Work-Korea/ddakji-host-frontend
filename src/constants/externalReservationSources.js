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

const CHANNEL_COLOR_STYLES = {
  GREEN: {backgroundColor: '#E9F9EF', textColor: '#029C47'},
  RED: {backgroundColor: '#FFF0F0', textColor: '#E8393E'},
  PINK: {backgroundColor: '#FCECF5', textColor: '#DE2E83'},
  ORANGE: {backgroundColor: '#FFF1D6', textColor: '#D96A00'},
  AMBER: {backgroundColor: '#FFF6D8', textColor: '#A66B00'},
  BLUE: {backgroundColor: '#EAF2FF', textColor: '#2767C5'},
  PURPLE: {backgroundColor: '#F2ECFF', textColor: '#7048B8'},
  GRAY: {backgroundColor: '#F2F3F5', textColor: '#555B66'},
};

export const getChannelColorStyle = colorKey =>
  CHANNEL_COLOR_STYLES[colorKey] ?? CHANNEL_COLOR_STYLES.GRAY;

export const normalizeBookingChannel = channel => {
  const colorStyle = getChannelColorStyle(channel?.colorKey);
  return {
    ...channel,
    value: channel?.channelKey,
    label: channel?.name ?? channel?.channelLabel ?? channel?.channelKey,
    ...colorStyle,
  };
};

export const getExternalReservationSource = (value, colorKey, label) => {
  const predefined = EXTERNAL_RESERVATION_SOURCES.find(
    source => source.value === value,
  );
  if (predefined) {
    return predefined;
  }

  if (!value && !label) {
    return undefined;
  }

  return {
    value,
    label: label ?? value ?? '외부',
    ...getChannelColorStyle(colorKey),
  };
};
