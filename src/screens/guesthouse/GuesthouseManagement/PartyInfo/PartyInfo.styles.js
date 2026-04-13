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
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  thumbnail: {
    width: 86,
    height: 86,
    borderRadius: 6,
    marginRight: 16,
    backgroundColor: COLORS.grayscale_100,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flex: 1,
  },
  partyTitle: {
    color: COLORS.grayscale_800,
    lineHeight: 22,
    marginBottom: 6,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceText: {
    color: COLORS.grayscale_500,
    marginLeft: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionButtonText: {
    color: COLORS.grayscale_600,
  },
  actionIcon: {
    marginLeft: 4,
  },
});
