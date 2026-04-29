import {useEffect} from 'react';
import {AppState} from 'react-native';
import useUserStore from '@stores/userStore';
import presenceApi from '@utils/api/presenceApi';
import {log} from '@utils/logger';

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export default function usePresenceHeartbeat() {
  const accessToken = useUserStore(state => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let intervalId = null;
    let inFlight = false;

    const stopHeartbeat = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const sendHeartbeat = async () => {
      const currentToken = useUserStore.getState().accessToken;
      if (inFlight || AppState.currentState !== 'active' || !currentToken) {
        return;
      }

      inFlight = true;
      try {
        await presenceApi.heartbeat();
      } catch (error) {
        log.warn(
          'presence heartbeat failed:',
          error?.response?.status,
          error?.message,
        );
      } finally {
        inFlight = false;
      }
    };

    const startHeartbeat = () => {
      if (AppState.currentState !== 'active' || intervalId) {
        return;
      }

      sendHeartbeat();
      intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'active') {
          startHeartbeat();
        } else {
          stopHeartbeat();
        }
      },
    );

    startHeartbeat();

    return () => {
      stopHeartbeat();
      appStateSubscription.remove();
    };
  }, [accessToken]);
}
