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
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primary_orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: COLORS.grayscale_0,
  },
  heroSection: {
    minHeight: 386,
    overflow: 'hidden',
    paddingLeft: 20,
    paddingTop: 112,
    paddingBottom: 42,
    marginBottom: 16,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroTextWrap: {
    width: '52%',
    zIndex: 2,
  },
  heroTitle: {
    color: COLORS.grayscale_800,
    lineHeight: 32,
    marginBottom: 12,
  },
  heroDescription: {
    color: COLORS.grayscale_700,
    lineHeight: 28,
    marginBottom: 48,
  },

  // 등록 버튼
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerLinkTextWrap: {
    position: 'relative',
    justifyContent: 'center',
    marginRight: 2,
  },
  registerLinkBgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.secondary_red,
    height: 6,
  },
  registerLinkText: {
    color: COLORS.grayscale_800,
  },
  heroCaption: {
    color: COLORS.grayscale_500,
  },
  // 로그인, 게하 있을 때
  dashboardSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  salesSummaryCard: {
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  salesSummaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salesSummaryTitle: {
    color: COLORS.grayscale_600,
    marginRight: 8,
  },
  salesSummaryBadge: {
    backgroundColor: COLORS.secondary_red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  salesSummaryBadgeText: {
    color: COLORS.semantic_red,
  },
  salesSummaryNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  salesSummaryNum: {
    color: COLORS.grayscale_900,
  },
  salesSummaryUnit: {
    color: COLORS.grayscale_900,
    marginLeft: 4,
  },
  instaEventCard: {
    borderRadius: 10,
    backgroundColor: '#E8EFFA',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  instaEventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instaEventTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  instaEventTitle: {
    color: COLORS.grayscale_700,
    lineHeight: 24,
    marginBottom: 8,
  },
  instaEventDescription: {
    color: COLORS.grayscale_700,
    lineHeight: 20,
    marginBottom: 20,
  },
  instaEventAccent: {
    color: COLORS.primary_orange,
  },
  instaEventLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instaEventLink: {
    color: COLORS.grayscale_500,
    marginRight: 2,
  },
  instaEventImageWrap: {
    alignItems: 'flex-end',
  },
  instaEventImage: {
    width: 102,
    height: 138,
  },
  // 게하 리스트
  myBusinessSection: {
    marginTop: 28,
    marginBottom: 12,
  },
  myBusinessList: {
    gap: 10,
  },
  myBusinessCount: {
    color: COLORS.primary_blue,
  },
  myBusinessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_0,
    padding: 12,
  },
  myBusinessCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myBusinessName: {
    flex: 1,
    marginLeft: 12,
  },
  myBusinessBadge: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  myBusinessBadgeText: {
    color: COLORS.primary_blue,
  },

  // 공지사항
  noticeSection: {
    paddingHorizontal: 16,
    marginBottom: 120,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.grayscale_800,
    marginRight: 2,
  },
  noticeList: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_0,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  noticeBadge: {
    width: 60,
    height: 32,
    borderRadius: 100,
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noticeBadgeText: {
    ...Platform.select({
      android: {
        lineHeight: 18,
        includeFontPadding: false,
        width: 80,
      },
    }),
    textAlign: 'center',
  },
  noticeBadgeBlue: {
    backgroundColor: COLORS.secondary_blue,
  },
  noticeBadgeBlueText: {
    color: COLORS.semantic_blue,
  },
  noticeBadgePink: {
    backgroundColor: COLORS.secondary_pink,
  },
  noticeBadgePinkText: {
    color: COLORS.semantic_pink,
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
  },

  // 사업자 정보
  businessSection: {
    paddingHorizontal: 16,
  },
  businessTitle: {
    color: COLORS.grayscale_800,
    marginBottom: 12,
  },
  businessList: {
    gap: 8,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  businessLabel: {
    width: 92,
    color: COLORS.grayscale_500,
    lineHeight: 20,
  },
  businessValue: {
    flex: 1,
    color: COLORS.grayscale_600,
    lineHeight: 20,
  },
});
