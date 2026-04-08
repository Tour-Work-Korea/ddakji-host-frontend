import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {navigate} from '@utils/navigationService';

const DEFAULT_TITLE = '로그인이 필요합니다';
const DEFAULT_MESSAGE = '로그인 후 이용할 수 있는 서비스입니다.\n로그인 화면으로 이동할까요?';
const DEFAULT_BUTTON_TEXT = '로그인';
const DEFAULT_BUTTON_TEXT2 = '취소';

export const promptLoginRequired = ({
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  buttonText = DEFAULT_BUTTON_TEXT,
  buttonText2 = DEFAULT_BUTTON_TEXT2,
  onConfirm,
  onCancel,
} = {}) => {
  showErrorModal({
    title,
    message,
    buttonText,
    buttonText2,
    onPress: () => {
      onConfirm?.();
      navigate('Login');
    },
    onPress2: () => {
      onCancel?.();
    },
  });
};

export const requireLogin = options => {
  const {accessToken} = useUserStore.getState();

  if (accessToken) {
    return true;
  }

  promptLoginRequired(options);
  return false;
};

export const navigateWithLoginGuard = (routeName, params, options) => {
  const isLoggedIn = requireLogin(options);

  if (!isLoggedIn) {
    return false;
  }

  navigate(routeName, params);
  return true;
};
