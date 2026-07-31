import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.grayscale_100,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary_blue,
  },
  chipText: {
    color: COLORS.grayscale_700,
  },
  chipTextActive: {
    color: COLORS.grayscale_0,
  },
  partySelector: {
    marginHorizontal: 12,
    marginTop: 16,
  },
  sectionLabel: {
    marginBottom: 7,
    color: COLORS.grayscale_500,
  },
  partyManagementCard: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 14,
    backgroundColor: COLORS.grayscale_0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  partyManagementContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedPartyTitle: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    color: COLORS.grayscale_800,
  },
  applicationTypeBadge: {
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.secondary_orange,
  },
  applicationTypeBadgeText: {
    color: COLORS.primary_orange,
  },
  changePartyButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 4,
    paddingVertical: 5,
  },
  changePartyText: {
    color: COLORS.primary_orange,
  },
  dateSelectorSection: {
    marginTop: 16,
  },
  dateSelectorLabel: {
    marginHorizontal: 12,
    marginBottom: 8,
    color: COLORS.grayscale_500,
  },
  dateSelectorScroll: {
    flexGrow: 0,
  },
  dateSelectorContent: {
    gap: 8,
    paddingHorizontal: 12,
  },
  dateOption: {
    minWidth: 112,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_0,
  },
  dateOptionSelected: {
    borderColor: COLORS.primary_orange,
    backgroundColor: COLORS.grayscale_0,
  },
  dateOptionDate: {
    color: COLORS.grayscale_700,
  },
  dateOptionCount: {
    color: COLORS.grayscale_500,
  },
  dateOptionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateOptionStatus: {
    color: COLORS.grayscale_500,
  },
  dateOptionTextSelected: {
    color: COLORS.primary_orange,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.modal_background,
  },
  partySelectorModal: {
    maxHeight: '72%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: COLORS.grayscale_0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.grayscale_300,
    marginBottom: 22,
  },
  modalHeader: {
    marginBottom: 18,
    gap: 6,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  modalDescription: {
    color: COLORS.grayscale_500,
  },
  partyOptionScroll: {
    flexGrow: 0,
  },
  partyOption: {
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  partyOptionSelected: {
    borderColor: COLORS.primary_orange,
    backgroundColor: COLORS.secondary_orange,
  },
  partyOptionText: {
    flex: 1,
    color: COLORS.grayscale_700,
  },
  partyOptionTextSelected: {
    color: COLORS.primary_orange,
  },
  partyOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  partyApplyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  partyApplyStatusBadgeOpen: {
    backgroundColor: COLORS.secondary_orange,
  },
  partyApplyStatusBadgeClosed: {
    backgroundColor: COLORS.grayscale_100,
  },
  partyApplyStatusTextOpen: {
    color: COLORS.primary_orange,
  },
  partyApplyStatusTextClosed: {
    color: COLORS.grayscale_500,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
