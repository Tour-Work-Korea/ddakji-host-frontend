import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import Avatar from '@components/Avatar';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {openWebLink} from '@utils/openWebLink';

const getInstagramId = value => {
  const instagramId = typeof value === 'string' ? value.trim() : '';

  if (!instagramId || instagramId === 'ID를 추가해주세요') {
    return '';
  }

  return instagramId;
};

const formatPhoneNumber = value => {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('02')) {
    if (digits.length === 9) {
      return digits.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  return value ?? '';
};

const ApplicantProfileHeader = ({data}) => {
  const instagramId = getInstagramId(data?.instagramId);
  const phoneNumber = formatPhoneNumber(data?.phone);

  const handleCopyPhone = () => {
    if (!phoneNumber) {
      return;
    }

    Clipboard.setString(phoneNumber);
    Toast.show({
      type: 'success',
      text1: '연락처가 복사되었습니다.',
      position: 'top',
    });
  };

  return (
    <View>
      <View style={styles.sectionBox}>
        <View style={styles.basicInfoContainer}>
          <Text style={styles.profileName}>{data?.nickname}</Text>
          <Text style={styles.basicInfoText}>
            {data?.gender === 'F' ? '여자!!!' : '남자'} • {data?.age}세 (
            {data?.birthDate.split('-')[0]}년생)
          </Text>
        </View>
        <View style={styles.profileMainContainer}>
          <Avatar
            uri={data?.photoUrl}
            size={116}
            iconSize={40}
            borderRadius={8}
            style={styles.profileImageContainer}
          />

          <View style={styles.infoContainer}>
            <InfoRow
              label="연락처"
              value={phoneNumber}
              onPress={phoneNumber ? handleCopyPhone : null}
            />
            <InfoRow label="이메일" value={data?.email} />
            <InfoRow label="MBTI" value={data?.mbti ?? data?.resumeMbti} />
            <InfoRow
              label="insta"
              value={instagramId}
              onPress={
                instagramId
                  ? () => {
                      openWebLink(`https://www.instagram.com/${instagramId}`);
                    }
                  : null
              }
            />
          </View>
        </View>
      </View>
    </View>
  );
};
const InfoRow = ({label, value, onPress = null}) => (
  <TouchableOpacity
    style={styles.infoRow}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? ''}</Text>
  </TouchableOpacity>
);

export default ApplicantProfileHeader;

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  //프로필
  basicInfoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  profileName: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  basicInfoText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },
  profileMainContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 116,
    height: 116,
    borderRadius: 8,
    backgroundColor: '#E6E9F0',
    alignSelf: 'center',
  },
  infoContainer: {flex: 1, gap: 4, justifyContent: 'center'},
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
    width: 50,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.grayscale_900,
    textAlign: 'left',
    flex: 1,
  },
});
