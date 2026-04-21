import {StyleSheet, Platform} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100, // Light gray matching the design
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 20, // Add decent spacing
    paddingBottom: 24, // extra bottom padding for scroll view
  },
  
  pendingCard: {
    backgroundColor: COLORS.neutral_white,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: COLORS.primary_blue,
  },
  pendingTitle: {
    ...FONTS.fs_18_bold,
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  pendingDesc: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
    marginBottom: 16,
  },
  pendingInfoBox: {
    backgroundColor: COLORS.grayscale_100,
    padding: 14,
    borderRadius: 8,
  },
  pendingInfoLabel: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_800,
    marginBottom: 4,
  },
  pendingInfoText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
  },
  sectionTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitleTop: {
    marginTop: 8,
  },

  // Current Account Card
  currentAccountCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 20,
  },
  currentAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankNameText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  activeBadge: {
    backgroundColor: COLORS.secondary_red,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    ...FONTS.fs_12_bold,
    color: COLORS.semantic_red,
  },
  accountNumberText: {
    ...FONTS.fs_20_bold,
    color: COLORS.grayscale_900,
    marginBottom: 16,
  },
  accountHolderLabel: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
    marginBottom: 4,
  },
  accountHolderText: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },

  // Forms
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },
  dropdownInput: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownPlaceholder: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
  },

  // Upload Section
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitleNoMargin: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  requiredBadgeText: {
    ...FONTS.fs_12_medium,
    color: COLORS.semantic_red,
  },
  uploadBox: {
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary_red,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadIconEmoji: {
    fontSize: 20,
  },
  uploadTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  uploadSub: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
    textAlign: 'center',
  },

  // Guide Process Box
  guideBox: {
    backgroundColor: COLORS.secondary_red,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  guideHeaderIcon: {
    marginRight: 6,
  },
  guideTitle: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
  },
  stepCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  stepNumber: {
    ...FONTS.fs_12_bold,
    color: COLORS.semantic_red,
    marginBottom: 2,
  },
  stepTitle: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  stepDesc: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  guideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.secondary_pink,
    paddingTop: 16,
    marginTop: 4,
  },
  guideFooterLeft: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  guideFooterRight: {
    ...FONTS.fs_12_semibold,
    color: COLORS.grayscale_900,
  },

  // Bottom Fixed Button Area
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {paddingBottom: 34, paddingTop: 16},
      android: {paddingBottom: 16, paddingTop: 16},
    }),
    backgroundColor: COLORS.grayscale_100,
  },
  submitButton: {
    backgroundColor: COLORS.primary_orange,
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_0,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  modalTitle: {
    ...FONTS.fs_18_bold,
    color: COLORS.grayscale_900,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_600,
  },
  bankList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bankItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.grayscale_100,
  },
  bankItemText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  dropdownTextSelected: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },
});

export default styles;
