import React, {useMemo, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {formatLocalDateToDot} from '@utils/formatDate';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import ImageModal from '@components/modals/ImageModal';

const ApplicantAdditionalInfo = ({data}) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const photos = useMemo(
    () =>
      Array.isArray(data?.resumePhotoUrls)
        ? data.resumePhotoUrls.filter(Boolean)
        : [],
    [data?.resumePhotoUrls],
  );
  const photoItems = useMemo(
    () => photos.map((uri, index) => ({id: index, imageUrl: uri})),
    [photos],
  );
  const startDate = data?.startDate ? formatLocalDateToDot(data.startDate) : '';
  const message = data?.message ?? '';

  const handlePressPhoto = index => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  if (!photos.length && !startDate && !message) {
    return null;
  }

  return (
    <>
      {photos.length ? (
        <View style={styles.sectionBox}>
          <Text style={styles.titleText}>사진</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoList}>
            {photos.map((uri, index) => (
              <TouchableOpacity
                key={`${uri}-${index}`}
                activeOpacity={0.85}
                onPress={() => handlePressPhoto(index)}>
                <Image source={{uri}} style={styles.photo} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {startDate || message ? (
        <View style={[styles.sectionBox, styles.questionSectionBox]}>
          {startDate ? (
            <View style={styles.dateRow}>
              <Text style={styles.titleText}>입도 가능 날짜</Text>
              <View style={styles.dateValueRow}>
                <CalendarIcon width={18} height={18} />
                <Text style={styles.dateText}>{startDate}</Text>
              </View>
            </View>
          ) : null}

          {message ? (
            <View style={styles.messageBlock}>
              <Text style={styles.titleText}>추가 문의 사항</Text>
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <ImageModal
        visible={imageModalVisible}
        title="사진"
        images={photoItems}
        selectedImageIndex={selectedImageIndex}
        onClose={() => setImageModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 16,
  },
  questionSectionBox: {
    gap: 35,
  },
  titleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  photoList: {
    gap: 18,
    paddingRight: 8,
  },
  photo: {
    width: 108,
    height: 108,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_100,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },
  messageBlock: {
    gap: 16,
  },
  messageBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  messageText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
    lineHeight: 20,
  },
});

export default ApplicantAdditionalInfo;
