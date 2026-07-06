import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import styles from './ApplicantList.styles';
import {formatLocalDateToDot} from '@utils/formatDate';
import Avatar from '@components/Avatar';
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

export default function ApplicantCard({item, handleApplicantPress}) {
  const instagramId = getInstagramId(item?.instagram);
  const phoneNumber = formatPhoneNumber(item?.phone);

  const handleCopyPhone = event => {
    event?.stopPropagation?.();

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
    <TouchableOpacity onPress={() => handleApplicantPress(item.id)}>
      <View style={styles.applicantCard}>
        <View style={styles.applyRow}>
          <Text style={styles.applyBox}>지원 날짜</Text>
          <Text style={styles.applyBox}>
            {formatLocalDateToDot(item.applyDate)}
          </Text>
        </View>

        <View style={styles.applicantInfo}>
          <View style={styles.profileImageContainer}>
            <Avatar
              uri={item.photoUrl}
              size={68}
              iconSize={32}
              borderRadius={8}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.detailsContainer}>
            <TouchableOpacity
              style={styles.infoRow}
              disabled={!phoneNumber}
              activeOpacity={phoneNumber ? 0.7 : 1}
              onPress={handleCopyPhone}>
              <Text style={styles.infoLabel}>연락처</Text>
              <Text style={styles.infoValue}>{phoneNumber}</Text>
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MBTI</Text>
              <Text style={styles.infoValue}>{item.mbti}</Text>
            </View>

            <TouchableOpacity
              style={styles.infoRow}
              disabled={!instagramId}
              activeOpacity={instagramId ? 0.7 : 1}
              onPress={
                instagramId
                  ? event => {
                      event?.stopPropagation?.();
                      openWebLink(`https://www.instagram.com/${instagramId}`);
                    }
                  : null
              }>
              <Text style={styles.infoLabel}>insta</Text>
              <Text style={styles.infoValue}>{instagramId}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.introductionText}>{item.resumeTitle}</Text>
        <View style={styles.tagsRow}>
          {item.userHashtag.map(tag => (
            <Text key={tag.id} style={styles.hashTag}>
              {tag.hashtag}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}
