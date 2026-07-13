import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';

const formatDeadlineDate = value => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}. ${month}. ${day}`;
};

const getTagText = tag =>
  tag?.hashtagName ??
  tag?.hashtag ??
  tag?.name ??
  tag?.title ??
  (typeof tag === 'string' ? tag : '');

const getApplicationCount = item =>
  Number.isNaN(
    Number(item?.applicationCount ?? item?.applicantCount ?? item?.applyCount),
  )
    ? 0
    : Number(item?.applicationCount ?? item?.applicantCount ?? item?.applyCount);

const isRecruitClosed = item => {
  if (item?.isRecruiting === false) {
    return true;
  }

  const status = String(
    item?.recruitStatus ?? item?.status ?? item?.recruitState ?? '',
  ).toUpperCase();

  return ['RECRUIT_END', 'CLOSED', 'CLOSE', 'END'].includes(status);
};

const ApplicantItem = ({
  item,
  onPress,
  handleEditPosting = null,
  handleDeletePosting = null,
  handleClosePosting = null,
  isEditable = false,
  isRemovable = false,
  variant = 'default',
  showApplicationCount = false,
}) => {
  if (variant === 'staffPosting') {
    const tags = Array.isArray(item?.hashtags)
      ? item.hashtags.map(getTagText).filter(Boolean).slice(0, 3)
      : [];
    const deadlineDate = formatDeadlineDate(item?.deadline);
    const isClosed = isRecruitClosed(item);

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(item)}>
        <View
          style={[
            styles.staffPostingCard,
            isClosed && styles.staffPostingCardClosed,
          ]}>
          <View style={styles.staffHeader}>
            <Image
              source={{uri: item.thumbnailImage}}
              style={[styles.staffAvatar, isClosed && styles.staffAvatarClosed]}
            />
            <View style={styles.staffInfoColumn}>
              <View style={styles.staffTitleRow}>
                <Text
                  style={[styles.staffTitle, isClosed && styles.staffTitleClosed]}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {item?.recruitTitle}
                </Text>
                {isClosed ? (
                  <View style={styles.staffClosedBadge}>
                    <Text style={styles.staffClosedBadgeText}>마감 완료</Text>
                  </View>
                ) : null}
                {isRemovable && handleDeletePosting ? (
                  <TouchableOpacity
                    style={styles.staffTopDeleteButton}
                    activeOpacity={0.8}
                    onPress={event => {
                      event.stopPropagation();
                      handleDeletePosting?.(item.recruitId);
                    }}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Text style={styles.staffTopDeleteText}>삭제</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.staffMetaRow}>
                <Text
                  style={[
                    styles.staffMetaText,
                    styles.staffAddressText,
                    isClosed && styles.staffTextClosed,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.address}
                </Text>
                {!!item.workDuration && (
                  <Text
                    style={[
                      styles.staffMetaText,
                      isClosed && styles.staffTextClosed,
                    ]}>
                    {item.workDuration}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {tags.length ? (
            <View style={styles.staffTagRow}>
              {tags.map((tag, index) => (
                <View
                  key={`${tag}-${index}`}
                  style={[styles.staffTag, isClosed && styles.staffTagClosed]}>
                  <Text
                    style={[
                      styles.staffTagText,
                      isClosed && styles.staffTagTextClosed,
                    ]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.staffDeadlineRow}>
            <Text
              style={[
                styles.staffDeadlineText,
                isClosed && styles.staffTextClosed,
              ]}>
              마감날짜: {deadlineDate || item?.deadline}
            </Text>

            {!isClosed && (isEditable || handleClosePosting) ? (
              <View style={styles.staffButtonRow}>
                {isEditable ? (
                  <TouchableOpacity
                    style={styles.staffEditButton}
                    activeOpacity={0.8}
                    onPress={event => {
                      event.stopPropagation();
                      handleEditPosting?.(item.recruitId);
                    }}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Text style={styles.staffEditButtonText}>수정</Text>
                  </TouchableOpacity>
                ) : null}
                {!isClosed && handleClosePosting ? (
                  <TouchableOpacity
                    style={styles.staffCloseButton}
                    activeOpacity={0.8}
                    onPress={event => {
                      event.stopPropagation();
                      handleClosePosting?.(item.recruitId);
                    }}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Text style={styles.staffCloseButtonText}>마감 처리</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : showApplicationCount ? (
              <View style={styles.applicationCountBadge}>
                <Text style={styles.applicationCountText}>
                  지원자 {getApplicationCount(item)}명
                </Text>
              </View>
            ) : null}
          </View>

          {/* <View style={styles.staffActionRow}>
            <View style={styles.staffActionItem}>
              <HeartIcon width={24} height={24} />
              <Text style={styles.staffActionText}>{item?.likeCount ?? 0}</Text>
            </View>
            <View style={styles.staffActionItem}>
              <ChatIcon width={24} height={24} />
              <Text style={styles.staffActionText}>{getCommentCount(item)}</Text>
            </View>
          </View> */}
        </View>
        <View style={styles.staffDivider} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <View style={styles.postingCard}>
        <View style={{flexDirection: 'row', gap: 10, alignItems: 'flex-start'}}>
          <Image
            source={{uri: item.thumbnailImage}}
            style={{width: 80, height: 80, borderRadius: 4}}
          />

          <View style={styles.rightCol}>
            <View>
              <Text style={styles.guestHouseText}>{item?.guesthouseName}</Text>
              <Text style={styles.title}>{item?.recruitTitle}</Text>
            </View>
            <View style={[styles.titleRow]}>
              <Text
                style={[styles.detailText, styles.leftEllipsis]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.address}
              </Text>
              <Text style={styles.detailText}>{item.workDuration}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.titleRow, styles.fullWidth, {marginTop: 10}]}>
          <Text style={styles.detailText}>마감일: {item.deadline}</Text>
          {isEditable || isRemovable || handleClosePosting ? (
            <View style={styles.iconsContainer}>
              {isEditable ? (
                <TouchableOpacity
                  onPress={event => {
                    event.stopPropagation();
                    handleEditPosting?.(item.recruitId);
                  }}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.editButton}>수정</Text>
                </TouchableOpacity>
              ) : null}
              {isRemovable && handleDeletePosting ? (
                <TouchableOpacity
                  onPress={event => {
                    event.stopPropagation();
                    handleDeletePosting?.(item.recruitId);
                  }}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.deleteButton}>삭제</Text>
                </TouchableOpacity>
              ) : null}
              {handleClosePosting ? (
                <TouchableOpacity
                  onPress={event => {
                    event.stopPropagation();
                    handleClosePosting?.(item.recruitId);
                  }}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.deleteButton}>마감처리</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : showApplicationCount ? (
            <View style={styles.applicationCountBadge}>
              <Text style={styles.applicationCountText}>
                지원자 {getApplicationCount(item)}명
              </Text>
            </View>
          ) : (
            <View style={{width: 1}} />
          )}
        </View>
      </View>
      <View style={styles.divider} />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  staffPostingCard: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  staffPostingCardClosed: {
    backgroundColor: COLORS.grayscale_100,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  staffAvatar: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
  },
  staffAvatarClosed: {
    opacity: 0.45,
  },
  staffInfoColumn: {
    flex: 1,
    minHeight: 64,
    justifyContent: 'space-between',
  },
  staffTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  staffTopDeleteButton: {
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  staffTopDeleteText: {
    ...FONTS.fs_14_medium,
    color: COLORS.semantic_red,
  },
  staffClosedBadge: {
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_200,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  staffClosedBadgeText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  staffTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
    lineHeight: 22,
    flex: 1,
  },
  staffTitleClosed: {
    color: COLORS.grayscale_400,
  },
  staffMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 6,
  },
  staffAddressText: {
    flex: 1,
  },
  staffMetaText: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_500,
    lineHeight: 20,
  },
  staffTextClosed: {
    color: COLORS.grayscale_400,
  },
  staffTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  staffTag: {
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  staffTagClosed: {
    backgroundColor: COLORS.grayscale_200,
  },
  staffTagText: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
  },
  staffTagTextClosed: {
    color: COLORS.grayscale_400,
  },
  staffDeadlineRow: {
    alignItems: 'stretch',
    gap: 12,
    marginTop: 14,
  },
  staffDeadlineText: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_500,
    flex: 1,
  },
  staffButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  staffEditButton: {
    minWidth: 54,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary_blue,
    paddingHorizontal: 16,
  },
  staffEditButtonText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_0,
  },
  staffCloseButton: {
    minWidth: 76,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 14,
  },
  staffCloseButtonText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },
  staffActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 16,
  },
  staffActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staffActionText: {
    ...FONTS.fs_16_regular,
    color: COLORS.grayscale_900,
  },
  staffDivider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginHorizontal: 12,
  },
  postingCard: {
    marginBottom: 8,
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  guestHouseText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
  },
  rightCol: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
  },

  leftEllipsis: {
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },
  detailText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  applicationCountBadge: {
    alignSelf: 'flex-end',
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  applicationCountText: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
  },
  icon: {
    width: 24,
    height: 24,
    color: COLORS.grayscale_500,
  },
  deleteButton: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },
  editButton: {
    backgroundColor: COLORS.primary_blue,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_0,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary_orange,
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
  divider: {
    borderWidth: 0.4,
    borderColor: COLORS.grayscale_300,
    marginVertical: 4,
    marginHorizontal: 20,
  },
});

export default ApplicantItem;
