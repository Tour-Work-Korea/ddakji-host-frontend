import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import XIcon from '@assets/images/x_gray.svg';

const StoreRegisterComplete = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const businessName = route.params?.businessName || '상호명';

  const handleClose = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'MainTabs', params: {screen: '홈'}}],
      }),
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.grayscale_0,
        paddingHorizontal: 24,
        paddingTop: 20,
      }}>
      <View style={{alignItems: 'flex-end'}}>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <XIcon width={28} height={28} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 120,
        }}>
        <Text
          style={{
            ...FONTS.fs_22_bold,
            color: COLORS.grayscale_800,
            marginBottom: 44,
          }}>
          게스트하우스 등록 신청 완료
        </Text>

        <Text
          style={{
            ...FONTS.fs_18_medium,
            color: COLORS.grayscale_700,
            textAlign: 'center',
            lineHeight: 30,
          }}>
          {`${businessName}에 대한 등록 심사가 진행중입니다.\n등록 신청에 대한 검토는\n영업일기준 `}
          <Text style={{color: COLORS.primary_orange}}>최대 5일</Text>
          {`이 소요됩니다.\n\n게딱지를 이용해주셔서 감사합니다.`}
        </Text>
      </View>
    </View>
  );
};

export default StoreRegisterComplete;
