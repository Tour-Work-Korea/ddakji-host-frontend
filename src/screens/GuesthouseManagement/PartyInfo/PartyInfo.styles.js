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
    paddingTop: 28,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 112,
    height: 112,
    borderRadius: 4,
    marginRight: 16,
    backgroundColor: COLORS.grayscale_100,
  },
  cardContent: {
    flex: 1,
    paddingTop: 4,
    minHeight: 112,
  },
  cardTop: {
    flex: 1,
  },
  partyTitle: {
    color: COLORS.grayscale_900,
    lineHeight: 24,
    marginBottom: 4,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceText: {
    color: COLORS.grayscale_500,
    marginLeft: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginLeft: 12,
  },
  actionButtonText: {
    color: COLORS.grayscale_800,
  },
  actionIcon: {
    marginLeft: 8,
  },
});
