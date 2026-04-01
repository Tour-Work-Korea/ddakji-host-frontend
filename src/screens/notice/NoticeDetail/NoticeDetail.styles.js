import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  badge: {
    width: 60,
    height: 32,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 16,
  },
  badgeBlue: {
    backgroundColor: COLORS.secondary_blue,
  },
  badgePink: {
    backgroundColor: COLORS.secondary_red,
  },
  badgeBlueText: {
    color: COLORS.semantic_blue,
  },
  badgePinkText: {
    color: COLORS.semantic_red,
  },
  title: {
    marginBottom: 8,
  },
  date: {
    color: COLORS.grayscale_500,
    marginBottom: 32,
  },
  content: {
    color: COLORS.grayscale_700,
    lineHeight: 24,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: COLORS.grayscale_500,
  },
});
