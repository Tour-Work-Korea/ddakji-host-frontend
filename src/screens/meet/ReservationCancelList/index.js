import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import styles from './ReservationCancelList.styles';

import PhoneIcon from '@assets/images/phone_black.svg';

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

const formatActionTime = (value, approvalStatus) => {
  let suffix = '신청취소';
  if (approvalStatus === 'REJECTED') {
    suffix = '신청반려';
  } else if (approvalStatus === 'WITHDRAWN') {
    suffix = '신청취소';
  }

  if (!value) return suffix;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return suffix;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${suffix}`;
};

const mapGenderLabel = gender => {
  if (!gender) return '';
  const g = String(gender).trim().toUpperCase();
  if (g === 'MALE' || g === 'M' || g === '남' || g === '남자') return '남';
  if (g === 'FEMALE' || g === 'F' || g === '여' || g === '여자') return '여';
  return '여'; // default fallback to avoid empty badge
};

const formatPhoneNumber = phone => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const normalizeCanceledReservation = item => ({
  id: item?.reservationId ?? `${item?.phoneNumber}-${item?.actionTime}`,
  name: item?.reserverName ?? '',
  gender: mapGenderLabel(item?.gender),
  birthYear: item?.birthYear ?? '',
  time: formatActionTime(item?.actionTime, item?.approvalStatus),
  phone: formatPhoneNumber(item?.phoneNumber),
  isGuest: item?.isGuest ?? item?.isGuestStatus ?? false,
});

const ReservationCancelList = () => {
  const route = useRoute();
  const initialSelectedDate = route?.params?.selectedDate ?? getTodayLocalDate();
  const guesthouseId = route?.params?.guesthouseId ?? null;
  const partyId = route?.params?.partyId ?? null;
  const partyTitle = route?.params?.partyTitle ?? '파티 이름 없음';
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (!guesthouseId || !partyId) {
      setReservations([]);
      return;
    }

    let isMounted = true;

    const fetchCanceledReservations = async () => {
      try {
        setIsLoading(true);
        const response = await hostMeetApi.getPartyReservationSummary(
          guesthouseId,
          initialSelectedDate,
          partyId,
        );
        const data = response?.data ?? {};

        if (!isMounted) return;

        setReservations(
          Array.isArray(data?.canceledReservations)
            ? data.canceledReservations.map(normalizeCanceledReservation)
            : [],
        );
      } catch (error) {
        if (!isMounted) return;

        setReservations([]);
        Toast.show({
          type: 'error',
          text1:
            error?.response?.data?.message || '신청 취소 명단을 불러오지 못했어요.',
          position: 'top',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCanceledReservations();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, initialSelectedDate, partyId]);

  const handleCall = async phoneNumber => {
    const digits = String(phoneNumber || '').replace(/[^\d]/g, '');
    if (!digits) {
      return Toast.show({
        type: 'error',
        text1: '통화할 수 있는 번호가 없어요',
        position: 'top',
        visibilityTime: 2500,
      });
    }

    const url = `tel:${digits}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        return Toast.show({
          type: 'error',
          text1: '전화앱을 열 수 없어요',
          position: 'top',
          visibilityTime: 2500,
        });
      }
      await Linking.openURL(url);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '전화앱을 열 수 없어요',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="신청 취소 명단" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.partyContextCard}>
          <Text
            numberOfLines={1}
            style={[FONTS.fs_16_semibold, styles.partyContextTitle]}>
            {partyTitle}
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.partyContextDate]}>
            {formatDateToMonthDay(initialSelectedDate)}
          </Text>
        </View>

        <View style={styles.listHeader}>
          <Text style={[FONTS.fs_16_medium, styles.listTitle]}>
            신청 취소 명단
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.listCount]}>
            {reservations.length}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator color={COLORS.primary_orange} />
          </View>
        ) : !partyId ? (
          <View style={styles.feedbackContainer}>
            <Text style={[FONTS.fs_14_medium, styles.feedbackText]}>
              파티 정보를 확인할 수 없어요.
            </Text>
          </View>
        ) : reservations.length === 0 ? (
          <View style={styles.feedbackContainer}>
            <Text style={[FONTS.fs_14_medium, styles.feedbackText]}>
              예약 취소 내역이 없어요.
            </Text>
          </View>
        ) : (
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
                      {item.isGuest ? '숙박객' : '비숙박객'} · {item.birthYear}
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

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.callButton}
                  onPress={() => handleCall(item.phone)}>
                  <PhoneIcon width={18} height={18} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ReservationCancelList;
