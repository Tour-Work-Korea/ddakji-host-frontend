import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral_gray, // Slightly off-white background
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    gap: 12, // React Native spacing support
  },

  customHeader: {
    paddingVertical: 16,
  },
  customHeaderInner: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  customHeaderLeft: {
    position: 'absolute',
    left: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customHeaderTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customHeaderTitleText: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_800,
  },

  // Cards
  card: {
    backgroundColor: COLORS.neutral_white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    // shadow effects removed for flattened style match
  },

  // Guesthouse Selector Card
  guesthouseSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  guesthouseSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guesthouseName: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_800,
  },
  monthSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  monthText: {
    ...FONTS.fs_18_bold,
    color: COLORS.grayscale_800,
  },
  iconButton: {
    padding: 4,
  },

  // Account Card
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  accountIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfoBox: {
    flex: 1,
  },
  accountLabel: {
    ...FONTS.fs_12_regular,
    color: COLORS.grayscale_500,
    marginBottom: 4,
  },
  accountNumber: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_800,
  },

  // Main Summary Card
  summarySubtext: {
    ...FONTS.fs_14_semibold,
    color: '#666',
    marginBottom: 8,
  },
  primaryAmountText: {
    ...FONTS.fs_22_bold,
    color: '#3B5AFE',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },
  cumulativeLabel: {
    ...FONTS.fs_14_medium,
    color: '#666',
    marginBottom: 8,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  settlementAccumulatedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  cumulativeAmount: {
    ...FONTS.fs_22_bold,
    color: COLORS.grayscale_900,
  },
  comparisonText: {
    ...FONTS.fs_12_semibold,
    color: '#FF3B3B',
  },

  // Two columns row (Sales, Fees)
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  halfCardLabel: {
    ...FONTS.fs_12_semibold,
    color: '#666',
    marginBottom: 12,
  },
  halfCardAmount: {
    ...FONTS.fs_18_bold,
    color: COLORS.grayscale_900,
  },

  // Detailed List Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    ...FONTS.fs_18_bold,
    color: COLORS.grayscale_800,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  downloadText: {
    ...FONTS.fs_13_medium,
    color: COLORS.primary_blue,
  },

  // Detail Item Row
  detailItemCard: {
    padding: 20,
  },
  detailItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItemDateTop: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
  },
  detailItemDateTopValue: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_900,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    ...FONTS.fs_14_semibold,
    fontSize: 12,
  },
  badgePending: {
    backgroundColor: COLORS.secondary_red,
  },
  badgePendingText: {
    color: COLORS.semantic_red,
  },
  badgeComplete: {
    backgroundColor: COLORS.secondary_blue,
  },
  badgeCompleteText: {
    color: COLORS.primary_blue,
  },
  badgeHold: {
    backgroundColor: COLORS.grayscale_100,
  },
  badgeHoldText: {
    color: COLORS.grayscale_500,
  },
  detailItemBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  detailColLeft: {
    justifyContent: 'center',
    gap: 4,
  },
  detailColRight: {
    justifyContent: 'center',
  },
  detailMetaTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailMetaLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
    width: 72,
  },
  detailMetaValue: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
  },
  detailItemAmount: {
    ...FONTS.fs_22_bold,
    color: COLORS.grayscale_900,
  },
});
