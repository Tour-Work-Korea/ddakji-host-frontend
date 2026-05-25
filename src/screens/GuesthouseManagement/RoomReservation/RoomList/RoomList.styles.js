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
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 14,
  },

  // 전체 예약 오픈 관리
  bulkCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    padding: 20,
  },
  bulkTitle: {
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  bulkDescription: {
    color: COLORS.grayscale_500,
    marginBottom: 8,
  },
  bulkButton: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    backgroundColor: COLORS.grayscale_200,
    borderRadius: 12,
  },
  bulkButtonLabel: {
    color: COLORS.grayscale_700,
  },
  bulkStatus: {
    color: COLORS.primary_blue,
    marginTop: 6,
  },
  bulkStatusWrap: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },

  // 객실
  roomCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
  },
  roomImage: {
    width: 120,
    height: 120,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
    marginRight: 16,
  },
  roomContent: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  emptyText: {
    color: COLORS.grayscale_500,
    textAlign: 'center',
    paddingVertical: 32,
  },
  roomName: {
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  roomSubtitle: {
    color: COLORS.grayscale_500,
  },
  roomBottomRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exposureBadge: {
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exposureBadgeOn: {
    borderColor: COLORS.primary_blue,
  },
  exposureBadgeOff: {
    borderColor: COLORS.grayscale_500,
  },
  exposureTextOn: {
    color: COLORS.primary_blue,
  },
  exposureTextOff: {
    color: COLORS.grayscale_500,
  },
  roomActionColumn: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 버튼
  footer: {
    position: 'absolute',
    right: 16,
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secondaryButtonText: {
    color: COLORS.grayscale_800,
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
  },
  primaryButtonText: {
    color: COLORS.grayscale_0,
  },

  // 객실 순서 정렬용 스타일
  reorderBanner: {
    backgroundColor: '#F0F4FF',
    borderColor: '#D4E2FF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reorderBannerText: {
    flex: 1,
    color: COLORS.primary_blue,
    lineHeight: 18,
  },
  reorderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: COLORS.primary_blue,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  reorderBadgeText: {
    color: COLORS.grayscale_0,
  },
  reorderControlRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginLeft: 12,
  },
  reorderButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.35,
  },
  reorderButtonText: {
    color: COLORS.grayscale_700,
  },
  reorderCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  reorderCancelButtonText: {
    color: COLORS.grayscale_700,
  },
  reorderSaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: COLORS.primary_blue,
  },
  reorderSaveButtonText: {
    color: COLORS.grayscale_0,
  },
  reorderStartButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  reorderStartButtonText: {
    color: COLORS.grayscale_700,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.grayscale_0,
  },
  headerTitle: {
    color: COLORS.grayscale_800,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
