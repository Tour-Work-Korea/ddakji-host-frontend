import {StyleSheet, Dimensions} from 'react-native';

import {COLORS} from '@constants/colors';

const {width: screenWidth} = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  body: {
    position: 'relative',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  guesthouseBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
  },
  guesthouseSelectContainer: {
    position: 'relative',
    zIndex: 13,
  },
  guesthouseSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    gap: 8,
  },
  guesthouseSelectText: {
    flex: 1,
    color: COLORS.grayscale_900,
  },
  guesthouseDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },
  guesthouseOption: {
    paddingVertical: 8,
  },
  guesthouseOptionText: {
    color: COLORS.grayscale_900,
  },
  selectedGuesthouseText: {
    color: COLORS.primary_orange,
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 8,
    paddingBottom: 4,
  },
  flagsLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dayCellContainer: {
    width: 44,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    paddingTop: 4,
  },
  dayCellContainerFlagged: {
    backgroundColor: COLORS.secondary_yellow,
  },
  dayCellContainerDisabled: {
    opacity: 0.35,
  },
  dayNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrapSelected: {
    backgroundColor: COLORS.primary_orange,
  },
  dayNumberText: {
    color: COLORS.grayscale_900,
    fontSize: 16,
    fontWeight: '500',
  },
  dayNumberTextDisabled: {
    color: COLORS.grayscale_400,
  },
  dayNumberTextSelected: {
    color: COLORS.grayscale_0,
    fontWeight: '600',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    marginTop: 2,
  },
  dayDotFuture: {
    backgroundColor: COLORS.semantic_red,
  },
  dayDotPast: {
    backgroundColor: COLORS.grayscale_400,
  },
  dayDotSelected: {
    marginTop: 2,
  },
  dayDotSpacer: {
    width: 5,
    height: 5,
    marginTop: 2,
  },
  listContainer: {
    marginTop: 8,
    flex: 1,
  },
  listDateTitle: {
    color: COLORS.grayscale_900,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  statusBadge: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  statusBadgeText: {},
  reservationInfo: {
    flex: 1,
    gap: 4,
  },
  roomName: {
    color: COLORS.grayscale_900,
  },
  periodText: {
    color: COLORS.grayscale_900,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardWrapper: {
    width: screenWidth * 0.84,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  bottomSheet: {
    width: '100%',
    height: 420,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
});
