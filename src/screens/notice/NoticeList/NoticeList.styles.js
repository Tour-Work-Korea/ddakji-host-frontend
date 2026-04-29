import {Platform, StyleSheet} from 'react-native';

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
    paddingTop: 4,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // 검색
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
    zIndex: 20,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    zIndex: 20,
  },
  searchFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTypeWrap: {
    position: 'relative',
    marginRight: 20,
    zIndex: 30,
  },
  searchTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
  },
  searchTypeText: {
  },
  optionMenu: {
    position: 'absolute',
    top: 36,
    left: 0,
    width: 84,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 40,
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionText: {
    color: COLORS.grayscale_600,
  },
  optionTextActive: {
    color: COLORS.primary_orange,
  },
  searchInput: {
    flex: 1,
    color: COLORS.grayscale_800,
    paddingVertical: 0,
  },
  searchIconWrap: {
    marginLeft: 8,
  },

  // 공지사항 리스트
  noticeList: {
  },
  noticeCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  noticeCardTop: {
    marginBottom: 8,
  },
  badge: {
    width: 60,
    height: 32,
    borderRadius: 100,
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    ...Platform.select({
      android: {
        lineHeight: 18,
        includeFontPadding: false,
        width: 80,
      },
    }),
    textAlign: 'center',
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
  badgeYellow: {
    backgroundColor: COLORS.secondary_yellow,
  },
  badgeYellowText: {
    color: COLORS.semantic_yellow,
  },
  badgeGreen: {
    backgroundColor: COLORS.secondary_green,
  },
  badgeGreenText: {
    color: COLORS.semantic_green,
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
  noticeTitle: {
    marginBottom: 4,
  },
  dateText: {
    color: COLORS.grayscale_500,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: COLORS.grayscale_500,
  },
  footerLoader: {
    paddingVertical: 20,
  },
});
