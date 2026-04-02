import {View, TouchableOpacity, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';

import Loading from '@components/Loading';
import AlertModal from '@components/modals/AlertModal';

import styles from './Intro.styles';
import Mail from '@assets/images/mail_black.svg';
import LogoWithText from '@assets/images/logo_orange_with_text.svg';
import ButtonWhite from '@components/ButtonWhite';

const RegisterIntro = () => {
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  const navigation = useNavigation();

  if (loading) {
    return <Loading title="로딩 중..." />;
  }
  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoWithText width={143} />
        </View>
          <View style={styles.frameParent}>
          <View style={styles.buttonParent}>
            <ButtonWhite
              title="비즈니스 회원가입"
              onPress={() =>
                navigation.navigate('RegisterAgree', {user: 'HOST'})
              }
              Icon={Mail}
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

export default RegisterIntro;
