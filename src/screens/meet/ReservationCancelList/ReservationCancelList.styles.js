import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  partyContextCard: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  partyContextTitle: {
    flex: 1,
    minWidth: 0,
    color: COLORS.grayscale_700,
  },
  partyContextDate: {
    flexShrink: 0,
    color: COLORS.primary_orange,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listTitle: {
    color: COLORS.grayscale_700,
  },
  listCount: {
    color: COLORS.primary_orange,
  },
  listSection: {
    gap: 12,
  },
  feedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  feedbackText: {
    color: COLORS.grayscale_500,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 18,
    backgroundColor: COLORS.grayscale_0,
  },
  reservationInfo: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    color: COLORS.grayscale_700,
  },
  genderBadge: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderMaleBadge: {
    backgroundColor: COLORS.secondary_blue,
  },
  genderFemaleBadge: {
    backgroundColor: COLORS.secondary_pink,
  },
  genderMaleText: {
    color: COLORS.semantic_blue,
  },
  genderFemaleText: {
    color: COLORS.semantic_pink,
  },
  birthText: {
    color: COLORS.grayscale_400,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.grayscale_500,
  },
  metaDivider: {
    width: 2,
    height: 2,
    borderRadius: 999,
    marginHorizontal: 2,
    backgroundColor: COLORS.grayscale_500,
  },
  callButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
