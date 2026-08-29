import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@ddakji-host/local-date-events';

const getStorageKey = guesthouseId =>
  `${STORAGE_KEY_PREFIX}/${String(guesthouseId)}`;

const getEndedSampleMarkerKey = guesthouseId =>
  `${getStorageKey(guesthouseId)}/ended-sample-created`;

const formatDateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalDateEvents = async guesthouseId => {
  if (!guesthouseId) {
    return [];
  }

  try {
    const stored = await AsyncStorage.getItem(getStorageKey(guesthouseId));
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('로컬 날짜 이벤트 조회 실패:', error);
    return [];
  }
};

export const addLocalDateEvent = async (guesthouseId, event) => {
  const currentEvents = await getLocalDateEvents(guesthouseId);
  const createdAt = new Date().toISOString();
  const nextEvent = {
    ...event,
    localEventId: `local-date-event-${Date.now()}`,
    isLocalTestEvent: true,
    scheduleType: 'DATE_EVENT',
    isApplyOpen: true,
    createdAt,
    updatedAt: createdAt,
  };
  const nextEvents = [nextEvent, ...currentEvents];
  await AsyncStorage.setItem(
    getStorageKey(guesthouseId),
    JSON.stringify(nextEvents),
  );
  return nextEvents;
};

export const updateLocalDateEvent = async (
  guesthouseId,
  localEventId,
  updates,
) => {
  const currentEvents = await getLocalDateEvents(guesthouseId);
  const nextEvents = currentEvents.map(event =>
    String(event.localEventId) === String(localEventId)
      ? {
          ...event,
          ...updates,
          localEventId: event.localEventId,
          isLocalTestEvent: true,
          scheduleType: 'DATE_EVENT',
          createdAt: event.createdAt,
          updatedAt: new Date().toISOString(),
        }
      : event,
  );
  await AsyncStorage.setItem(
    getStorageKey(guesthouseId),
    JSON.stringify(nextEvents),
  );
  return nextEvents;
};

export const removeLocalDateEvent = async (guesthouseId, localEventId) => {
  const currentEvents = await getLocalDateEvents(guesthouseId);
  const nextEvents = currentEvents.filter(
    event => String(event.localEventId) !== String(localEventId),
  );
  await AsyncStorage.setItem(
    getStorageKey(guesthouseId),
    JSON.stringify(nextEvents),
  );
  return nextEvents;
};

export const ensureEndedLocalDateEventSample = async guesthouseId => {
  if (!guesthouseId) {
    return [];
  }

  const markerKey = getEndedSampleMarkerKey(guesthouseId);
  const [marker, currentEvents] = await Promise.all([
    AsyncStorage.getItem(markerKey),
    getLocalDateEvents(guesthouseId),
  ]);

  if (marker === 'true') {
    return currentEvents;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const createdAt = new Date().toISOString();
  const sampleEvent = {
    localEventId: `local-ended-event-sample-${Date.now()}`,
    isLocalTestEvent: true,
    isEndedTestSample: true,
    scheduleType: 'DATE_EVENT',
    guesthouseId: Number(guesthouseId),
    partyTitle: '종료 이벤트 테스트',
    partyImages: [],
    contentType: 'PROGRAM',
    partyStartDateTime: formatDateKey(yesterday),
    partyStartTime: '20:00:00',
    partyEndTime: '22:00:00',
    applicationType: 'SAME_DAY',
    minAttendees: 1,
    maxAttendees: 10,
    isGuest: false,
    chargeType: 'FREE',
    amount: 0,
    partyAnnouncements: [
      {announcement: '종료 상태 디자인 확인을 위한 테스트 이벤트예요.'},
    ],
    detailSchedule: '오후 8시 이벤트 시작',
    isApplyOpen: false,
    createdAt,
    updatedAt: createdAt,
  };
  const nextEvents = [...currentEvents, sampleEvent];

  await Promise.all([
    AsyncStorage.setItem(getStorageKey(guesthouseId), JSON.stringify(nextEvents)),
    AsyncStorage.setItem(markerKey, 'true'),
  ]);
  return nextEvents;
};
