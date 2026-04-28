import {Linking, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {compareVersions, validate} from 'compare-versions';
import {log} from '@utils/logger';

export const FORCE_UPDATE_REMOTE_CONFIG_KEY = 'min_version';

export const PARTNER_CENTER_STORE_URLS = {
  ios: 'https://apps.apple.com/app/id6761244097',
  android: 'market://details?id=com.ddakjihostapp',
  androidFallback: 'https://play.google.com/store/apps/details?id=com.ddakjihostapp',
};

const normalizeVersion = version => String(version || '').trim();

export const getCurrentAppVersion = () => DeviceInfo.getVersion();

export const shouldForceUpdate = minVersion => {
  const currentVersion = normalizeVersion(getCurrentAppVersion());
  const requiredVersion = normalizeVersion(minVersion);

  if (!requiredVersion || !validate(requiredVersion)) {
    return false;
  }

  if (!validate(currentVersion)) {
    log.warn('invalid current app version:', currentVersion);
    return false;
  }

  return compareVersions(currentVersion, requiredVersion) < 0;
};

export const openPartnerCenterStore = async () => {
  if (Platform.OS === 'ios') {
    await Linking.openURL(PARTNER_CENTER_STORE_URLS.ios);
    return;
  }

  const canOpenMarket = await Linking.canOpenURL(
    PARTNER_CENTER_STORE_URLS.android,
  );

  await Linking.openURL(
    canOpenMarket
      ? PARTNER_CENTER_STORE_URLS.android
      : PARTNER_CENTER_STORE_URLS.androidFallback,
  );
};
