import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Calendar Header
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  calendarTitle: {
    color: COLORS.grayscale_900,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotOpen: {
    backgroundColor: COLORS.secondary_blue,
    borderWidth: 1,
    borderColor: COLORS.primary_blue,
  },
  legendDotClose: {
    backgroundColor: COLORS.secondary_red,
    borderWidth: 1,
    borderColor: COLORS.semantic_red,
  },
  legendText: {
    color: COLORS.grayscale_600,
  },

  // Calendar Grid
  calendarContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    padding: 16,
    backgroundColor: COLORS.grayscale_0,
    marginBottom: 24,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthSelectorCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  monthTitle: {
    color: COLORS.grayscale_900,
  },
  selectAllButton: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectAllButtonText: {
    color: COLORS.grayscale_700,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingBottom: 8,
  },
  weekDayText: {
    color: COLORS.grayscale_500,
  },
  weekDayTextSun: {
    color: COLORS.semantic_red,
  },
  weekDayTextSat: {
    color: COLORS.primary_blue,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellWrapper: {
    width: '14.28%',
    aspectRatio: 0.7,
    padding: 2,
  },
  dayCellBlank: {
    width: '14.28%',
    aspectRatio: 0.7,
    padding: 2,
  },
  dayCell: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCellSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary_blue,
    zIndex: 10,
    shadowColor: COLORS.primary_blue,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellDisabled: {
    opacity: 0.5,
    borderColor: 'transparent',
  },
  dayCellOpen: {
    backgroundColor: COLORS.secondary_blue,
    borderColor: 'transparent',
  },
  dayCellClosed: {
    backgroundColor: COLORS.secondary_red,
    borderColor: 'transparent',
  },
  dayCellTooFar: {
    backgroundColor: COLORS.grayscale_100,
    borderColor: 'transparent',
  },
  dayNumberText: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  dayNumberTextSelected: {
    color: COLORS.primary_blue,
  },
  dayNumberTextDisabled: {
    color: COLORS.grayscale_400,
  },
  dayStatusBadge: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
  },
  dayStatusBadgeOpen: {
    backgroundColor: '#D1E0FF',
  },
  dayStatusBadgeClosed: {
    backgroundColor: '#FFD1D1',
  },
  dayStatusBadgeTooFar: {
    backgroundColor: COLORS.grayscale_200,
  },
  dayStatusText: {
    fontSize: 9,
    textAlign: 'center',
  },
  dayStatusTextOpen: {
    color: COLORS.primary_blue,
  },
  dayStatusTextClosed: {
    color: COLORS.semantic_red,
  },
  dayStatusTextTooFar: {
    color: COLORS.grayscale_500,
  },

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.grayscale_0,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32, // Safe area for bottom
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  actionBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionSelectedText: {
    color: COLORS.primary_blue,
  },
  deselectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  deselectButtonText: {
    color: COLORS.grayscale_600,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonOpen: {
    backgroundColor: COLORS.secondary_blue,
    borderColor: '#B3C8FF',
  },
  actionButtonClose: {
    backgroundColor: COLORS.secondary_red,
    borderColor: '#FFB3B3',
  },
  actionButtonTextOpen: {
    color: COLORS.primary_blue,
  },
  actionButtonTextClose: {
    color: COLORS.semantic_red,
  },

  // Empty State
  emptyStateContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    marginTop: 20,
  },
  emptyStateTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  emptyStateDesc: {
    color: COLORS.grayscale_500,
  },
});
