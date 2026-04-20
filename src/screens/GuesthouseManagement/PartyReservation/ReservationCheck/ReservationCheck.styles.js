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
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  headerTitle: {
    color: COLORS.grayscale_900,
  },
  headerDate: {
    color: COLORS.grayscale_600,
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
  sortButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sortButtonText: {
    color: COLORS.grayscale_600,
  },
  listSection: {
    gap: 12,
    marginBottom: 32,
  },
  feedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  feedbackText: {
    color: COLORS.grayscale_500,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
  },
  reservationInfo: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameText: {
    color: COLORS.grayscale_700,
  },
  genderBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 100,
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
  birthdayBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthdayText: {
    color: COLORS.primary_orange,
  },
  birthText: {
    color: COLORS.grayscale_500,
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
    backgroundColor: COLORS.grayscale_500,
    width: 2,
    height: 2,
    borderRadius: 100,
    marginHorizontal: 2,
  },
  callButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.grayscale_0,
  },
  historyButtonText: {
    color: COLORS.grayscale_600,
  },
});
