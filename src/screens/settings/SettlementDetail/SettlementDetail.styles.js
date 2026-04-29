import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Common Card Style
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },

  // Header Big Amount Card
  headerCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerDateText: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  badgeComplete: {
    backgroundColor: COLORS.secondary_blue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeCompleteText: {
    ...FONTS.fs_14_semibold,
    fontSize: 12,
    color: COLORS.semantic_blue,
  },
  headerAmount: {
    ...FONTS.fs_22_bold,
    color: COLORS.grayscale_900,
  },

  // Summary Card
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
  },
  rowValue: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
  },
  rowValueRed: {
    ...FONTS.fs_14_semibold,
    color: COLORS.semantic_red,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginVertical: 16,
  },
  finalLabel: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  finalAmountRed: {
    ...FONTS.fs_18_bold,
    color: COLORS.semantic_red,
  },

  // List Section
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  listCountText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.semantic_blue,
  },

  // Detail Item Cards
  itemCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
  },
  badgeNormal: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeNormalText: {
    ...FONTS.fs_12_bold,
    color: COLORS.grayscale_600,
  },
  badgeCancel: {
    backgroundColor: COLORS.secondary_red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeCancelText: {
    ...FONTS.fs_12_bold,
    color: COLORS.semantic_red,
  },
  itemResNumber: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    marginBottom: 16,
  },
  
  // Inner gray box for calculations
  innerCalcBox: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calcSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
  },
  calcSubLabel: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    marginLeft: 8,
  },
  calcValue: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
  },
  calcSubValue: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  calcValueRed: {
    ...FONTS.fs_14_semibold,
    color: COLORS.semantic_red,
  },
  calcValueCancel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
    textDecorationLine: 'line-through',
  },
  cancelRuleTextRed: {
    ...FONTS.fs_14_semibold,
    color: COLORS.semantic_red,
  },
  
  blueInfoBox: {
    backgroundColor: COLORS.secondary_blue,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    flexDirection: 'row',
  },
  blueInfoTextWrap: {
    marginLeft: 6,
    flex: 1,
  },
  blueInfoTextPrimary: {
    ...FONTS.fs_12_semibold,
    color: COLORS.semantic_blue,
    marginBottom: 2,
  },
  blueInfoTextSecondary: {
    ...FONTS.fs_12_medium,
    color: COLORS.semantic_blue,
  },

  finalCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
    paddingTop: 12,
  },
  finalCalcLabel: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
  },
  finalCalcValue: {
    ...FONTS.fs_16_bold,
    color: COLORS.grayscale_900,
  },
  
  // Diff Dropdown Mock styling
  dropdownMockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dropdownMockText: {
    ...FONTS.fs_14_semibold,
    fontSize: 13,
    color: COLORS.semantic_red,
    marginRight: 4,
  },

  diffLevelBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  diffLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  diffLevelTitle: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
  },
  diffLevelDesc: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
    marginTop: 2,
  },
  diffLevelValueNormal: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },
  diffLevelValueBold: {
    ...FONTS.fs_14_bold,
    color: COLORS.grayscale_900,
  },

  footerMetaText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
});

export default styles;
