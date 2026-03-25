import {View, TouchableOpacity, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';

import styles from './LoginIntro.styles';
import MailBlue from '@assets/images/mail_fill_blue.svg';
import LogoWithText from '@assets/images/logo_orange_with_text.svg';
import { COLORS } from '@constants/colors';

const LoginIntro = () => {
  const navigation = useNavigation();

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoWithText width={143} />
        </View>
        <View style={styles.frameParent}>
          <View style={styles.buttonParent}>
            <ButtonWhite
              title="비즈니스 회원으로 시작하기"
              onPress={() =>
                navigation.navigate('LoginByEmail', {userRole: 'HOST'})
              }
              Icon={MailBlue}
              outlined={true}
              textColor={COLORS.primary_blue}
              borderColor={COLORS.primary_blue}
            />
          </View>
        </View>
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={'확인'}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </View>
  );
};

export default LoginIntro;
