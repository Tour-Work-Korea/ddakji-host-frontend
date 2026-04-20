import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  body: {
    paddingTop: 6,
    paddingHorizontal: 24,
  },
  section: {
    paddingTop: 20,
    paddingBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainLabel: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_800,
  },
  pushControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pushStatus: {
    ...FONTS.fs_16_medium,
    color: COLORS.primary_orange,
  },
  helperText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_500,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
  },
  listSection: {
    paddingTop: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  itemLabel: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary_orange,
    borderColor: COLORS.primary_orange,
  },
});

export default styles;
