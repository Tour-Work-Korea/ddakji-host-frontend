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
    paddingTop: 4,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },

  // 검색
  searchRow: {
    marginBottom: 12,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  searchFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTypeWrap: {
    position: 'relative',
    marginRight: 20,
    zIndex: 10,
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
    width: 72,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    paddingVertical: 4,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
});
