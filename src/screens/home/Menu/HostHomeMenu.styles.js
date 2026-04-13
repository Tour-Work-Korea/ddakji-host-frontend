import { StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 프로필
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileTextWrap: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: COLORS.grayscale_800,
    marginBottom: 4,
  },
  profileEmail: {
    color: COLORS.grayscale_500,
  },

  // 등록, 이용방법
  topActionRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 12,
  },
  topActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  topActionText: {
    color: COLORS.grayscale_600,
  },
  topActionDivide: {
    height: '50%',
    backgroundColor: COLORS.grayscale_200,
    width: 1,
  },

  // 메뉴
  menuList: {
    paddingHorizontal: 4,
  },
  myBusinessCount: {
    color: COLORS.primary_orange,
    marginHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 68,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    color: COLORS.grayscale_800,
  },
  menuLabelMuted: {
    color: COLORS.grayscale_700,
  },

  // 로그아웃, 탈퇴
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerActionText: {
    color: COLORS.grayscale_400,
    textDecorationLine: 'underline',
  },
  footerActionTextPlain: {
    textDecorationLine: 'none',
  },
  footerDivider: {
    color: COLORS.grayscale_400,
    marginHorizontal: 8,
    height: '70%',
  },
});
