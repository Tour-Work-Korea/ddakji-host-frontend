import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import ChevronRightIcon from '@assets/images/chevron_right_gray.svg';

import styles from './MyMeetTypeSelect.styles';

const CONTENT_SCHEDULE_TYPES = {
  DAILY: 'DAILY',
  DATE_EVENT: 'DATE_EVENT',
};

const MyMeetTypeSelect = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const guesthouseId = route.params?.guesthouseId;

  const handleSelectType = scheduleType => {
    navigation.navigate('MyMeetAdd', {
      guesthouseId,
      scheduleType,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="콘텐츠 등록" />

      <View style={styles.content}>
        <Text style={[FONTS.fs_22_bold, styles.title]}>
          어떤 콘텐츠를 등록할까요?
        </Text>
        <Text style={[FONTS.fs_14_medium, styles.description]}>
          운영 방식에 맞는 유형을 선택해주세요.
        </Text>

        <TouchableOpacity
          style={styles.typeCard}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel="데일리 콘텐츠 등록"
          onPress={() => handleSelectType(CONTENT_SCHEDULE_TYPES.DAILY)}>
          <View style={styles.typeTextWrap}>
            <View style={styles.typeTitleRow}>
              <Text style={[FONTS.fs_18_semibold, styles.typeTitle]}>
                데일리 콘텐츠
              </Text>
              <View style={styles.dailyBadge}>
                <Text style={[FONTS.fs_12_medium, styles.dailyBadgeText]}>
                  매일 반복
                </Text>
              </View>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.typeDescription]}>
              매일 운영하는 파티나 프로그램을 등록해요.
            </Text>
          </View>
          <ChevronRightIcon width={24} height={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.typeCard}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel="날짜 지정 이벤트 등록"
          onPress={() => handleSelectType(CONTENT_SCHEDULE_TYPES.DATE_EVENT)}>
          <View style={styles.typeTextWrap}>
            <View style={styles.typeTitleRow}>
              <Text style={[FONTS.fs_18_semibold, styles.typeTitle]}>
                날짜 지정 이벤트
              </Text>
              <View style={styles.eventBadge}>
                <Text style={[FONTS.fs_12_medium, styles.eventBadgeText]}>
                  날짜 선택
                </Text>
              </View>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.typeDescription]}>
              특정 날짜에 한 번 진행하는 이벤트를 등록해요.
            </Text>
          </View>
          <ChevronRightIcon width={24} height={24} />
        </TouchableOpacity>

        <View style={styles.guideBox}>
          <Text style={[FONTS.fs_12_medium, styles.guideText]}>
            등록한 유형에 따라 게스트 앱의 데일리 콘텐츠와 이벤트 영역에
            구분하여 노출돼요.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MyMeetTypeSelect;
