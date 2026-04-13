import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import styles from './ReservationCheck.styles';

import SearchIcon from '@assets/images/search_gray.svg';
import ClockIcon from '@assets/images/clock_gray.svg';
import PhoneIcon from '@assets/images/phone_fill_black.svg';
import ChevronRightIcon from '@assets/images/chevron_right_gray.svg';

const summaryCards = [
  {label: '남자', value: '12명'},
  {label: '여자', value: '12명'},
  {label: '성비', value: '1:1'},
];

const reservations = [
  {
    id: 1,
    name: '박보현',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: false,
  },
  {
    id: 2,
    name: '이영희',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: true,
  },
  {
    id: 3,
    name: '박지수',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: true,
  },
  {
    id: 4,
    name: '최민호',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
    isBirthday: false,
  },
];

const ReservationCheck = () => {
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
          <Text style={[FONTS.fs_14_medium, styles.headerDate]}>05/24 (금)</Text>
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
                  FONTS.fs_20_semibold,
                  item.label === '성비' ? styles.summaryRatio : styles.summaryValue,
                ]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.searchBox}>
          <SearchIcon width={18} height={18} />
          <TextInput
            editable={false}
            placeholder="예약자 성함 검색"
            placeholderTextColor={COLORS.grayscale_400}
            style={[FONTS.fs_14_regular, styles.searchInput]}
            value=""
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[FONTS.fs_16_semibold, styles.listTitle]}>예약 명단</Text>
          <Text style={[FONTS.fs_16_semibold, styles.listCount]}>24</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.sortButton}>
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
                  {item.isBirthday ? (
                    <View style={styles.birthdayBadge}>
                      <Text style={[FONTS.fs_12_medium, styles.birthdayText]}>
                        🎂
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[FONTS.fs_12_medium, styles.birthText]}>
                    {item.birthYear}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <ClockIcon width={12} height={12} />
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

        <TouchableOpacity activeOpacity={0.8} style={styles.historyButton}>
          <ClockIcon width={16} height={16} />
          <Text style={[FONTS.fs_14_medium, styles.historyButtonText]}>
            지난 예약 내역 확인하기
          </Text>
          <ChevronRightIcon width={16} height={16} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ReservationCheck;
