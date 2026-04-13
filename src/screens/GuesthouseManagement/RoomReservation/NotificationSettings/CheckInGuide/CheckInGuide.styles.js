import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  body: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  embeddedBody: {
    paddingTop: 20,
  },
  notiText: {
    color: COLORS.grayscale_500,
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
