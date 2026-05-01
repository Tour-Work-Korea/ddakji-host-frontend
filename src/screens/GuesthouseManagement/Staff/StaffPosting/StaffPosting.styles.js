import {Platform, StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 120,
  },
  emptyTitle: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_700,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 20,
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: COLORS.grayscale_0,
    marginTop: 24,
  },
  primaryButtonText: {
    color: COLORS.grayscale_700,
  },
  listContent: {
    paddingBottom: 88,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary_blue,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  addButtonLocation: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  addButtonText: {
    color: COLORS.grayscale_0,
    marginRight: 10,
  },
});
