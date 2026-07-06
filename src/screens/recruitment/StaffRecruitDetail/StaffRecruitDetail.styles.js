import {Platform, StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 128,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_200,
  },
  guesthouseName: {
    color: COLORS.grayscale_900,
    flexShrink: 1,
  },
  deadline: {
    color: COLORS.primary_blue,
    marginLeft: 'auto',
  },
  recruitTitle: {
    color: COLORS.grayscale_900,
    marginTop: 16,
    lineHeight: 20,
  },
  shortDescription: {
    color: COLORS.grayscale_700,
    marginTop: 8,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  tagText: {
    color: COLORS.primary_blue,
  },
  tabSection: {
    marginTop: 28,
  },
  detailSection: {
    marginTop: 28,
    paddingTop: 0,
  },
  detailTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  detailText: {
    color: COLORS.grayscale_800,
    lineHeight: 22,
  },
  detailLinkText: {
    color: COLORS.primary_blue,
    textDecorationLine: 'underline',
  },
  commentSection: {
    marginTop: 28,
    paddingTop: 24,
  },
  commentList: {
    gap: 16,
  },
  commentBlock: {
    position: 'relative',
  },
  commentSurface: {
    paddingVertical: 2,
  },
  commentContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentAvatar: {
    flexShrink: 0,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentNickname: {
    color: COLORS.grayscale_900,
  },
  commentTime: {
    color: COLORS.grayscale_400,
  },
  editedText: {
    color: COLORS.grayscale_400,
  },
  commentText: {
    color: COLORS.grayscale_900,
    lineHeight: 22,
    marginTop: 4,
  },
  commentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: COLORS.grayscale_600,
  },
  replySection: {
    marginTop: 12,
    marginLeft: 50,
  },
  replyList: {
    gap: 14,
  },
  replyRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  replyMoreButton: {
    marginTop: 12,
    marginLeft: 50,
    alignSelf: 'flex-start',
  },
  replyMoreText: {
    color: COLORS.primary_blue,
  },
  commentFooterLoading: {
    marginTop: 18,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
  },
  bottomInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInputBar: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.grayscale_100,
    marginBottom: Platform.OS === 'ios' ? 28 : 16,
    marginTop: 12,
  },
  commentInputBarFocused: {
    alignItems: 'flex-end',
    borderRadius: 18,
  },
  commentInput: {
    flex: 1,
    color: COLORS.grayscale_900,
    padding: 0,
    paddingTop: 4,
    paddingBottom: 0,
    lineHeight: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary_orange,
  },
  sendButtonText: {
    color: COLORS.grayscale_0,
    lineHeight: 24,
  },
  replyTargetBox: {
    marginTop: 12,
    marginBottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  replyTargetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  replyTargetTitle: {
    flex: 1,
    color: COLORS.grayscale_700,
  },
  replyTargetCancel: {
    color: COLORS.primary_orange,
  },
  replyTargetContent: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
});

export default styles;
