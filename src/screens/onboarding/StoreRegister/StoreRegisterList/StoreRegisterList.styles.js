import {StyleSheet, Platform} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flex: 1,
  },

  // 게하 등록 버튼
  actionRow: {
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerPlus: {
    borderWidth: 1,
    borderRadius: 100,
    borderColor: COLORS.primary_orange,
    marginRight: 8,
  },
  registerLinkText: {
  },

  // 입점 리스트
  listContent: {
    flexGrow: 1,
    gap: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: COLORS.grayscale_200,
  },
  businessName: {
    marginLeft: 16,
    flexShrink: 1,
  },
  roleBadge: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: COLORS.primary_blue,
  },
  pendingText: {
    color: COLORS.primary_orange,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
