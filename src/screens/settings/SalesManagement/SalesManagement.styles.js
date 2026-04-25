import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral_gray, // Slightly off-white background
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    gap: 12, // React Native spacing support
  },
  // Custom Header
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

  // Base Card (imported for exact match)
  card: {
    backgroundColor: COLORS.neutral_white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  // Month Selector
  monthSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  monthSwitcherTouch: {
    padding: 4,
  },
  monthTitleText: {
    ...FONTS.fs_18_bold,
    color: COLORS.grayscale_800,
  },

  // Yearly Mode Graph Styles
  graphCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 24,
    paddingHorizontal: 16,
    height: 250,
  },
  graphScrollContent: {
    alignItems: 'flex-end',
    minWidth: '100%',
    paddingRight: 20,
  },
  graphBarCol: {
    alignItems: 'center',
    width: 44,
    height: 180,
    justifyContent: 'flex-end',
  },
  graphBarBgWrapper: {
    width: 24,
    height: 120, // max bar height inside
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginVertical: 8,
    justifyContent: 'flex-end',
  },
  graphBarFillBox: {
    width: '100%',
    borderRadius: 8,
  },
  graphBarValText: {
    ...FONTS.fs_12_medium,
    color: '#888',
  },
  graphBarMonthText: {
    ...FONTS.fs_14_medium,
    color: '#666',
  },
  monthlyJumpBtn: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  monthlyJumpBtnText: {
    ...FONTS.fs_16_bold,
    color: '#FFF',
    marginRight: 4,
  },

  // Main Card
  mainCard: {
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  mainCardTitle: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
    marginBottom: 8,
  },
  mainCardAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  mainCardAmount: {
    ...FONTS.fs_28_bold,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.grayscale_900,
  },
  mainCardCurrency: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
    marginLeft: 4,
  },

  // Badge
  growthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthBadgePositive: {
    backgroundColor: COLORS.secondary_red,
  },
  growthBadgeNegative: {
    backgroundColor: COLORS.secondary_blue,
  },
  growthText: {
    ...FONTS.fs_12_bold,
  },
  growthTextPositive: {
    color: COLORS.semantic_red,
  },
  growthTextNegative: {
    color: COLORS.semantic_blue,
  },

  // Insight Box
  insightBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary_blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightIconEmoji: {
    fontSize: 16,
  },
  insightText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
    flex: 1,
  },

  // Two Column Grid
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  gridCard: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 16,
  },
  gridCardLabel: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
    marginBottom: 8,
  },
  gridCardValue: {
    ...FONTS.fs_20_bold,
    color: COLORS.grayscale_900,
  },

  // Breakdown Section
  sectionHeader: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
    marginTop: 16,
    marginBottom: 16,
  },
  breakdownCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownRowFirst: {
  },
  breakdownLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotBlue: {
    backgroundColor: COLORS.primary_blue,
  },
  dotRed: {
    backgroundColor: COLORS.semantic_red,
  },
  breakdownLabelText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
  },
  breakdownValueText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginVertical: 12,
  },

  // Custom Bar Chart
  barChartContainer: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: COLORS.grayscale_200, // Background fallback
  },
  barSegmentBlue: {
    height: '100%',
    backgroundColor: COLORS.primary_blue,
  },
  barSegmentRed: {
    height: '100%',
    backgroundColor: COLORS.semantic_red,
  },

  // Room Rankings
  rankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderNoMargin: {
    ...FONTS.fs_18_bold,
    color: COLORS.grayscale_900,
  },
  questionCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#C0C0C0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginTop: 2,
  },
  questionMark: {
    ...FONTS.fs_12_bold,
    color: '#D0D0D0',
    marginTop: -1,
  },
  rankCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  rankRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    height: 54, // fixed height helps with absolute background
  },
  rankRowBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  rankNumberText: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
    width: 28,
    zIndex: 1,
  },
  rankNameText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
    flex: 1,
    marginRight: 10,
    zIndex: 1,
  },
  rankRevenueText: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
    zIndex: 1,
  },
  rankTextHighlight: {
    color: COLORS.primary_blue, // primary brand color (#4351EC)
  },
  rankDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },

  // Customer Analysis
  customerCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  donutContainer: {
    position: 'relative',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  donutSvgWrapper: {
    alignItems: 'center',
    height: 100, // half of 200x200 circle
  },
  donutLeftLabel: {
    position: 'absolute',
    left: 20,
    top: 40,
    alignItems: 'center',
  },
  donutRightLabel: {
    position: 'absolute',
    right: 20,
    top: 40,
    alignItems: 'center',
  },
  donutPercentText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  percentSmall: {
    ...FONTS.fs_16_medium,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  genderLabelText: {
    ...FONTS.fs_14_medium,
    color: '#888',
  },
  ageGraphContainer: {
    width: '100%',
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ageSideBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agePercentText: {
    ...FONTS.fs_14_bold,
    width: 38,
    textAlign: 'center',
  },
  ageBarBg: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    flex: 1,
    overflow: 'hidden',
  },
  ageBarBgLeft: {
    marginLeft: 8,
    flexDirection: 'row-reverse',
  },
  ageBarBgRight: {
    marginRight: 8,
  },
  ageBarFillBlue: {
    height: '100%',
    backgroundColor: '#4A7EFC',
    borderRadius: 4,
  },
  ageBarFillRed: {
    height: '100%',
    backgroundColor: '#ED5C6A',
    borderRadius: 4,
  },
  ageLabelBox: {
    width: 44,
    alignItems: 'center',
  },
  ageLabelText: {
    ...FONTS.fs_14_medium,
    color: '#666',
  },

  // Cancel Stats
  cancelCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 24,
    overflow: 'hidden',
  },
  cancelRateBox: {
    backgroundColor: '#FCFCFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 24,
    marginBottom: 20,
    width: '100%',
  },
  cancelRateNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  cancelChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelChangeLabel: {
    ...FONTS.fs_14_medium,
    color: '#888',
  },
  cancelChangeValue: {
    ...FONTS.fs_14_medium,
  },
  cancelChangeRed: {
    color: '#ED5C6A',
  },
  cancelChangeBlue: {
    color: '#4A7EFC',
  },
  cancelRankRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    height: 54,
    position: 'relative',
  },

  // Reservation Metrics
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCardBox: {
    width: '48%',
    backgroundColor: '#FCFCFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    marginBottom: 12,
  },
  metricCardTitle: {
    ...FONTS.fs_14_medium,
    color: '#888',
    marginBottom: 8,
  },
  metricCardMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricCardMain: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  metricCardSub: {
    ...FONTS.fs_16_medium,
    color: '#333',
    marginLeft: 2,
  },
  metricDiffRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDiffCount: {
    ...FONTS.fs_14_medium,
    color: '#888',
    marginRight: 4,
  },
  metricDiffPercentP: {
    ...FONTS.fs_14_bold,
    color: '#ED5C6A',
  },
  metricDiffPercentM: {
    ...FONTS.fs_14_bold,
    color: '#4A7EFC',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 4,
  },
  pillInactive: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pillTextActive: {
    ...FONTS.fs_12_bold,
    color: '#FFF',
  },
  pillTextInactive: {
    ...FONTS.fs_12_medium,
    color: '#666',
  },
});

export default styles;
