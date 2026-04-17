import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  documentRow: {
    paddingVertical: 28,
  },
  documentRowBorder: {
    borderBottomWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  documentTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  documentUpdatedAt: {
    color: COLORS.grayscale_500,
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 84,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: COLORS.primary_blue,
  },
  viewButtonText: {
    color: COLORS.grayscale_0,
  },
  downloadButton: {
    backgroundColor: COLORS.grayscale_200,
  },
  downloadButtonText: {
    color: COLORS.grayscale_700,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.grayscale_200,
  },
  actionButtonTextDisabled: {
    color: COLORS.grayscale_400,
  },
});
