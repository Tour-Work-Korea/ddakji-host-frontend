import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    color: COLORS.grayscale_800,
    marginTop: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.grayscale_400,
    marginBottom: 20,
  },
  optionList: {
    gap: 16,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.grayscale_0,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary_orange,
    padding: 19,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    paddingRight: 12,
  },
  optionTitle: {
    color: COLORS.grayscale_800,
  },
  optionTitleSelected: {
    color: COLORS.primary_orange,
  },
  recommendedBadge: {
    marginLeft: 8,
    backgroundColor: COLORS.primary_orange,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recommendedBadgeText: {
    color: COLORS.grayscale_0,
    fontSize: 10,
  },
  descriptionWrap: {
    gap: 6,
  },
  optionDescription: {
    color: COLORS.grayscale_600,
    lineHeight: 21,
  },
  optionDescriptionSelected: {
    color: COLORS.grayscale_700,
  },
  noticeBox: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#FFF2EE',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: '#FF6E57',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 28,
  },
  applyButton: {
    height: 48,
    borderRadius: 10,
  },
});
