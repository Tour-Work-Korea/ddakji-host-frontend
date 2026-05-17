import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import styles from './ReservationCalendar.styles';
import { FONTS } from '@constants/fonts';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import ReservationDayCard from './ReservationDayCard';

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_FLAG_STATE = {
  today: getTodayLocalDate(),
  flagsByDate: {},
};

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.84;

const ReservationCalendar = ({ guesthouseId }) => {
  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [visibleMonth, setVisibleMonth] = useState(getTodayLocalDate().slice(0, 7));
  const [calendarFlags, setCalendarFlags] = useState(DEFAULT_FLAG_STATE);
  const [isFlagsLoading, setIsFlagsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);

  const openModalWithDate = (dateString) => {
    const baseDate = new Date(dateString);
    const newRange = [];
    for (let i = -15; i <= 15; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      newRange.push(d.toISOString().split('T')[0]);
    }
    setDateRange(newRange);
    setSelectedDate(dateString);
    setInitialIndex(15); // The center element
    setIsModalVisible(true);
  };

  const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      // Find the item with highest view area coverage, or just the first fully visible
      const centerItem = viewableItems.find(v => v.isViewable) || viewableItems[0];
      if (centerItem && centerItem.item) {
        setSelectedDate(centerItem.item);
      }
    }
  }).current;

  useEffect(() => {
    if (!guesthouseId || !visibleMonth) {
      setCalendarFlags(DEFAULT_FLAG_STATE);
      setIsFlagsLoading(false);
      return;
    }

    const fetchCalendarFlags = async () => {
      setIsFlagsLoading(true);
      try {
        const response = await hostGuesthouseApi.getGuesthouseReservationCalendarFlags({
          guesthouseId,
          yearMonth: visibleMonth,
        });
        const payload = response?.data?.data ?? response?.data ?? {};
        const days = Array.isArray(payload?.days) ? payload.days : [];

        setCalendarFlags({
          today: payload?.today ?? getTodayLocalDate(),
          flagsByDate: days.reduce((acc, dayFlag) => {
            if (dayFlag?.date) {
              acc[dayFlag.date] = Boolean(dayFlag.hasReservation);
            }
            return acc;
          }, {}),
        });
      } catch (error) {
        setCalendarFlags(DEFAULT_FLAG_STATE);
      } finally {
        setIsFlagsLoading(false);
      }
    };

    fetchCalendarFlags();
  }, [guesthouseId, visibleMonth]);


  const visibleMonthDate = `${visibleMonth}-01`;

  const renderDay = ({ date, state }) => {
    if (!date) {
      return <View style={styles.dayCellContainer} />;
    }

    const dateString = date.dateString;
    const isSelected = dateString === selectedDate;
    const hasReservation = Boolean(calendarFlags.flagsByDate?.[dateString]);
    const isPastDate = dateString < calendarFlags.today;
    const isDisabled = state === 'disabled';

    return (
      <Pressable
        onPress={() => openModalWithDate(dateString)}
        style={[
          styles.dayCellContainer,
          hasReservation && styles.dayCellContainerFlagged,
          isDisabled && styles.dayCellContainerDisabled,
        ]}>
        <View
          style={[
            styles.dayNumberWrap,
            isSelected && styles.dayNumberWrapSelected,
          ]}>
          <Text
            style={[
              styles.dayNumberText,
              isDisabled && styles.dayNumberTextDisabled,
              isSelected && styles.dayNumberTextSelected,
            ]}>
            {date.day}
          </Text>
        </View>

        {hasReservation ? (
          <View
            style={[
              styles.dayDot,
              isPastDate ? styles.dayDotPast : styles.dayDotFuture,
              isSelected && styles.dayDotSelected,
            ]}
          />
        ) : (
          <View style={styles.dayDotSpacer} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.calendarContainer}>
          <Calendar
            initialDate={visibleMonthDate}
            {...CALENDAR_COMMON_PROPS}
            enableSwipeMonths
            onDayPress={day => setSelectedDate(day.dateString)}
            onMonthChange={month =>
              setVisibleMonth(
                `${month.year}-${String(month.month).padStart(2, '0')}`,
              )
            }
            dayComponent={renderDay}
            theme={{
              ...CALENDAR_THEME,
              textMonthFontFamily: FONTS.fs_18_semibold.fontFamily,
              textMonthFontSize: 18,
              textMonthFontWeight: '600',
              textDayFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />
          {isFlagsLoading ? <View style={styles.flagsLoadingOverlay} /> : null}
        </View>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
              <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={{ height: 420 }}>
              <FlatList
                horizontal
                data={dateRange}
                keyExtractor={item => item}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => ({
                  length: CARD_WIDTH,
                  offset: CARD_WIDTH * index,
                  index,
                })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 50,
                }}
                contentContainerStyle={{
                  paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
                }}
                renderItem={({ item }) => (
                  <ReservationDayCard
                    guesthouseId={guesthouseId}
                    targetDate={item}
                    onNavigate={() => setIsModalVisible(false)}
                  />
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default ReservationCalendar;
