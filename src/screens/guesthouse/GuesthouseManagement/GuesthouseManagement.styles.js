import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  guesthouseSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  topBarTitle: {
    color: COLORS.grayscale_800,
    marginRight: 4,
    maxWidth: 220,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary_orange,
  },
  tabText: {
    color: COLORS.grayscale_500,
  },
  tabTextActive: {
    color: COLORS.primary_orange,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.grayscale_100,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary_orange,
  },
  chipText: {
    color: COLORS.grayscale_700,
  },
  chipTextActive: {
    color: COLORS.grayscale_0,
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
    marginBottom: 40,
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: COLORS.grayscale_0,
  },
  primaryButtonText: {
    color: COLORS.grayscale_700,
  },
});
