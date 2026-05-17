import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  chipScrollView: {
    flexGrow: 0,
    backgroundColor: COLORS.grayscale_0,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: COLORS.grayscale_0,
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
  emptyState: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  emptyTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  emptyDescription: {
    color: COLORS.grayscale_600,
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyCardText: {
    color: COLORS.grayscale_700,
    lineHeight: 22,
  },
  moreChip: {
    paddingHorizontal: 12,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  moreMenuDropdown: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingVertical: 8,
    minWidth: 120,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  moreMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  moreMenuTextActive: {
    color: COLORS.primary_blue,
  },
});
