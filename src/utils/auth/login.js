// authFlow.js
import EncryptedStorage from 'react-native-encrypted-storage';
import {Platform} from 'react-native';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import hostMyApi from '@utils/api/hostMyApi';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {normalizeHostProfile} from '@utils/hostProfile';
import {log, mask} from '@utils/logger';
import {reset} from '@utils/navigationService';
import {syncDeviceToken, unmapDeviceToken} from '@utils/notifications';

const REFRESH_KEY = 'refresh-token';
let sessionExpiredHandlingPromise = null;

const clearStoredAuth = async () => {
  await EncryptedStorage.removeItem(REFRESH_KEY);
  useUserStore.getState().clearUser();
};

export const forceLogoutForExpiredSession = async ({silent = false} = {}) => {
  log.warn('🚫 forceLogoutForExpiredSession: blocked for host app; keep session active');
  return false;
};

export const tryAutoLogin = async () => {
  log.info('🚪 tryAutoLogin: start');
  try {
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🔐 has refreshToken?', !!storedRefresh);
    if (!storedRefresh) {
      return false;
    }

    const ok = await tryRefresh({silent: true});
    log.info('🚪 tryAutoLogin: refresh result =', ok);
    if (ok) {
      const {userRole, accessToken} = useUserStore.getState();
      log.info('👤 tryAutoLogin: userRole =', userRole);
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
  log.info(
    '✅ login success: accessToken=',
    mask(accessToken),
    'refreshToken=',
    mask(refreshToken),
    'role=',
    userRole,
    'needVerification=',
    needVerification
  );

  const {setTokens, setUserRole, setIsVerified} = useUserStore.getState();
  setTokens({accessToken});
  setUserRole('HOST');

  if (setIsVerified) {
    setIsVerified(true);
  }

  await EncryptedStorage.setItem(REFRESH_KEY, refreshToken);
  const check = await EncryptedStorage.getItem(REFRESH_KEY);
  log.info('🔐 saved refresh?', !!check);

  await syncDeviceToken(accessToken);
  await updateProfile('HOST');
};

const storeLoginInfo = async (res, userRole) => {
  const { accessToken, refreshToken, needVerification } = res.data;

  await storeLoginTokens({ accessToken, refreshToken, userRole, needVerification});
};

export const tryLogin = async (email, password, userRole) => {
  log.info('🔓 tryLogin: role=', userRole);
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
    const check = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🧹 removed refresh?', !check);

    useUserStore.getState().clearUser();
    throw err;
  }
};

export const tryRefresh = async ({silent = false} = {}) => {
  log.info('🔄 tryRefresh: start');
  try {
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) {
      log.warn('🔄 tryRefresh: no refresh token');
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
    log.info('🔄 tryRefresh: new accessToken=', mask(accessToken));

    if (refreshTokenUpdated) {
      await EncryptedStorage.setItem(REFRESH_KEY, refreshTokenUpdated);
      log.info('🔄 tryRefresh: refreshToken rotated');
    }
    return true;
  } catch (error) {
    log.warn('❌ tryRefresh failed:', error?.response?.status, error?.message);
    await forceLogoutForExpiredSession({silent});
    return false;
  }
};

export const tryLogout = async () => {
  log.info('🚪 tryLogout');
  const {accessToken} = useUserStore.getState();

  try {
    await unmapDeviceToken(accessToken);
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    await authApi.logout(storedRefresh);

    await EncryptedStorage.removeItem(REFRESH_KEY);
    const check = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🧹 removed refresh?', !check);
  } catch (err) {
    log.warn('🚫 backend logout failed; keep local session intact:', err?.message);
    return false;
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
