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
    color: COLORS.grayscale_500,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    marginBottom: 12,
    paddingVertical: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  summaryItemBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.grayscale_200,
  },
  summaryLabel: {
    color: COLORS.grayscale_400,
  },
  summaryValue: {
    color: COLORS.primary_orange,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 18,
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
    marginBottom: 6,
  },
  listTitle: {
    color: COLORS.grayscale_900,
  },
  listCount: {
    color: COLORS.primary_orange,
  },
  sortButton: {
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  sortButtonText: {
    color: COLORS.grayscale_500,
  },
  listSection: {
    gap: 12,
    marginBottom: 16,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
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
    color: COLORS.grayscale_900,
  },
  birthdayBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthdayText: {
    color: COLORS.primary_orange,
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
    color: COLORS.grayscale_300,
    marginHorizontal: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.grayscale_0,
  },
  historyButtonText: {
    color: COLORS.grayscale_600,
  },
});
