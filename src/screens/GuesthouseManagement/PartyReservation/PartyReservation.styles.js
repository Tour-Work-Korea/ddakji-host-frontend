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
  partySelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  partySelectorLabel: {
    color: COLORS.grayscale_500,
  },
  partyManagementCard: {
    minHeight: 78,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary_orange,
    backgroundColor: COLORS.grayscale_0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  partyManagementContent: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  selectedPartyTitle: {
    flexShrink: 1,
    color: COLORS.grayscale_800,
  },
  selectedPartyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  partyManagementHint: {
    color: COLORS.grayscale_500,
  },
  changePartyButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.secondary_orange,
  },
  changePartyText: {
    color: COLORS.primary_orange,
  },
  dateSelectorSection: {
    marginTop: 16,
  },
  dateSelectorLabel: {
    color: COLORS.grayscale_500,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  dateSelectorContent: {
    gap: 8,
    paddingHorizontal: 12,
  },
  dateOption: {
    minWidth: 132,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  dateOptionSelected: {
    borderColor: COLORS.primary_orange,
    backgroundColor: COLORS.secondary_orange,
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
    justifyContent: 'space-between',
    gap: 8,
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
    minHeight: 58,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
