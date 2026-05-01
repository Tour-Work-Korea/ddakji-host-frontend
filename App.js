import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import 'react-native-gesture-handler';

import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';
import InAppNotificationBanner from '@components/notifications/InAppNotificationBanner';
import AlertModal from '@components/modals/AlertModal';
import DeeplinkHandler from '@utils/deeplinkHandler';
import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';
import {subscribe} from '@utils/loginModalHub';
import {initializeNotifications} from '@utils/notifications';
import usePresenceHeartbeat from '@hooks/usePresenceHeartbeat';
import useForceUpdate from '@hooks/useForceUpdate';
import LottieView from 'lottie-react-native';
import {navigationRef} from '@utils/navigationService';
import LogoOrange from '@assets/images/meet_reservation_success.svg';
import {openPartnerCenterStore} from '@utils/forceUpdate';
import {
  SafeAreaView,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

const toastConfig = {
  success: props => <BasicToast {...props} />,
  error: props => <ErrorToast {...props} />,
  notification: props => <BasicToast {...props} />,
};

function SplashOverlay({onFinish}) {
  return (
    <View style={styles.splashOverlay}>
      <LottieView
        source={require('@assets/lottie/splash.json')}
        style={StyleSheet.absoluteFillObject}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
      />
    </View>
  );
}

const wait = ms => new Promise(r => setTimeout(r, ms));
const waitForNavReady = async () => {
  let tries = 0;
  while (!navigationRef.isReady() && tries < 100) {
    await wait(30);
    tries++;
  }
};

function AppContent() {
  const [appLoaded, setAppLoaded] = useState(false);
  const forceUpdateState = useForceUpdate();
  const [loginModal, setLoginModal] = useState({
    visible: false,
    title: '',
    message: '',
    buttonText: '확인',
    buttonText2: null,
    onPress: null,
    onPress2: null,
  });

  usePresenceHeartbeat();

  useEffect(() => {
    console.log('🚨 API_BASE_URL (runtime):', process.env.API_BASE_URL);
    const bootstrap = async () => {
      try {
        await wait(120);
        await waitForNavReady();
        await tryAutoLogin();
      } finally {
        setAppLoaded(true); // 스플래시 제거
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    let unsubscribeNotifications = () => {};

    const setupNotifications = async () => {
      unsubscribeNotifications = (await initializeNotifications()) || (() => {});
    };

    setupNotifications();

    return () => {
      unsubscribeNotifications();
    };
  }, []);

  useEffect(() => {
    const unsub = subscribe(updater => setLoginModal(updater));
    return unsub;
  }, []);

  const closeLoginModal = () =>
    setLoginModal(prev => ({...prev, visible: false}));

  const handleLoginModalConfirm = () => {
    const cb = loginModal.onPress;
    closeLoginModal();
    requestAnimationFrame(() => cb?.());
  };

  const handleLoginModalCancel = () => {
    const cb = loginModal.onPress2;
    closeLoginModal();
    requestAnimationFrame(() => cb?.());
  };

  return (
    <>
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        <StatusBar
          translucent={false}
          backgroundColor={COLORS.grayscale_100}
          barStyle="dark-content"
        />

        <RootNavigation />
        <DeeplinkHandler />
        <InAppNotificationBanner />
      </SafeAreaView>

      {!appLoaded && (
        <SplashOverlay
          onFinish={() => {
            /* 부팅 로직 끝날 때 숨김 */
          }}
        />
      )}
      <Toast config={toastConfig} />
      <AlertModal
        visible={loginModal.visible}
        title={loginModal.title}
        message={loginModal.message}
        buttonText={loginModal.buttonText || '확인'}
        buttonText2={loginModal.buttonText2}
        onPress={handleLoginModalConfirm}
        onPress2={handleLoginModalCancel}
      />
      <AlertModal
        visible={forceUpdateState.visible}
        title="새로운 버전이 출시되었습니다!"
        message={`더욱 안정적인 서비스 이용을 위해\n최신 버전으로 업데이트가 필요합니다.\n\n최신 버전: V${forceUpdateState.minVersion}`}
        buttonText="업데이트 하기"
        onPress={openPartnerCenterStore}
        onRequestClose={() => {}}
        iconElement={<LogoOrange width={180} height={150} />}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
