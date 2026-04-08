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
    backgroundColor: COLORS.secondary_pink,
  },
  badgeBlueText: {
    color: COLORS.semantic_blue,
  },
  badgePinkText: {
    color: COLORS.semantic_pink,
  },
  badgeVariants: {
    OPERATIONS: {
      backgroundColor: COLORS.secondary_blue,
    },
    MARKETING: {
      backgroundColor: COLORS.secondary_pink,
    },
    POLICY: {
      backgroundColor: COLORS.secondary_yellow,
    },
    EVENT: {
      backgroundColor: COLORS.secondary_green,
    },
  },
  badgeTextVariants: {
    OPERATIONS: {
      color: COLORS.semantic_blue,
    },
    MARKETING: {
      color: COLORS.semantic_pink,
    },
    POLICY: {
      color: COLORS.semantic_yellow,
    },
    EVENT: {
      color: COLORS.semantic_green,
    },
  },
  title: {
    marginBottom: 8,
  },
  date: {
    color: COLORS.grayscale_500,
    marginBottom: 32,
  },
  summary: {
    color: COLORS.grayscale_700,
    lineHeight: 24,
    marginBottom: 16,
  },
  content: {
    color: COLORS.grayscale_700,
    lineHeight: 24,
    marginBottom: 16,
  },
  contentImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.grayscale_100,
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
