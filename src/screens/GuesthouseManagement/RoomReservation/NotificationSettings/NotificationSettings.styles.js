import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  body: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  notiText: {
    color: COLORS.semantic_red,
    marginTop: 4,
    marginBottom: 16,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  roomList: {
    gap: 16,
  },
  emptyText: {
    color: COLORS.grayscale_500,
    textAlign: 'center',
    paddingVertical: 8,
  },
  roomNameText: {
    color: COLORS.grayscale_1000,
  },
});
