import {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import remoteConfig from '@react-native-firebase/remote-config';
import {
  FORCE_UPDATE_REMOTE_CONFIG_KEY,
  shouldForceUpdate,
} from '@utils/forceUpdate';
import {log} from '@utils/logger';

const REMOTE_CONFIG_FETCH_TIMEOUT_MS = 10000;

export default function useForceUpdate() {
  const [forceUpdateState, setForceUpdateState] = useState({
    visible: false,
    minVersion: '',
  });

  useEffect(() => {
    let mounted = true;
    const config = remoteConfig();

    const applyMinVersion = () => {
      const minVersion = config
        .getValue(FORCE_UPDATE_REMOTE_CONFIG_KEY)
        .asString();
      const nextMustUpdate = shouldForceUpdate(minVersion);

      if (mounted) {
        setForceUpdateState({
          visible: nextMustUpdate,
          minVersion,
        });
      }
    };

    const fetchAndApply = async () => {
      try {
        await config.setConfigSettings({
          fetchTimeMillis: REMOTE_CONFIG_FETCH_TIMEOUT_MS,
          minimumFetchIntervalMillis: 0,
        });
        await config.setDefaults({
          [FORCE_UPDATE_REMOTE_CONFIG_KEY]: '0.0.0',
        });
        await config.fetchAndActivate();
        applyMinVersion();
      } catch (error) {
        log.warn('force update remote config failed:', error?.message);
      }
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'active') {
          fetchAndApply();
        }
      },
    );

    const remoteConfigUnsubscribe = config.onConfigUpdate({
      next: async update => {
        if (!update.getUpdatedKeys().has(FORCE_UPDATE_REMOTE_CONFIG_KEY)) {
          return;
        }

        try {
          await config.activate();
          applyMinVersion();
        } catch (error) {
          log.warn('force update remote config activation failed:', error?.message);
        }
      },
      error: error => {
        log.warn('force update remote config listener failed:', error?.message);
      },
    });

    fetchAndApply();

    return () => {
      mounted = false;
      appStateSubscription.remove();
      remoteConfigUnsubscribe();
    };
  }, []);

  return forceUpdateState;
}
