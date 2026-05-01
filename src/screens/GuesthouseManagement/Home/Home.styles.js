import { Platform, StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  cardTitle: {
    color: COLORS.grayscale_800,
    marginBottom: 4,
  },
  cardDescription: {
    color: COLORS.grayscale_600,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: COLORS.grayscale_700,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  noticeBadge: {
    width: 60,
    height: 32,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noticeBadgeBlue: {
    backgroundColor: COLORS.secondary_blue,
  },
  noticeBadgeVariants: {
    OPERATIONS: {
      backgroundColor: COLORS.secondary_blue,
    },
    MARKETING: {
      backgroundColor: COLORS.secondary_pink,
    },
    POLICY: {
      backgroundColor: COLORS.secondary_yellow,
    },
    EVENT: {
      backgroundColor: COLORS.secondary_green,
    },
  },
  noticeBadgeText: {
    ...Platform.select({
      android: {
        lineHeight: 18,
        includeFontPadding: false,
        width: 80,
      },
    }),
    textAlign: 'center',
  },
  noticeBadgeBlueText: {
    color: COLORS.semantic_blue,
  },
  noticeBadgeTextVariants: {
    OPERATIONS: {
      color: COLORS.semantic_blue,
    },
    MARKETING: {
      color: COLORS.semantic_pink,
    },
    POLICY: {
      color: COLORS.semantic_yellow,
    },
    EVENT: {
      color: COLORS.semantic_green,
    },
  },
  noticeText: {
    flex: 1,
    color: COLORS.grayscale_800,
    marginRight: 8,
  },
  noticeArrow: {
    color: COLORS.grayscale_400,
    lineHeight: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  summaryValueInactive: {
    color: COLORS.grayscale_500,
  },
  summaryLabel: {
    color: COLORS.grayscale_900,
  },
  summaryLabelInactive: {
    color: COLORS.grayscale_500,
  },
  reservationListContainer: {
    marginTop: 24,
  },
  reservationCard: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reservationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationName: {
    color: COLORS.grayscale_900,
    marginRight: 12,
  },
  reservationBadge: {
    backgroundColor: COLORS.secondary_blue,
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reservationBadgeRed: {
    backgroundColor: COLORS.secondary_red,
  },
  reservationBadgeText: {
    fontFamily: FONTS.fs_14_semibold.fontFamily,
    fontSize: 11,
    color: COLORS.semantic_blue,
  },
  reservationBadgeTextRed: {
    color: COLORS.semantic_red,
  },
  reservationBadgePink: {
    backgroundColor: COLORS.secondary_pink,
  },
  reservationBadgeTextPink: {
    color: COLORS.semantic_pink,
  },
  reservationBadgeWaiting: {
    backgroundColor: COLORS.secondary_yellow,
    borderWidth: 1,
    borderColor: COLORS.semantic_yellow,
  },
  reservationBadgeTextWaiting: {
    color: COLORS.semantic_yellow,
  },
  birthYearText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
    marginLeft: 8,
  },
  phoneButtonWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 16,
    justifyContent: 'center',
  },
  phoneButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationInfoText: {
    color: COLORS.grayscale_700,
    marginBottom: 4,
  },
  reservationButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  reservationButtonText: {
    color: COLORS.grayscale_800,
  },
  reservationButtonPrimary: {
    backgroundColor: COLORS.primary_blue,
    borderColor: COLORS.primary_blue,
  },
  reservationButtonTextPrimary: {
    color: COLORS.grayscale_0,
  },
  waitingAlertRow: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitingAlertIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.semantic_red,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  waitingAlertIconText: {
    ...FONTS.fs_10_bold,
    color: COLORS.semantic_red,
    fontSize: 9,
    lineHeight: 11,
  },
  waitingAlertText: {
    ...FONTS.fs_12_medium,
    color: COLORS.semantic_red,
  },
  settlementSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settlementCardMain: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    backgroundColor: COLORS.grayscale_0,
  },
  settlementLabel: {
    color: '#666',
    marginBottom: 8,
  },
  settlementValueBlue: {
    color: '#3B5AFE',
    marginBottom: 8,
  },
  settlementAccumulatedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  settlementValueBlack: {
    color: COLORS.grayscale_900,
  },
  settlementDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },
  settlementRateRed: {
    color: '#FF3B3B',
  },
  settlementSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settlementSubCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    padding: 20,
    backgroundColor: COLORS.grayscale_0,
  },
  settlementSubCardSpacing: {
    marginRight: 12,
  },
  settlementSubLabel: {
    color: '#666',
    marginBottom: 12,
  },
  settlementSubValue: {
    color: COLORS.grayscale_900,
  },
  salesCardMain: {
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  salesCardTitle: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
    marginBottom: 8,
  },
  salesCardAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  salesCardAmount: {
    ...FONTS.fs_28_bold,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.grayscale_900,
  },
  salesCardCurrency: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
    marginLeft: 4,
  },
  salesGrowthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary_red,
  },
  salesGrowthText: {
    ...FONTS.fs_12_bold,
    color: COLORS.semantic_red,
  },
});
