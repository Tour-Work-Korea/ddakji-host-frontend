import { StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    paddingBottom: 100,
    gap: 16,
  },
  fieldLabel: {
    color: COLORS.grayscale_900,
  },
  weekSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    height: 52,
  },
  weekArrowButton: {
    width: 48,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.grayscale_200,
  },
  weekCenterButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekText: {
    color: COLORS.grayscale_900,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  guideBox: {
    backgroundColor: '#F5F8FF',
    borderColor: '#D3E2FF',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary_blue,
  },
  guideText: {
    flex: 1,
    color: COLORS.grayscale_700,
    lineHeight: 22,
  },
  disabledOpacity: {
    opacity: 0.35,
  },

  // Table Layout Styles (Web-like 이식)
  tableWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableScrollView: {
    width: '100%',
  },
  table: {
    minWidth: 950,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  tableHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.grayscale_200,
  },
  tableHeaderCellWeekend: {
    backgroundColor: '#FFFDFD',
  },
  headerText: {
    color: COLORS.grayscale_700,
  },
  headerTextWeekend: {
    color: COLORS.grayscale_900,
    fontFamily: 'Pretendard-Bold',
  },

  sectionHeaderRow: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  sectionHeaderText: {
    color: COLORS.grayscale_900,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.grayscale_200,
  },

  roomInfoCell: {
    width: 140,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  roomNameText: {
    color: COLORS.grayscale_900,
    lineHeight: 18,
  },
  roomPriceText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },

  bulkCell: {
    width: 130,
    paddingVertical: 14,
  },
  bulkControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 6,
    backgroundColor: COLORS.grayscale_0,
  },
  bulkControlBtn: {
    paddingHorizontal: 6,
  },
  bulkControlBtnText: {
    color: COLORS.grayscale_400,
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
  bulkControlBtnTextActive: {
    color: COLORS.grayscale_800,
  },
  bulkCountText: {
    width: 16,
    textAlign: 'center',
    color: COLORS.grayscale_900,
  },
  applyBtn: {
    backgroundColor: COLORS.primary_blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: COLORS.grayscale_0,
  },

  dailyCell: {
    width: 95,
    paddingVertical: 14,
  },
  cellControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
    backgroundColor: COLORS.grayscale_0,
  },
  cellControlBtn: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellCountText: {
    width: 16,
    textAlign: 'center',
    color: COLORS.grayscale_900,
  },

  // Loading indicators
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  bulkHeaderCell: {
    backgroundColor: '#F5F8FF',
  },
  bulkBodyCell: {
    backgroundColor: 'rgba(245, 248, 255, 0.1)',
  },
  switchStyle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginBottom: 6,
  },
});
