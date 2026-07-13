import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ArrowLeft from '@assets/images/arrow_left_black.svg';

import styles from './Login.styles';

const AuthBackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
      <ArrowLeft width={24} height={24} />
    </TouchableOpacity>
  );
};

export default AuthBackButton;
