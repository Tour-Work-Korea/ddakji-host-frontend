import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  header: {
    height: 280,
    backgroundColor: COLORS.grayscale_100,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  heroTagRow: {
    position: 'absolute',
    flexDirection: 'row',
    left: 20,
    top: 40,
    gap: 4,
    flexWrap: 'wrap',
    right: 20,
  },
  heroTagChip: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  heroTagText: {
    color: COLORS.primary_blue,
  },
  contentContainer: {
    paddingHorizontal: 0,
    backgroundColor: COLORS.grayscale_100,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: -32,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    alignItems: 'center',
  },
  summaryAvatar: {
    position: 'absolute',
    top: -24,
    borderWidth: 2,
    borderColor: COLORS.grayscale_0,
  },
  summaryGuesthouseName: {
    marginTop: 2,
    marginBottom: 8,
    color: COLORS.grayscale_500,
    textAlign: 'center',
  },
  titleText: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  scheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  scheduleText: {
    color: COLORS.grayscale_700,
  },
  descriptionContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  description: {
    color: COLORS.grayscale_700,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 20,
  },
  tabButton: {
    paddingBottom: 10,
    flex: 1,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary_blue,
    paddingBottom: 9,
  },
  tabText: {
    color: COLORS.grayscale_800,
  },
  tabTextActive: {
    color: COLORS.primary_blue,
  },
  tabPager: {
    flex: 1,
  },
  tabPage: {
    flexShrink: 0,
  },
  tabContent: {
    gap: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.grayscale_0,
    flex: 1,
    paddingTop: 12,
    paddingBottom: 120,
  },
  infoTextContainer: {
    borderRadius: 8,
    marginBottom: 20,
  },
  infoMainTitleText: {},
  infoTitleText: {
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 22,
    color: COLORS.grayscale_700,
  },
  detailInfoContainer: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  detailInfoText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagWrapper: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagText: {
    color: COLORS.primary_blue,
    flexShrink: 1,
  },
  detailInfoBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    flexShrink: 0,
  },
  detailInfoBtnText: {
    color: COLORS.grayscale_400,
  },
  eventImageRow: {
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  eventImageBlog: {
    width: 340,
    height: 300,
    backgroundColor: COLORS.grayscale_100,
  },
  eventBlock: {
    marginBottom: 20,
  },
  eventTitle: {
    marginTop: 4,
    color: COLORS.grayscale_900,
  },
  eventBody: {
    marginTop: 6,
    lineHeight: 20,
    color: COLORS.grayscale_700,
  },
  sectionBox: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 4,
    color: COLORS.grayscale_900,
  },
  locationMapContainer: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  locationMap: {
    flex: 1,
  },
  fixedNotice: {
    position: 'absolute',
    left: 9,
    right: 9,
    bottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.secondary_red,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fixedNoticeText: {
    flex: 1,
    color: COLORS.grayscale_700,
  },
  emptyContainer: {
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.grayscale_600,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default styles;
