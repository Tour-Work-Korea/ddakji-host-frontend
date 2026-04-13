import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    color: COLORS.grayscale_700,
    marginBottom: 12,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 18,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cancelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cancelTitle: {
    color: COLORS.grayscale_700,
  },
  cancelDescription: {
    color: COLORS.grayscale_500,
    lineHeight: 22,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    marginTop: 20,
    backgroundColor: COLORS.primary_orange,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  cancelButtonText: {
    color: COLORS.grayscale_0,
  },
  exposureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  exposureInfo: {
    flex: 1,
  },
  exposureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  partyTitle: {
    color: COLORS.grayscale_700,
  },
  exposureBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    backgroundColor: '#FFF4EF',
  },
  exposureBadgeText: {
    color: COLORS.primary_orange,
  },
  exposureDescription: {
    color: COLORS.grayscale_500,
  },
  capacityLabel: {
    color: COLORS.grayscale_700,
    marginBottom: 16,
  },
  capacityValue: {
    color: COLORS.primary_orange,
  },
  capacityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  capacityButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capacityInputBox: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F2F6FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capacityInputText: {
    color: COLORS.grayscale_700,
  },
});
