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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  fieldLabel: {
    color: COLORS.grayscale_900,
  },
  roomListLabel: {
    color: COLORS.grayscale_900,
    marginTop: 24,
    marginBottom: 12,
  },
  weekSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    height: 52,
    marginTop: 8,
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
    marginTop: 16,
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
  roomList: {
    gap: 14,
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomInfoCol: {
    flex: 1,
    gap: 8,
  },
  roomNameText: {
    color: COLORS.grayscale_900,
  },

  bedControlCol: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 12,
  },
  bedLabel: {
    color: COLORS.grayscale_500,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_0,
  },
  controlBtnDisabled: {
    borderColor: COLORS.grayscale_200,
    opacity: 0.35,
  },
  disabledOpacity: {
    opacity: 0.35,
  },
  countText: {
    color: COLORS.grayscale_900,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
});
