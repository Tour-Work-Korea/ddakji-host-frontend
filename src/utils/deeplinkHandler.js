import {useEffect, useRef, useCallback} from 'react';
import {Linking, Alert} from 'react-native';
import {navigate, navigationRef} from './navigationService';
import useUserStore from '@stores/userStore';

const DeeplinkHandler = () => {
  const accessToken = useUserStore(state => state.accessToken);
  const userRole = useUserStore(state => state.userRole);
  const promptingRef = useRef(false); // 중복 알림/네비게이션 가드

  const wait = useCallback(ms => new Promise(resolve => setTimeout(resolve, ms)), []);
  const waitForNavigationReady = useCallback(async () => {
    let tries = 0;

    while (!navigationRef.isReady() && tries < 100) {
      await wait(30);
      tries += 1;
    }

    return navigationRef.isReady();
  }, [wait]);

  // 최초 실행시 (앱이 딥링크로 켜질 때)
  const shouldRequireLogin = () => false;

  const promptLogin = useCallback(
    (message = '서비스 이용을 위해 로그인 해주세요.') => {
      if (promptingRef.current) {
        return;
      }

      promptingRef.current = true;
      Alert.alert(
        '로그인이 필요합니다',
        message,
        [
          {
            text: '확인',
            onPress: () => {
              navigate('Login');
              promptingRef.current = false;
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            promptingRef.current = false;
          },
        },
      );
    },
    [],
  );

  const parseDeeplink = url => {
    const normalized = String(url || '').trim();
    const withoutScheme = normalized.replace(
      /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//,
      '',
    );
    const [pathPart = ''] = withoutScheme.split('?');
    const rawPath = pathPart.replace(/^\/+|\/+$/g, '');
    const parts = rawPath ? rawPath.split('/').filter(Boolean) : [];

    return {
      parts,
    };
  };

  const handleUrl = useCallback(
    async url => {
      console.log('딥링크 URL 받음:', url);

      try {
        const navReady = await waitForNavigationReady();
        if (!navReady) {
          console.warn('네비게이션 준비 전이라 딥링크 이동을 건너뜀', url);
          return;
        }

        const {parts} = parseDeeplink(url);

        if (shouldRequireLogin(parts) && (!accessToken || userRole !== 'HOST')) {
          promptLogin('서비스 이용을 위해 호스트 계정으로 로그인 해주세요.');
          return;
        }

        if (parts[0] === 'exDeeplink' && parts[1]) {
          navigate('EXHome');
        }
      } catch (e) {
        console.warn('딥링크 파싱 실패', e);
      }
    },
    [accessToken, promptLogin, userRole, waitForNavigationReady],
  );

  useEffect(() => {
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleUrl(initialUrl);
      }
    };

    checkInitialUrl();

    const subscription = Linking.addEventListener('url', ({url}) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleUrl]);

  // 화면에 아무것도 렌더링 안 함
  return null;
};

export default DeeplinkHandler;
