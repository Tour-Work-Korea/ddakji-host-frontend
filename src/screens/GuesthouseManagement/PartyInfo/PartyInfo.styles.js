import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.grayscale_700,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 20,
  },
  registerButton: {
    paddingVertical: 8,
    paddingHorizontal: 36,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    backgroundColor: COLORS.grayscale_0,
  },
  registerButtonText: {
    color: COLORS.grayscale_700,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 88,
  },
  cardContainer: {
    marginBottom: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_0,
  },
  endedCardContainer: {
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  thumbnail: {
    width: 104,
    height: 104,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: COLORS.grayscale_100,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    color: COLORS.grayscale_400,
  },
  endedThumbnail: {
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardTop: {
    flex: 1,
  },
  contentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dateEventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.secondary_blue,
  },
  dateEventBadgeText: {
    color: COLORS.primary_blue,
  },
  endedTypeBadge: {
    backgroundColor: COLORS.grayscale_200,
  },
  endedTypeBadgeText: {
    color: COLORS.grayscale_500,
  },
  endedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_200,
  },
  endedBadgeText: {
    color: COLORS.grayscale_600,
  },
  partyTitle: {
    color: COLORS.grayscale_900,
    lineHeight: 22,
    marginBottom: 4,
  },
  endedPartyTitle: {
    color: COLORS.grayscale_600,
  },
  eventScheduleText: {
    marginBottom: 6,
    color: COLORS.grayscale_600,
    lineHeight: 17,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceText: {
    color: COLORS.grayscale_500,
    marginLeft: 6,
  },
  priceOptionText: {
    color: COLORS.grayscale_700,
    lineHeight: 17,
    marginTop: 7,
  },
  applicationSetting: {
    minHeight: 62,
    marginTop: 10,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applicationSettingTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  applicationSettingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applicationSettingTitle: {
    color: COLORS.grayscale_800,
  },
  applicationStatusOpen: {
    color: COLORS.primary_orange,
  },
  applicationStatusClosed: {
    color: COLORS.grayscale_500,
  },
  applicationSettingDescription: {
    color: COLORS.grayscale_500,
    lineHeight: 16,
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.grayscale_200,
  },
  actionButtonText: {
    color: COLORS.grayscale_800,
    marginRight: 8,
  },
  actionIcon: {
    marginLeft: 8,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary_blue,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  addButtonLocation: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  addButtonText: {
    color: COLORS.grayscale_0,
    marginRight: 10,
  },
});
