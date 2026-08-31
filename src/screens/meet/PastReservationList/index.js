import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import styles from './PastReservationList.styles';

import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import SearchIcon from '@assets/images/search_gray.svg';
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

const shiftDate = (baseDate, diffDays) => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + diffDays);
  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatActionTime = (value, suffix) => {
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
  return '여';
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

const normalizeReservation = (item, isCanceled = false) => {
  let suffix = '신청';
  if (isCanceled) {
    suffix = item?.approvalStatus === 'REJECTED' ? '신청반려' : '신청취소';
  } else {
    suffix = item?.approvalStatus === 'WAITING_HOST' ? '신청' : '신청확정';
  }

  return {
    id: item?.reservationId ?? `${item?.phoneNumber}-${item?.actionTime}`,
    name: item?.reserverName ?? '',
    gender: mapGenderLabel(item?.gender),
    birthYear: item?.birthYear ?? '',
    time: formatActionTime(item?.actionTime, suffix),
    phone: formatPhoneNumber(item?.phoneNumber),
    isGuest: item?.isGuest ?? item?.isGuestStatus ?? false,
  };
};

const buildRatioText = (maleCount, femaleCount) => {
  const male = Number(maleCount) || 0;
  const female = Number(femaleCount) || 0;

  if (male === 0 && female === 0) return '-';
  if (male === 0) return `0:${female}`;
  if (female === 0) return `${male}:0`;
  return `${male}:${female}`;
};

const getPartyId = party => party?.partyId ?? party?.id ?? null;
const getTemplateId = party =>
  party?.templateId ?? party?.partyTemplateId ?? party?.template?.templateId;
const getGuesthouseId = party =>
  party?.guesthouseId ?? party?.guesthouse?.guesthouseId;

const PastReservationList = () => {
  const route = useRoute();
  const today = useMemo(() => getTodayLocalDate(), []);
  const yesterday = useMemo(() => shiftDate(today, -1), [today]);
  const guesthouseId = route?.params?.guesthouseId ?? null;
  const templateId = route?.params?.templateId ?? null;
  const partyId = route?.params?.partyId ?? null;
  const partyTitle = route?.params?.partyTitle ?? '콘텐츠 이름 없음';
  const initialSelectedDate = route?.params?.selectedDate ?? yesterday;
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reservations, setReservations] = useState([]);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [partyInstances, setPartyInstances] = useState([]);
  const [isPartyHistoryLoading, setIsPartyHistoryLoading] = useState(
    Boolean(templateId),
  );

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  };
  const isLatestPastDate = selectedDate === yesterday;
  const scopedPartyId = useMemo(() => {
    if (selectedDate === initialSelectedDate && partyId) {
      return partyId;
    }

    return (
      partyInstances.find(party => party.partyDate === selectedDate)?.partyId ??
      null
    );
  }, [initialSelectedDate, partyId, partyInstances, selectedDate]);

  useEffect(() => {
    if (!templateId) {
      setPartyInstances([]);
      return;
    }

    let isMounted = true;

    const fetchPartyHistory = async () => {
      try {
        setIsPartyHistoryLoading(true);
        const response = await hostMeetApi.getAllParties();
        const data = response?.data;
        const parties = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.parties)
              ? data.parties
              : [];

        if (!isMounted) {
          return;
        }

        setPartyInstances(
          parties
            .filter(party => {
              const itemTemplateId = getTemplateId(party);
              const itemGuesthouseId = getGuesthouseId(party);
              return (
                String(itemTemplateId) === String(templateId) &&
                (itemGuesthouseId == null ||
                  String(itemGuesthouseId) === String(guesthouseId)) &&
                getPartyId(party) != null &&
                typeof party?.partyDate === 'string'
              );
            })
            .map(party => ({
              partyId: getPartyId(party),
              partyDate: party.partyDate,
            })),
        );
      } catch (error) {
        if (isMounted) {
          setPartyInstances([]);
        }
      } finally {
        if (isMounted) {
          setIsPartyHistoryLoading(false);
        }
      }
    };

    fetchPartyHistory();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, templateId]);

  useEffect(() => {
    if (!guesthouseId || !scopedPartyId) {
      setReservations([]);
      setMaleCount(0);
      setFemaleCount(0);
      return;
    }

    let isMounted = true;

    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const response = await hostMeetApi.getPartyReservationSummary(
          guesthouseId,
          selectedDate,
          scopedPartyId,
        );
        const data = response?.data ?? {};

        if (!isMounted) return;

        const activeList = Array.isArray(data?.reservations)
          ? data.reservations.map(item => normalizeReservation(item, false))
          : [];
        const canceledList = Array.isArray(data?.canceledReservations)
          ? data.canceledReservations.map(item => normalizeReservation(item, true))
          : [];

        setReservations([...activeList, ...canceledList]);
        setMaleCount(Number(data?.maleCount) || 0);
        setFemaleCount(Number(data?.femaleCount) || 0);
      } catch (error) {
        if (!isMounted) return;

        setReservations([]);
        setMaleCount(0);
        setFemaleCount(0);
        Toast.show({
          type: 'error',
          text1:
            error?.response?.data?.message || '지난 신청 내역을 불러오지 못했어요.',
          position: 'top',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReservations();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, scopedPartyId, selectedDate]);

  const summaryCards = useMemo(
    () => [
      { label: '남자', value: `${maleCount}명` },
      { label: '여자', value: `${femaleCount}명` },
      { label: '성비', value: buildRatioText(maleCount, femaleCount) },
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
      <Header title="지난 신청 내역" />

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

          <View style={styles.dateNavigationRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedDate(prev => shiftDate(prev, -1));
                setIsCalendarOpen(false);
              }}>
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
              activeOpacity={isLatestPastDate ? 1 : 0.8}
              disabled={isLatestPastDate}
              style={isLatestPastDate && styles.disabledArrowButton}
              onPress={() => {
                if (isLatestPastDate) {
                  return;
                }
                setSelectedDate(prev => shiftDate(prev, 1));
                setIsCalendarOpen(false);
              }}>
              <ChevronRight
                width={24}
                height={24}
                style={isLatestPastDate && styles.disabledArrowIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {isCalendarOpen ? (
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              {...CALENDAR_COMMON_PROPS}
              markedDates={markedDates}
              maxDate={yesterday}
              onDayPress={day => {
                setSelectedDate(day.dateString);
                setIsCalendarOpen(false);
              }}
              theme={CALENDAR_THEME}
            />
          </View>
        ) : null}

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
          <Text style={[FONTS.fs_16_medium, styles.listTitle]}>신청 명단</Text>
          <Text style={[FONTS.fs_14_medium, styles.listCount]}>
            {filteredReservations.length}
          </Text>
        </View>

        {isLoading || isPartyHistoryLoading ? (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator color={COLORS.primary_orange} />
          </View>
        ) : !scopedPartyId ? (
          <View style={styles.feedbackContainer}>
            <Text style={[FONTS.fs_14_medium, styles.feedbackText]}>
              선택한 날짜에 해당 콘텐츠가 없어요.
            </Text>
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

export default PastReservationList;
