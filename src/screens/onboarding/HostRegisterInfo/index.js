import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import { validateHostRegister } from '@utils/validation/registerValidation';
import AlertModal from '@components/modals/AlertModal';
import ButtonWhite from '@components/ButtonWhite';
import { tryLogin } from '@utils/auth/login';

import styles from './Register.styles';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import Logo from '@assets/images/logo_blue.svg';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';

const HostRegisterInfo = ({ route }) => {
  const { agreements, email, phoneNumber } = route.params;
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    agreements,
    password: '',
    passwordConfirm: '',
    name: '',
    email: email,
    userRole: 'HOST',
    phoneNum: phoneNumber,
  });
  const [formValid, setFormValid] = useState({
    name: false,
    password: [],
    passwordConfirm: [],
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
    onPress: '',
  });

  useFocusEffect(
    useCallback(() => {
      setFormData({
        password: '',
        passwordConfirm: '',
        name: '',
        agreements,
        email: email,
        userRole: 'HOST',
        phoneNum: phoneNumber,
      });

      setFormValid({
        name: false,
        password: [],
        passwordConfirm: [],
      });

      setIsPasswordVisible(false);
      setIsPasswordCheckVisible(false);
      setErrorModal({
        visible: false,
        message: '',
        buttonText: '',
        onPress: '',
      });
    }, [agreements, email, phoneNumber]),
  );

  const updateField = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFormValid(validateHostRegister(updated));
  };

  const handleNameChange = text => {
    updateField('name', text);
    setFormValid({
      ...formValid,
      name: validateHostRegister({ ...formData, name: text }).name,
    });
  };
  const handlePasswordChange = text => {
    updateField('password', text);
    const nextValid = {
      ...formValid,
      password: validateHostRegister({ ...formData, password: text }).password,
      passwordConfirm: {
        isMatched: text === formData.passwordConfirm,
      },
    };
    setFormValid(nextValid);
  };

  const handlePasswordConfirmChange = text => {
    updateField('passwordConfirm', text);
    setFormValid(prev => ({
      ...prev,
      passwordConfirm: {
        isMatched: text === formData.password,
      },
    }));
  };



  const handleSubmit = async () => {
    try {
      await authApi.hostSignUp(formData);
      navigation.navigate('Result', {
        onPress: afterSuccessRegister,
        onClose: afterSuccessRegisterGoHome,
        buttonTitle: '게스트하우스 등록 시작하기',
        nickname: formData.name,
        role: 'HOST',
      });
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error.response?.data?.message ||
          '오류가 발생했습니다\n다시 시도해주세요',
        buttonText: '확인',
        onPress: () => setErrorModal(prev => ({ ...prev, visible: false })),
      });
    }
  };

  const afterSuccessRegister = async () => {
    try {
      await tryLogin(formData.email, formData.password, 'HOST');
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'MainTabs', params: { screen: '홈' } },
            { name: 'StoreRegisterForm1' },
          ],
        }),
      );
    } catch (error) {
      console.log('Login failed', error);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'AuthIntro' }],
        }),
      );
    }
  };

  const afterSuccessRegisterGoHome = async () => {
    try {
      await tryLogin(formData.email, formData.password, 'HOST');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: '홈' } }],
        }),
      );
    } catch (error) {
      console.log('Login failed', error);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'AuthIntro' }],
        }),
      );
    }
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // 필요 시 조정
        >
          <ScrollView
            style={styles.keyboardAvoidingView}
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.viewFlexBox}>
              <View>
                {/* 로고 및 문구 */}
                <View style={styles.groupParent}>
                  <Logo width={60} height={29} />
                  <View>
                    <Text style={[styles.titleText]}>
                      게딱지에 등록하기 위한,
                    </Text>
                    <Text style={[styles.titleText]}>
                      필수정보를 알려주세요
                    </Text>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>이름</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="이름을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.name}
                        onChangeText={handleNameChange}
                        maxLength={30}
                      />
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>비밀번호</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="비밀번호를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.password}
                        onChangeText={handlePasswordChange}
                        maxLength={20}
                        secureTextEntry={!isPasswordVisible}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setIsPasswordVisible(prev => !prev)}>
                        {isPasswordVisible ? (
                          <HidePassword width={24} hide={24} />
                        ) : (
                          <ShowPassword width={24} hide={24} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.validBox}>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.hasUpperLowercase
                            ? styles.validText
                            : '',
                        ]}>
                        영문 대소문자 포함
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.hasNumber ? styles.validText : '',
                        ]}>
                        숫자 포함
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.hasSpecialChar
                            ? styles.validText
                            : '',
                        ]}>
                        특수문자 포함
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.isLengthValid
                            ? styles.validText
                            : '',
                        ]}>
                        8-20자 이내
                      </Text>
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="다시 한 번 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.passwordConfirm}
                        onChangeText={handlePasswordConfirmChange}
                        maxLength={20}
                        secureTextEntry={!isPasswordCheckVisible}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setIsPasswordCheckVisible(prev => !prev)
                        }>
                        {isPasswordCheckVisible ? (
                          <HidePassword width={24} hide={24} />
                        ) : (
                          <ShowPassword width={24} hide={24} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.validBox}>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.passwordConfirm.isMatched
                            ? styles.validText
                            : '',
                        ]}>
                        비밀번호 일치
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View>
                <ButtonWhite
                  title="다음"
                  onPress={handleSubmit}
                  backgroundColor={COLORS.primary_blue}
                  textColor={COLORS.grayscale_0}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          onPress={errorModal.onPress}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HostRegisterInfo;
