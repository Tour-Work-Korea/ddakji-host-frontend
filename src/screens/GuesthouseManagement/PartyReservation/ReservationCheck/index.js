import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import styles from './ReservationCheck.styles';

import SearchIcon from '@assets/images/search_gray.svg';
import ClockIcon from '@assets/images/history_gray.svg';
import PhoneIcon from '@assets/images/phone_black.svg';

const summaryCards = [
  {label: '남자', value: '12명'},
  {label: '여자', value: '12명'},
  {label: '성비', value: '1:1'},
];

const reservations = [
  {
    id: 1,
    name: '박보현',
    gender: '남',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: false,
  },
  {
    id: 2,
    name: '이영희',
    gender: '여',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: true,
  },
  {
    id: 3,
    name: '박지수',
    gender: '여',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: true,
  },
  {
    id: 4,
    name: '최민호',
    gender: '남',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: false,
  },
];

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const ReservationCheck = () => {
  const navigation = useNavigation();
  const today = new Date();
  const formattedToday = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(
    today.getDate(),
  ).padStart(2, '0')} (${DAY_LABELS[today.getDay()]})`;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={[FONTS.fs_16_semibold, styles.headerTitle]}>
            오늘의 파티 예약 현황
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.headerDate]}>
            {formattedToday}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          {summaryCards.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.summaryItem,
                index !== summaryCards.length - 1 && styles.summaryItemBorder,
              ]}>
              <Text style={[FONTS.fs_12_medium, styles.summaryLabel]}>
                {item.label}
              </Text>
              <Text
                style={[
                  FONTS.fs_18_semibold,
                  item.label === '남자'
                    ? styles.summaryMaleValue
                    : item.label === '여자'
                      ? styles.summaryFemaleValue
                      : styles.summaryRatio,
                ]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.searchBox}>
          <SearchIcon width={20} height={20} />
          <TextInput
            editable={false}
            placeholder="예약자 성함 검색"
            placeholderTextColor={COLORS.grayscale_400}
            style={[FONTS.fs_14_medium, styles.searchInput]}
            value=""
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[FONTS.fs_16_medium, styles.listTitle]}>예약 명단</Text>
          <Text style={[FONTS.fs_14_medium, styles.listCount]}>24</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.sortButton}
          onPress={() => navigation.navigate('ReservationCancelList')}>
          <Text style={[FONTS.fs_12_medium, styles.sortButtonText]}>
            예약 취소 명단 보기 &gt;
          </Text>
        </TouchableOpacity>

        <View style={styles.listSection}>
          {reservations.map(item => (
            <View key={item.id} style={styles.reservationCard}>
              <View style={styles.reservationInfo}>
                <View style={styles.nameRow}>
                  <Text style={[FONTS.fs_16_semibold, styles.nameText]}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.genderBadge,
                      item.gender === '남'
                        ? styles.genderMaleBadge
                        : styles.genderFemaleBadge,
                    ]}>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        item.gender === '남'
                          ? styles.genderMaleText
                          : styles.genderFemaleText,
                      ]}>
                      {item.gender}
                    </Text>
                  </View>
                  <Text style={[FONTS.fs_12_medium, styles.birthText]}>
                    {item.birthYear}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={[FONTS.fs_12_medium, styles.metaText]}>
                    {item.time}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.metaDivider]}>|</Text>
                  <Text style={[FONTS.fs_12_medium, styles.metaText]}>
                    {item.phone}
                  </Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.8} style={styles.callButton}>
                <PhoneIcon width={18} height={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.historyButton}
          onPress={() => navigation.navigate('PastReservationList')}>
          <ClockIcon width={16} height={16} />
          <Text style={[FONTS.fs_14_semibold, styles.historyButtonText]}>
            지난 예약 내역 확인하기
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ReservationCheck;
