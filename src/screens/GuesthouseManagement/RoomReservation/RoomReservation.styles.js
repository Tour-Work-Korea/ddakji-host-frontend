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
    backgroundColor: COLORS.primary_orange,
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
});
