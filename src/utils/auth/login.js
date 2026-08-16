// authFlow.js
import EncryptedStorage from 'react-native-encrypted-storage';
import {Platform} from 'react-native';
import authApi from '@utils/api/authApi';
import useUserStore, {waitForUserStoreHydration} from '@stores/userStore';
import hostMyApi from '@utils/api/hostMyApi';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {normalizeHostProfile} from '@utils/hostProfile';
import {log} from '@utils/logger';
import {reset} from '@utils/navigationService';
import {syncDeviceToken, unmapDeviceToken} from '@utils/notifications';

const REFRESH_KEY = 'refresh-token';
const PENDING_LOGOUT_CLEANUP_KEY = 'pending-logout-cleanup';
const MAX_PENDING_LOGOUT_ATTEMPTS = 5;
let sessionExpiredHandlingPromise = null;
let refreshPromise = null;

const clearStoredAuth = async () => {
  await EncryptedStorage.removeItem(REFRESH_KEY);
  useUserStore.getState().clearUser();
};

const readPendingLogoutCleanup = async () => {
  try {
    const raw = await EncryptedStorage.getItem(PENDING_LOGOUT_CLEANUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    log.warn('🧹 pending logout cleanup read failed:', error?.message);
    await clearPendingLogoutCleanup();
    return null;
  }
};

const writePendingLogoutCleanup = async cleanup => {
  try {
    await EncryptedStorage.setItem(
      PENDING_LOGOUT_CLEANUP_KEY,
      JSON.stringify(cleanup),
    );
    return true;
  } catch (error) {
    log.warn('🧹 pending logout cleanup write failed:', error?.message);
    return false;
  }
};

const clearPendingLogoutCleanup = async () => {
  try {
    await EncryptedStorage.removeItem(PENDING_LOGOUT_CLEANUP_KEY);
  } catch (error) {
    log.warn('🧹 pending logout cleanup clear failed:', error?.message);
  }
};

const isTerminalLogoutCleanupError = error => {
  const status = error?.response?.status;
  return status === 400 || status === 401 || status === 403 || status === 404;
};

const isTerminalRefreshError = error => {
  const status = error?.response?.status;
  return status === 400 || status === 401 || status === 403 || status === 404;
};

const runRemoteLogoutCleanup = async ({accessToken, refreshToken}) => {
  let deviceTokenUnmapped = true;
  let serverLoggedOut = true;
  let terminalFailure = false;

  if (accessToken) {
    deviceTokenUnmapped = await unmapDeviceToken(accessToken);
  }

  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch (error) {
      serverLoggedOut = false;
      terminalFailure = isTerminalLogoutCleanupError(error);
      log.warn('🚫 backend logout failed:', error?.message);
    }
  }

  return {
    done: deviceTokenUnmapped && serverLoggedOut,
    terminalFailure,
  };
};

export const retryPendingLogoutCleanup = async () => {
  const pending = await readPendingLogoutCleanup();
  if (!pending) {
    return;
  }

  const attempts = Number(pending.attempts ?? 0);
  if (attempts >= MAX_PENDING_LOGOUT_ATTEMPTS) {
    log.warn('🧹 pending logout cleanup dropped after max attempts');
    await clearPendingLogoutCleanup();
    return;
  }

  const result = await runRemoteLogoutCleanup(pending);
  if (result.done || result.terminalFailure) {
    await clearPendingLogoutCleanup();
    return;
  }

  await writePendingLogoutCleanup({
    ...pending,
    attempts: attempts + 1,
    lastAttemptAt: Date.now(),
  });
};

export const forceLogoutForExpiredSession = async ({silent = false} = {}) => {
  if (sessionExpiredHandlingPromise) {
    return sessionExpiredHandlingPromise;
  }

  sessionExpiredHandlingPromise = (async () => {
    log.warn('🚫 forceLogoutForExpiredSession: clear expired local session');
    await clearStoredAuth();

    if (!silent) {
      reset([{name: 'Login'}]);
    }

    return true;
  })().finally(() => {
    sessionExpiredHandlingPromise = null;
  });

  return sessionExpiredHandlingPromise;
};

export const tryAutoLogin = async () => {
  try {
    await waitForUserStoreHydration();
    await retryPendingLogoutCleanup();

    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) {
      await forceLogoutForExpiredSession({silent: true});
      return false;
    }

    const ok = await tryRefresh({silent: true});
    if (ok) {
      const {userRole, accessToken} = useUserStore.getState();
      await syncDeviceToken(accessToken);
      if (userRole) {
        await updateProfile(userRole);
      }
    }
    return ok;
  } catch (err) {
    log.warn('❌ tryAutoLogin Error:', err?.message);
    return false;
  }
};

export const storeLoginTokens = async ({
  accessToken,
  refreshToken,
  userRole,
  needVerification,
}) => {
  const {setTokens, setUserRole, setIsVerified} = useUserStore.getState();
  setTokens({accessToken});
  setUserRole('HOST');

  if (setIsVerified) {
    setIsVerified(true);
  }

  await EncryptedStorage.setItem(REFRESH_KEY, refreshToken);

  await syncDeviceToken(accessToken);
  await updateProfile('HOST');
};

const storeLoginInfo = async (res, userRole) => {
  const { accessToken, refreshToken, needVerification } = res.data;

  await storeLoginTokens({ accessToken, refreshToken, userRole, needVerification});
};

export const tryLogin = async (email, password, userRole) => {
  try {
    const res = await authApi.login(email, password, userRole);
    await storeLoginInfo(res, userRole);
    return res.data;
  } catch (err) {
    log.warn('❌ tryLogin failed:', err?.response?.status, err?.message);

    if (Platform.OS === 'ios') {
      try {
        await EncryptedStorage.removeItem(REFRESH_KEY);
      } catch (storageErr) {
        log.warn('🧹 iOS remove refresh failed:', storageErr?.message);
      }
    } else {
      await EncryptedStorage.removeItem(REFRESH_KEY);
    }

    useUserStore.getState().clearUser();
    throw err;
  }
};

const performRefresh = async ({silent = false} = {}) => {
  try {
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);

    if (!storedRefresh) {
      await forceLogoutForExpiredSession({silent});
      return false;
    }
    const res = await authApi.refreshToken(storedRefresh);

    const accessToken = res.data.accessToken;
    const refreshTokenUpdated = res.data.refreshToken;

    if (!accessToken) {
      log.warn('🔄 tryRefresh: accessToken missing in refresh response');
      await forceLogoutForExpiredSession({silent});
      return false;
    }

    useUserStore.getState().setTokens({accessToken});
    useUserStore.getState().setUserRole('HOST');

    if (refreshTokenUpdated) {
      await EncryptedStorage.setItem(REFRESH_KEY, refreshTokenUpdated);
    }
    return true;
  } catch (error) {
    log.warn('❌ tryRefresh failed:', error?.response?.status, error?.message);
    if (isTerminalRefreshError(error)) {
      await forceLogoutForExpiredSession({silent});
    }
    return false;
  }
};

export const tryRefresh = async (options = {}) => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performRefresh(options);

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

export const tryLogout = async () => {
  const {accessToken} = useUserStore.getState();
  let storedRefresh = null;

  try {
    storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
  } catch (error) {
    log.warn('🧹 read refresh before logout failed:', error?.message);
  }

  const cleanup = {
    accessToken,
    refreshToken: storedRefresh,
    attempts: 0,
    createdAt: Date.now(),
  };
  const result = await runRemoteLogoutCleanup(cleanup);

  if (result.done || result.terminalFailure) {
    await clearPendingLogoutCleanup();
  } else {
    await writePendingLogoutCleanup({
      ...cleanup,
      attempts: 1,
      lastAttemptAt: Date.now(),
    });
  }

  try {
    await EncryptedStorage.removeItem(REFRESH_KEY);
  } catch (error) {
    log.warn('🧹 remove refresh on logout failed:', error?.message);
  }

  useUserStore.getState().clearUser();
  return true;
};

export const updateProfile = async role => {
  log.info('👤 updateProfile: role=', role);
  const {setHostProfile} = useUserStore.getState();

  try {
    const res = await hostMyApi.getMyProfile();
    let appRes = { data: [] };
    try {
      appRes = await hostGuesthouseApi.getHostApplications();
    } catch (e) {
      log.warn('👤 getHostApplications failed:', e?.message);
    }
    const normalizedProfile = normalizeHostProfile(res?.data, appRes?.data);

    setHostProfile(normalizedProfile);
    log.info('👤 HOST profile loaded');
  } catch (error) {
    log.warn(`👤 ${role} profile fetch failed:`, error?.message);
  }
};

export function calculateAge(birthDateString) {
  if (!birthDateString) {
    return '00';
  }
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
