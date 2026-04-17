import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  cardTitle: {
    color: COLORS.grayscale_800,
    marginBottom: 4,
  },
  cardDescription: {
    color: COLORS.grayscale_600,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: COLORS.grayscale_700,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  noticeBadge: {
    width: 60,
    height: 32,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noticeBadgeBlue: {
    backgroundColor: COLORS.secondary_blue,
  },
  noticeBadgeVariants: {
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
  noticeBadgeText: {
  },
  noticeBadgeBlueText: {
    color: COLORS.semantic_blue,
  },
  noticeBadgeTextVariants: {
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
  noticeText: {
    flex: 1,
    color: COLORS.grayscale_800,
    marginRight: 8,
  },
  noticeArrow: {
    color: COLORS.grayscale_400,
    lineHeight: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  summaryLabel: {
    color: COLORS.grayscale_900,
  },
});
