import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  title: {
    color: COLORS.grayscale_900,
  },
  description: {
    marginTop: 8,
    marginBottom: 28,
    color: COLORS.grayscale_500,
  },
  typeCard: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_0,
  },
  typeTextWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  typeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTitle: {
    color: COLORS.grayscale_900,
  },
  typeDescription: {
    marginTop: 8,
    color: COLORS.grayscale_500,
    lineHeight: 20,
  },
  dailyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.secondary_yellow,
  },
  dailyBadgeText: {
    color: COLORS.semantic_brown,
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.secondary_blue,
  },
  eventBadgeText: {
    color: COLORS.primary_blue,
  },
  guideBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_100,
  },
  guideText: {
    color: COLORS.grayscale_500,
    lineHeight: 18,
  },
});
