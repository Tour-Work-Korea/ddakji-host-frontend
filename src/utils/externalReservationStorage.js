import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = 'integrated-calendar:external-reservations:v1';

const getStorageKey = guesthouseId =>
  `${STORAGE_KEY_PREFIX}:${String(guesthouseId)}`;

export const getExternalReservations = async guesthouseId => {
  if (!guesthouseId) {
    return [];
  }

  try {
    const storedValue = await AsyncStorage.getItem(getStorageKey(guesthouseId));
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
};

export const addExternalReservation = async (guesthouseId, reservation) => {
  const currentReservations = await getExternalReservations(guesthouseId);
  const nextReservation = {
    ...reservation,
    id: reservation?.id || `external-${Date.now()}`,
    guesthouseId,
    createdAt: reservation?.createdAt || new Date().toISOString(),
  };
  const nextReservations = [...currentReservations, nextReservation];

  await AsyncStorage.setItem(
    getStorageKey(guesthouseId),
    JSON.stringify(nextReservations),
  );

  return nextReservations;
};

export const updateExternalReservation = async (
  guesthouseId,
  reservationId,
  reservation,
) => {
  const currentReservations = await getExternalReservations(guesthouseId);
  const nextReservations = currentReservations.map(currentReservation =>
    String(currentReservation?.id) === String(reservationId)
      ? {
          ...currentReservation,
          ...reservation,
          id: currentReservation.id,
          guesthouseId,
          updatedAt: new Date().toISOString(),
        }
      : currentReservation,
  );

  await AsyncStorage.setItem(
    getStorageKey(guesthouseId),
    JSON.stringify(nextReservations),
  );

  return nextReservations;
};

export const removeExternalReservation = async (
  guesthouseId,
  reservationId,
) => {
  const currentReservations = await getExternalReservations(guesthouseId);
  const nextReservations = currentReservations.filter(
    reservation => String(reservation?.id) !== String(reservationId),
  );

  await AsyncStorage.setItem(
    getStorageKey(guesthouseId),
    JSON.stringify(nextReservations),
  );

  return nextReservations;
};
