import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  guesthouseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardImage: {
    width: 112,
    height: 112,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_100,
  },
  cardImagePlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  cardTextWrap: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 4,
  },
  cardTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  cardAddress: {
    color: COLORS.grayscale_500,
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonSpacer: {
    width: 12,
  },
  actionButtonText: {
    color: COLORS.grayscale_800,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 120,
  },
  emptyTitle: {
    color: COLORS.grayscale_700,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 20,
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: COLORS.grayscale_0,
    marginTop: 24,
  },
  primaryButtonText: {
    color: COLORS.grayscale_700,
  },
});
