import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

// 사용법
// import Toast from 'react-native-toast-message';
// Toast.show({
//   type: 'success',
//   text1: '복사되었어요!',
//   position: 'top',
//   visibilityTime: 2000,
// });

const BasicToast = ({text1, text2, onPress}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}>
      <Text style={[FONTS.fs_14_medium, styles.text]}>{text1}</Text>
      {text2 ? <Text style={[FONTS.fs_12_medium, styles.subText]}>{text2}</Text> : null}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.grayscale_900,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 30,
    zIndex: 100,
    maxWidth: '88%',
    gap: 4,
  },
  text: {
    color: COLORS.grayscale_0,
  },
  subText: {
    color: COLORS.grayscale_200,
  },
});

export default BasicToast;
