import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    color: COLORS.grayscale_800,
    marginTop: 20,
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
    borderRadius: 8,
    padding: 20,
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    paddingRight: 12,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginLeft: 8,
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
    lineHeight: 16,
  },
  optionDescriptionSelected: {
    color: COLORS.grayscale_700,
  },
  noticeBox: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary_red,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    color: COLORS.semantic_red,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
