import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  calendarHeader: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  backButton: {
    width: 36,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
  },
  calendarTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  guesthouseTitle: {
    flexShrink: 1,
    color: COLORS.grayscale_900,
  },
  monthTitle: {
    flexShrink: 0,
    color: COLORS.grayscale_900,
  },
  monthActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  monthMoveButton: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBar: {
    height: 38,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  viewToggle: {
    width: 124,
    height: 30,
    padding: 2,
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
  },
  viewToggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  viewToggleButtonSelected: {
    backgroundColor: COLORS.grayscale_0,
  },
  viewToggleText: {
    color: COLORS.grayscale_500,
  },
  viewToggleTextSelected: {
    color: COLORS.grayscale_800,
  },
  weekdayRow: {
    height: 36,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    color: COLORS.grayscale_500,
  },
  sundayText: {
    color: COLORS.semantic_red,
  },
  calendarGrid: {
    flex: 1,
    position: 'relative',
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    minWidth: 0,
    paddingTop: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.grayscale_200,
    alignItems: 'center',
    overflow: 'hidden',
  },
  lastDayCell: {
    borderRightWidth: 0,
  },
  lastWeekCell: {
    borderBottomWidth: 0,
  },
  dayNumberWrap: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 4,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrapSelected: {
    backgroundColor: COLORS.primary_orange,
  },
  dayNumber: {
    color: COLORS.grayscale_800,
  },
  otherMonthText: {
    color: COLORS.grayscale_300,
  },
  selectedDayText: {
    color: COLORS.grayscale_0,
  },
  reservationBadge: {
    width: '92%',
    minHeight: 20,
    marginTop: 3,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 5,
    justifyContent: 'center',
  },
  externalReservationBadge: {
    marginTop: 3,
  },
  reservationBadgeText: {
    fontSize: 10,
    textAlign: 'center',
    includeFontPadding: false,
  },
  roomSummaryList: {
    width: '92%',
    marginTop: 3,
    alignItems: 'center',
  },
  roomSummaryText: {
    width: '100%',
    color: COLORS.grayscale_600,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    includeFontPadding: false,
  },
  roomSummarySoldOutText: {
    color: COLORS.semantic_red,
  },
  hiddenRoomCountText: {
    width: '100%',
    color: COLORS.grayscale_400,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    includeFontPadding: false,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.modal_background,
  },
});
