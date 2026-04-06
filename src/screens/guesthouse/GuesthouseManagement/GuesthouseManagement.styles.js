import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  guesthouseSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  topBarTitle: {
    color: COLORS.grayscale_800,
    marginRight: 4,
    maxWidth: 220,
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
  reviewContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // 게하 카드
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

  // 게하 없을 때
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
