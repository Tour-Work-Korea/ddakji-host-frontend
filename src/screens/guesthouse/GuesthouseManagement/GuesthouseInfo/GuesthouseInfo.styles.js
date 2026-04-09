import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
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
});
