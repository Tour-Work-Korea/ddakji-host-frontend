import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import styles from './ReservationCheck.styles';

import SearchIcon from '@assets/images/search_gray.svg';
import ClockIcon from '@assets/images/history_gray.svg';
import PhoneIcon from '@assets/images/phone_black.svg';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatHeaderDate = localDate => {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0',
  )} (${DAY_LABELS[date.getDay()]})`;
};

const formatActionTime = (value, suffix) => {
  if (!value) return suffix;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return suffix;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${suffix}`;
};

const mapGenderLabel = gender => (gender === 'MALE' ? '남' : '여');

const normalizeReservationItem = (item, isCanceled = false) => ({
  id: item?.reservationId ?? `${item?.phoneNumber}-${item?.actionTime}`,
  name: item?.reserverName ?? '',
  gender: mapGenderLabel(item?.gender),
  birthYear: item?.birthYear ?? '',
  time: formatActionTime(item?.actionTime, isCanceled ? '신청취소' : '신청'),
  phone: item?.phoneNumber ?? '',
  isCanceled: Boolean(item?.isCanceled ?? isCanceled),
});

const buildRatioText = (maleCount, femaleCount) => {
  const male = Number(maleCount) || 0;
  const female = Number(femaleCount) || 0;

  if (male === 0 && female === 0) return '-';
  if (male === 0) return `0:${female}`;
  if (female === 0) return `${male}:0`;
  return `${male}:${female}`;
};

const ReservationCheck = ({guesthouseId}) => {
  const navigation = useNavigation();
  const today = useMemo(() => getTodayLocalDate(), []);
  const formattedToday = useMemo(() => formatHeaderDate(today), [today]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reservations, setReservations] = useState([]);
  const [canceledReservations, setCanceledReservations] = useState([]);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);

  useEffect(() => {
    if (!guesthouseId) {
      setReservations([]);
      setCanceledReservations([]);
      setMaleCount(0);
      setFemaleCount(0);
      return;
    }

    let isMounted = true;

    const fetchReservationSummary = async () => {
      try {
        setIsLoading(true);
        const response = await hostMeetApi.getPartyReservationSummary(
          guesthouseId,
          today,
        );
        const data = response?.data ?? {};

        if (!isMounted) return;

        setReservations(
          Array.isArray(data?.reservations)
            ? data.reservations.map(item => normalizeReservationItem(item, false))
            : [],
        );
        setCanceledReservations(
          Array.isArray(data?.canceledReservations)
            ? data.canceledReservations.map(item => normalizeReservationItem(item, true))
            : [],
        );
        setMaleCount(Number(data?.maleCount) || 0);
        setFemaleCount(Number(data?.femaleCount) || 0);
      } catch (error) {
        if (!isMounted) return;

        setReservations([]);
        setCanceledReservations([]);
        setMaleCount(0);
        setFemaleCount(0);
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.message || '예약 현황을 불러오지 못했어요.',
          position: 'top',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReservationSummary();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, today]);

  const summaryCards = useMemo(
    () => [
      {label: '남자', value: `${maleCount}명`},
      {label: '여자', value: `${femaleCount}명`},
      {label: '성비', value: buildRatioText(maleCount, femaleCount)},
    ],
    [femaleCount, maleCount],
  );

  const filteredReservations = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return reservations;

    return reservations.filter(item => item.name.includes(keyword));
  }, [reservations, searchKeyword]);

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
            placeholder="예약자 성함 검색"
            placeholderTextColor={COLORS.grayscale_400}
            style={[FONTS.fs_14_medium, styles.searchInput]}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[FONTS.fs_16_medium, styles.listTitle]}>예약 명단</Text>
          <Text style={[FONTS.fs_14_medium, styles.listCount]}>
            {filteredReservations.length}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.sortButton}
          onPress={() =>
            navigation.navigate('ReservationCancelList', {
              guesthouseId,
              selectedDate: today,
            })
          }>
          <Text style={[FONTS.fs_12_medium, styles.sortButtonText]}>
            예약 취소 명단 보기 &gt;
          </Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator color={COLORS.primary_orange} />
          </View>
        ) : filteredReservations.length === 0 ? (
          <View style={styles.feedbackContainer}>
            <Text style={[FONTS.fs_14_medium, styles.feedbackText]}>
              예약 내역이 없어요.
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            {filteredReservations.map(item => (
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

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.historyButton}
          onPress={() =>
            navigation.navigate('PastReservationList', {
              guesthouseId,
            })
          }>
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
