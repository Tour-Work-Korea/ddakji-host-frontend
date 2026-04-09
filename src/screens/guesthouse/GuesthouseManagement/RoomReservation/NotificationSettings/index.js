import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import styles from './NotificationSettings.styles';

import RightArrow from '@assets/images/chevron_right_black.svg';

const NotificationSettings = ({embedded = false, guesthouseId = null}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {!embedded && <Header title="고객 알림 설정" />}

      <View style={[styles.body, embedded && styles.embeddedBody]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CheckInGuide', {guesthouseId})}
          style={styles.selectRow}
          activeOpacity={0.8}>
          <Text style={[FONTS.fs_16_medium, styles.profileTitleText]}>
            체크인 안내문
          </Text>
          <RightArrow width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationSettings;
