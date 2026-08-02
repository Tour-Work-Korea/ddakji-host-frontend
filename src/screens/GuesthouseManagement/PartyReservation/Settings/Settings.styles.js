import { StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: COLORS.grayscale_500,
    marginBottom: 8,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_0,
    padding: 20,
  },
  cancelContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cancelTitleRow: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    marginLeft: 12,
  },
  cancelTitle: {
    color: COLORS.grayscale_700,
  },
  cancelDescription: {
    flexShrink: 1,
    color: COLORS.grayscale_500,
    lineHeight: 16,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    backgroundColor: COLORS.primary_orange,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: COLORS.grayscale_0,
  },
  cancelButtonDisabled: {
    backgroundColor: COLORS.grayscale_200,
  },
  cancelButtonTextDisabled: {
    color: COLORS.grayscale_500,
  },

  applicationStatusRow: {
    gap: 4,
  },
  applicationStatusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  partyTitle: {
    color: COLORS.grayscale_700,
    flex: 1,
    minWidth: 0,
  },
  applicationStatusRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
    marginLeft: 8,
  },
  applicationStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  applicationStatusBadgeOpen: {
    borderColor: COLORS.primary_blue,
  },
  applicationStatusBadgeClosed: {
    borderColor: COLORS.grayscale_300,
  },
  applicationStatusBadgeTextOpen: {
    color: COLORS.primary_blue,
  },
  applicationStatusBadgeTextClosed: {
    color: COLORS.grayscale_400,
  },
  applicationStatusDescription: {
    color: COLORS.grayscale_500,
  },

  capacityLabel: {
    color: COLORS.grayscale_700,
    marginBottom: 12,
  },
  capacityValue: {
    color: COLORS.primary_blue,
  },
  capacityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  capacityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capacityButtonDisabled: {
    opacity: 0.35,
  },
  capacityInputBox: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capacityInputText: {
    color: COLORS.grayscale_700,
  },
  applyButton: {
    alignSelf: 'flex-end',
    marginTop: 14,
    backgroundColor: COLORS.primary_blue,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  applyButtonText: {
    color: COLORS.grayscale_0,
  },
  cancelModalContent: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    gap: 6,
  },
  cancelModalApplicant: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  cancelModalApplicantCount: {
    color: COLORS.semantic_red,
  },
  cancelModalDescription: {
    color: COLORS.grayscale_700,
    textAlign: 'center',
    lineHeight: 20,
  },
});
