import React, {useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';

import Header from '@components/Header';
import {CALENDAR_COMMON_PROPS, CALENDAR_THEME} from '@constants/calendarConfig';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import styles from './ReservationCancelList.styles';

import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import PhoneIcon from '@assets/images/phone_black.svg';

const reservations = [
  {
    id: 1,
    name: '이아무',
    gender: '남',
    birthYear: '1992년생',
    time: '14:20 신청취소',
    phone: '010-1234-5678',
  },
  {
    id: 2,
    name: '이영희',
    gender: '여',
    birthYear: '1992년생',
    time: '14:20 신청취소',
    phone: '010-1234-5678',
  },
  {
    id: 3,
    name: '박지수',
    gender: '여',
    birthYear: '1992년생',
    time: '14:20 신청취소',
    phone: '010-1234-5678',
  },
  {
    id: 4,
    name: '최민호',
    gender: '남',
    birthYear: '1992년생',
    time: '14:20 신청취소',
    phone: '010-1234-5678',
  },
];

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToMonthDay = localDate => {
  const [, month, day] = localDate.split('-');
  return `${month}/${day}`;
};

const shiftDate = (baseDate, diffDays) => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + diffDays);
  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ReservationCancelList = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  };

  return (
    <View style={styles.container}>
      <Header title="예약 취소 명단" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateSelectContainer}>
          <View style={styles.dateSelectBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedDate(prev => shiftDate(prev, -1))}>
              <ChevronLeft width={24} height={24} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsCalendarOpen(prev => !prev)}>
              <Text style={[FONTS.fs_16_medium, styles.dateText]}>
                {formatDateToMonthDay(selectedDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedDate(prev => shiftDate(prev, 1))}>
              <ChevronRight width={24} height={24} />
            </TouchableOpacity>
          </View>

          {isCalendarOpen ? (
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                {...CALENDAR_COMMON_PROPS}
                markedDates={markedDates}
                onDayPress={day => {
                  setSelectedDate(day.dateString);
                  setIsCalendarOpen(false);
                }}
                theme={CALENDAR_THEME}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.listHeader}>
          <Text style={[FONTS.fs_16_medium, styles.listTitle]}>
            예약 취소 명단
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.listCount]}>4</Text>
        </View>

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
                  <View style={styles.metaDivider} />
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
      </ScrollView>
    </View>
  );
};

export default ReservationCancelList;
