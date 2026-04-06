import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import Carousel from 'react-native-reanimated-carousel';

import styles from './MyRoomDetail.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ImageModal from '@components/modals/ImageModal';

import LeftArrow from '@assets/images/chevron_left_white.svg';

const MyRoomDetail = ({ route }) => {
  const navigation = useNavigation();
  
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const {
    roomName,
    roomPrice,
    roomDesc,
    checkIn,
    checkOut,
    checkInTime,
    checkOutTime,
    guestCount,
    roomImages,
    roomCapacity,
    roomType,
    dormitoryGenderType,
    roomMaxCapacity,
    femaleOnly,
  } = route.params;
  const formatTime = (timeStr) => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid()
        ? date.format('HH:mm')
        : timeStr.slice(0, 5);
  };
  const formatDateWithDay = (dateStr) => {
    const date = dayjs(dateStr);
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };

  // 이미지 처리
  const images = roomImages ?? [];
  const sortedImages = [...images].sort((a, b) =>
    a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1,
  );
  const hasImages = sortedImages.length > 0;
  const thumbnailIndex = Math.max(
    sortedImages.findIndex(i => i?.isThumbnail),
    0,
  );

  const modalImages = sortedImages.map((img) => ({
    id: img.id,
    imageUrl: img.roomImageUrl,
  }));
  const {width: SCREEN_W} = Dimensions.get('window');
  const IMAGE_H = 280;
  const [imageIndex, setImageIndex] = useState(thumbnailIndex);

  const roomTypeMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };
  const isDormitory = roomType === 'DORMITORY';
  const genderText = roomTypeMap[dormitoryGenderType] || '';

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {hasImages ? (
            <Carousel
              width={SCREEN_W}
              height={IMAGE_H}
              data={sortedImages}
              defaultIndex={thumbnailIndex}
              loop={false}
              autoPlay={false}
              pagingEnabled
              onSnapToItem={idx => setImageIndex(idx)}
              renderItem={({item}) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setImageModalVisible(true)}>
                  <Image source={{uri: item.roomImageUrl}} style={styles.image} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View
            style={[styles.image, { backgroundColor: COLORS.grayscale_200 }]}
            />
          )}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <LeftArrow width={28} height={28}/>
            </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.roomInfo}>
            <Text style={[FONTS.fs_20_semibold, styles.roomType]}>
              {roomName}
            </Text>
            {isDormitory ? (
              <View style={styles.roomMetaRow}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.roomMetaText,
                  ]}>
                  [{roomCapacity}인 도미토리]
                </Text>
                {dormitoryGenderType !== 'MIXED' && !!genderText ? (
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.roomMetaText,
                    ]}>
                    , {genderText}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.roomMetaRow}>
                <Text style={[FONTS.fs_14_medium, styles.roomType]}>
                  {roomCapacity}인 기준(최대 {roomMaxCapacity}인)
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.roomType]}>
                  {femaleOnly ? ', 여성전용' : ''}
                </Text>
              </View>
            )}
            <Text style={[FONTS.fs_14_regular, styles.description]}>
              {roomDesc}
            </Text>
            <Text style={[FONTS.fs_20_bold, styles.price]}>
              {roomPrice.toLocaleString()}원
            </Text>
          </View>

          <Text style={[FONTS.fs_16_medium, styles.dateTitle]}>선택 날짜</Text>
          <View style={styles.dateBoxContainer}>
            <View style={styles.dateBoxCheckIn}>
              <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크인</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkIn)}</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatTime(checkInTime || checkIn)}
              </Text>
            </View>
            <View style={styles.dateBoxCheckOut}>
              <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크아웃</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkOut)}</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatTime(checkOutTime || checkOut)}
              </Text>
            </View>
          </View>

          <View style={styles.guestCountRow}>
            <Text style={[FONTS.fs_16_medium]}>선택 인원</Text>
            <Text style={[FONTS.fs_16_semibold]}>{guestCount ?? 1}명</Text>
          </View>
        </View>
      </ScrollView>

      {/* 이미지 모달 */}
      {hasImages && (
          <ImageModal
              visible={imageModalVisible}
              title={roomName}
              images={modalImages}
              selectedImageIndex={imageIndex}
              onClose={() => setImageModalVisible(false)}
          />
      )}
    </View>
  );
};

export default MyRoomDetail;
