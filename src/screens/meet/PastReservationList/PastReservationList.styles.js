import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  dateSelectContainer: {
    marginBottom: 12,
  },
  dateSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  calendarContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  disabledArrowButton: {
    opacity: 0.35,
  },
  disabledArrowIcon: {
    opacity: 0.35,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    marginBottom: 12,
    paddingVertical: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  summaryItemBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.grayscale_200,
  },
  summaryLabel: {
    color: COLORS.grayscale_400,
  },
  summaryMaleValue: {
    color: COLORS.semantic_blue,
  },
  summaryFemaleValue: {
    color: COLORS.semantic_pink,
  },
  summaryRatio: {
    color: COLORS.grayscale_700,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: COLORS.grayscale_900,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  listTitle: {
    color: COLORS.grayscale_700,
  },
  listCount: {
    color: COLORS.primary_orange,
  },
  listSection: {
    gap: 12,
  },
  feedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  feedbackText: {
    color: COLORS.grayscale_500,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 18,
    backgroundColor: COLORS.grayscale_0,
  },
  reservationInfo: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    color: COLORS.grayscale_700,
  },
  genderBadge: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderMaleBadge: {
    backgroundColor: COLORS.secondary_blue,
  },
  genderFemaleBadge: {
    backgroundColor: COLORS.secondary_pink,
  },
  genderMaleText: {
    color: COLORS.semantic_blue,
  },
  genderFemaleText: {
    color: COLORS.semantic_pink,
  },
  birthText: {
    color: COLORS.grayscale_400,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.grayscale_500,
  },
  metaDivider: {
    width: 2,
    height: 2,
    borderRadius: 999,
    marginHorizontal: 2,
    backgroundColor: COLORS.grayscale_500,
  },
  callButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
