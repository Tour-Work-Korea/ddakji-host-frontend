import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  header: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconButton: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButton: {
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  selectorText: {
    color: COLORS.grayscale_800,
    marginRight: 4,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
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
  placeholderArea: {
    flex: 1,
  },
  listScrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 34,
  },
  iconWrap: {
    width: 28,
    height: 28,
    marginRight: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    right: -4,
    bottom: -3,
    width: 16,
    height: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeConfirm: {
    backgroundColor: COLORS.semantic_blue,
  },
  statusBadgeCancel: {
    backgroundColor: COLORS.semantic_red,
  },
  notificationContent: {
    flex: 1,
    paddingTop: 2,
  },
  notificationTitle: {
    color: COLORS.grayscale_800,
    lineHeight: 26,
    marginBottom: 4,
  },
  notificationLine: {
    color: COLORS.grayscale_700,
    lineHeight: 24,
  },
  noticeLine: {
    color: COLORS.grayscale_600,
    lineHeight: 22,
  },
  notificationDate: {
    color: COLORS.grayscale_500,
    lineHeight: 20,
    marginTop: 6,
  },
});
