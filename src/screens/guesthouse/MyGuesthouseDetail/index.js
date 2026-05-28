import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import Carousel from 'react-native-reanimated-carousel';

import styles from './MyGuesthouseDetail.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ImageModal from '@components/modals/ImageModal';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import Loading from '@components/Loading';
import ServiceInfoContent from './ServiceInfoContent';

import EmptyHeart from '@assets/images/heart_empty.svg';
import LeftArrow from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import EditIcon from '@assets/images/edit_white.svg';
import CalendarIcon from '@assets/images/calendar_white.svg';
import PersonIcon from '@assets/images/person20_white.svg';
import ReviewIcon from '@assets/images/wa_orange_noreview.svg';

import RightChevron from '@assets/images/chevron_right_gray.svg';

const TAB_OPTIONS = ['객실', '소개', '시설/서비스', '이용규칙', '리뷰', '취소규정'];

const MyGuesthousePreview = ({ route }) => {
  const navigation = useNavigation();
  const {id, previewData = null, hideEditButton = false} = route.params || {};
  const [activeTab, setActiveTab] = useState('객실');
  const [detail, setDetail] = useState(null);

  // 사진
  const { width: SCREEN_W } = Dimensions.get('window');
  const IMAGE_H = 280;
  const thumbnailIndex = useMemo(() => {
    const idx = (detail?.guesthouseImages ?? []).findIndex(i => i?.isThumbnail);
    return Math.max(idx, 0);
  }, [detail?.guesthouseImages]);

  const [imageIndex, setImageIndex] = useState(thumbnailIndex);
  useEffect(() => {
    setImageIndex(thumbnailIndex);
  }, [thumbnailIndex]);

  // 이미지 모달
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // 오늘/내일 날짜 고정
  const today = dayjs();
  const tomorrow = dayjs().add(1, 'day');
  const checkInDateStr = today.format('YYYY-MM-DD');
  const checkOutDateStr = tomorrow.format('YYYY-MM-DD');

  const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';
  const dormitoryGenderMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };

  // 게하 상세 정보 불러오기
  const fetchDetail = useCallback(async () => {
    if (previewData) {
      setDetail(previewData);
    }

    if (!id) {
      return;
    }

    try {
      const response = await hostGuesthouseApi.getGuesthouseDetail(id);
      setDetail(response.data);
    } catch (e) {
      // 에러 처리 필요시 추가
    }
  }, [id, previewData]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  // 썸네일을 맨 앞으로 정렬한 이미지 리스트
  const sortedImages = useMemo(() => {
    const imgs = [...(detail?.guesthouseImages ?? [])];
    return imgs.sort((a, b) =>
      a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1
    );
  }, [detail?.guesthouseImages]);
  const hasImages = sortedImages.length > 0;
  const modalImages = useMemo(() => (
    sortedImages.map(img => ({ id: img.id, imageUrl: img.guesthouseImageUrl }))
  ), [sortedImages]);
  const refundPolicies = useMemo(
    () =>
      [...(detail?.refundPolicies ?? [])].sort(
        (a, b) => a.daysBeforeCheckin - b.daysBeforeCheckin,
      ),
    [detail?.refundPolicies],
  );

  // 수정 화면이동 시 데이터
  const mapDetailToEdit = (d) => ({
    guesthouseName: d.guesthouseName || '',
    guesthouseAddress: d.guesthouseAddress || '',
    guesthouseDetailAddress: d.guesthouseDetailAddress || '',
    guesthousePhone: d.guesthousePhone || '',
    guesthouseShortIntro: d.guesthouseShortIntro || '',
    guesthouseLongDesc: d.guesthouseLongDesc || '',
    checkIn: d.checkIn || '15:00:00',
    checkOut: d.checkOut || '11:00:00',

    guesthouseImages: (d.guesthouseImages || []).map(img => ({
      id: img.id,
      guesthouseImageUrl: img.guesthouseImageUrl,
      isThumbnail: !!img.isThumbnail,
    })),

    roomInfos: (d.roomInfos || []).map(r => ({
      id: r.id,
      roomName: r.roomName,
      roomCapacity: r.roomCapacity,
      roomMaxCapacity: r.roomMaxCapacity,
      roomDesc: r.roomDesc,
      roomPrice: r.roomPrice,
      roomExtraFees: r.roomExtraFees || [],
      roomImages: (r.roomImages || []).map(ri => ({
        id: ri.id,
        roomImageUrl: ri.roomImageUrl,
        isThumbnail: !!ri.isThumbnail,
      })),
      roomType: r.roomType,
    })),

    amenities: d.amenities || [],
    refundPolicies: d.refundPolicies || [],
    refundPolicyAdditionalNotice: d.refundPolicyAdditionalNotice || '',

    // 해시태그 (이름만 넘김)
    hashtags: (d.hashtags || []).map(h => h.hashtag),

    rules: d.rules || '',
  });

  if (!detail) {
    return <Loading title="게스트하우스를 불러오고 있어요" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View>
        {/* 대표 이미지 */}
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
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setImageModalVisible(true)}
              >
                <Image
                  source={{ uri: item.guesthouseImageUrl }}
                  style={styles.mainImage}
                />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View
            style={[
              styles.mainImage,
              { backgroundColor: COLORS.grayscale_200 },
            ]}
          />
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <LeftArrow width={28} height={28}/>
        </TouchableOpacity>

        {!hideEditButton ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              const initialGuesthouse = mapDetailToEdit(detail);
              navigation.navigate('MyGuesthouseEdit', {
                initialGuesthouse,
                guesthouseId: detail.id,
              });
            }}
          >
            <EditIcon width={18} height={18}/>
          </TouchableOpacity>
        ) : null}

        {/* 해시태그 */}
        <View style={styles.tagContainer}>
          {detail.hashtags?.map((tag, index) => (
            <View key={tag.id || index} style={styles.tagBox}>
              <Text style={[FONTS.fs_12_medium, styles.tagText]}>
                {tag.hashtag}
              </Text>
            </View>
          ))}
          <View style={styles.tagBox}>
            <Text style={[FONTS.fs_12_medium, styles.tagText]}>
              #
            </Text>
          </View>
        </View>
      </View>

    <View style={styles.contentWrapper}>
      <View style={styles.contentTopWrapper}>
        <View style={styles.nameIconContainer}>
          <Text style={[FONTS.fs_20_semibold, styles.name]}>
            {detail.guesthouseName}
          </Text>
          <View style={styles.topIcons}>
            <View>
              <ShareIcon width={20} height={20} />
            </View>
            <View>
              <EmptyHeart width={20} height={20} />
            </View>
          </View>
        </View>

        <Text style={[FONTS.fs_14_regular, styles.address]}>
          {detail.guesthouseAddress} {detail.guesthouseDetailAddress}
        </Text>

        {detail.guesthousePhone ? (
          <Text style={[FONTS.fs_14_regular, styles.phone]}>
            숙소 문의 : {detail.guesthousePhone}
          </Text>
        ) : null}

        <View style={styles.reviewRow}>
          <View style={styles.reviewBox}>
            <Text style={[FONTS.fs_12_medium, styles.rating]}>
              {detail.averageRating?.toFixed?.(1) ?? '0.0'}
            </Text>
            <Text style={styles.ratingDevide}>·</Text>
            <Text style={[FONTS.fs_12_medium, styles.reviewCount]}>
              {detail.reviewCount ?? 0} 리뷰
            </Text>
          </View>
        </View>

        <View style={styles.shortIntroContainer}>
          <Text style={[FONTS.fs_14_regular, styles.shortIntroText]}>
            {detail.guesthouseShortIntro}
          </Text>
        </View>

        <View style={styles.devide}/>

        <View style={styles.displayDateGuestRow}>
          <View style={styles.dateInfoContainer}>
            <CalendarIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
              {today.format('M.D ddd')} - {tomorrow.format('M.D ddd')}
            </Text>
          </View>
          <View style={styles.guestInfoContainer}>
            <PersonIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
              인원 1
            </Text>
          </View>
        </View>
      </View>

      {/* 탭 메뉴 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabMenuWrapper}
        contentContainerStyle={styles.tabMenuContent}>
        {TAB_OPTIONS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <View style={styles.tabButton}>
              <Text
                style={[
                  FONTS.fs_14_semibold,
                  { color: activeTab === tab ? COLORS.primary_blue : COLORS.grayscale_800 },
                ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === '객실' && (
        <View style={styles.roomContentWrapper}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>객실</Text>
          {detail.roomInfos?.map(room => {
          const isDormitory = room.roomType === 'DORMITORY';
          const genderText = dormitoryGenderMap[room.dormitoryGenderType] || '';
          const thumbnailImage =
            room.roomImages?.find(img => img.isThumbnail)?.roomImageUrl ||
            room.roomImages?.[0]?.roomImageUrl;

          return (
            <View key={room.id}>
              <View style={styles.roomCard}>
                {thumbnailImage ? (
                  <Image
                    source={{ uri: thumbnailImage }}
                    style={styles.roomImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.roomImage,
                      { backgroundColor: COLORS.grayscale_0 },
                    ]}
                  />
                )}

                <View style={styles.roomInfo}>
                  <View style={styles.roomNameDescContainer}>
                    <View style={[styles.roomInfoRow, styles.roomTitleRow]}>
                      <View style={styles.roomNameTextWrapper}>
                        <Text
                          style={[FONTS.fs_16_semibold, styles.roomType]}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {room.roomName}
                        </Text>
                      </View>
                      <Text style={[FONTS.fs_18_semibold, styles.roomPrice]}>
                        {room.roomPrice?.toLocaleString()}원
                      </Text>
                    </View>

                    {isDormitory ? (
                      <>
                        <View style={styles.roomInfoRow}>
                          <View style={styles.roomMetaInline}>
                            <Text
                              style={[
                                FONTS.fs_14_medium,
                                styles.roomMetaText,
                              ]}>
                              [{room.roomCapacity}인 도미토리]
                            </Text>
                            {room.dormitoryGenderType !== 'MIXED' && !!genderText ? (
                              <Text
                                style={[
                                  FONTS.fs_14_medium,
                                  styles.roomMetaText,
                                ]}>
                                , {genderText}
                              </Text>
                            ) : null}
                          </View>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              styles.roomMetaText,
                            ]}>
                            1베드 당
                          </Text>
                        </View>

                        <View style={styles.checkTimeContainer}>
                          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
                            입실 {formatTime(detail.checkIn)}
                          </Text>
                          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
                            퇴실 {formatTime(detail.checkOut)}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.roomDetailBtn}
                          onPress={() => {
                            navigation.navigate('MyRoomDetail', {
                              roomId: room.id,
                              roomName: room.roomName,
                              roomPrice: room.roomPrice,
                              roomDesc: room.roomDesc,
                              roomCapacity: room.roomCapacity,
                              roomType: room.roomType,
                              dormitoryGenderType: room.dormitoryGenderType,
                              roomMaxCapacity: room.roomMaxCapacity,
                              femaleOnly: room.femaleOnly,
                              checkIn: `${checkInDateStr}T${detail.checkIn}`,
                              checkOut: `${checkOutDateStr}T${detail.checkOut}`,
                              checkInTime: detail.checkIn,
                              checkOutTime: detail.checkOut,
                              guestCount: 1,
                              roomImages: room.roomImages || [],
                            });
                          }}>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              styles.roomDetailBtnText,
                            ]}>
                            상세보기
                          </Text>
                          <RightChevron width={16} height={16} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <View style={styles.roomInfoRow}>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              styles.roomMetaText,
                            ]}>
                            [일반객실]
                          </Text>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              styles.roomMetaText,
                            ]}>
                            1객실 당
                          </Text>
                        </View>

                        <View style={styles.checkTimeContainer}>
                          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
                            입실 {formatTime(detail.checkIn)}
                          </Text>
                          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
                            퇴실 {formatTime(detail.checkOut)}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.roomDetailBtn}
                          onPress={() => {
                            navigation.navigate('MyRoomDetail', {
                              roomId: room.id,
                              roomName: room.roomName,
                              roomPrice: room.roomPrice,
                              roomDesc: room.roomDesc,
                              roomCapacity: room.roomCapacity,
                              roomType: room.roomType,
                              dormitoryGenderType: room.dormitoryGenderType,
                              roomMaxCapacity: room.roomMaxCapacity,
                              femaleOnly: room.femaleOnly,
                              checkIn: `${checkInDateStr}T${detail.checkIn}`,
                              checkOut: `${checkOutDateStr}T${detail.checkOut}`,
                              checkInTime: detail.checkIn,
                              checkOutTime: detail.checkOut,
                              guestCount: 1,
                              roomImages: room.roomImages || [],
                            });
                          }}>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              styles.roomDetailBtnText,
                            ]}>
                            상세보기
                          </Text>
                          <RightChevron width={16} height={16} />
                        </TouchableOpacity>

                        <View
                          style={[
                            styles.roomInfoRow,
                            styles.roomInfoBottomRow,
                          ]}>
                          <View style={styles.roomMetaInline}>
                            <Text
                              style={[
                                FONTS.fs_14_medium,
                                styles.roomType,
                              ]}>
                              {room.roomCapacity}인 기준(최대 {room.roomMaxCapacity}인)
                            </Text>
                            <Text
                              style={[
                                FONTS.fs_14_medium,
                                styles.roomType,
                              ]}>
                              {room.femaleOnly ? ', 여성전용' : ''}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        </View>
      )}

      {activeTab === '소개' && (
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>소개</Text>
          <View style={styles.longTextContainer}>
            <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
              {detail.guesthouseLongDesc}
            </Text>
          </View>
        </View>
      )}

      {activeTab === '시설/서비스' && (
        <ServiceInfoContent selectedAmenities={detail.amenities} />
      )}

      {activeTab === '이용규칙' && (
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>이용 규칙</Text>
          <View style={styles.longTextContainer}>
            <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
              {detail.rules}
            </Text>
          </View>
        </View>
      )}

      {activeTab === '리뷰' && (
        <View style={styles.introductionContainer}>
          <View style={styles.reviewRowContainer}>
            <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>리뷰</Text>
            <View style={styles.reviewRow}>
              <View style={styles.reviewBoxBlue}>
                <Text style={[FONTS.fs_12_medium, styles.rating]}>
                  {detail.averageRating?.toFixed?.(1) ?? '0.0'}
                </Text>
                <Text style={styles.ratingDevide}>·</Text>
                <Text style={[FONTS.fs_12_medium, styles.reviewCount]}>
                  {detail.reviewCount ?? 0} 리뷰
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.reviewContainer}>
            <ReviewIcon width={100} height={60}/>
            <Text style={[FONTS.fs_14_medium, styles.reviewText]}>리뷰란 입니다.</Text>
          </View>
        </View>
      )}

      {activeTab === '취소규정' && (
        <View style={styles.introductionContainer}>
          {!!detail.refundPolicyAdditionalNotice && (
            <>
              <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>
                추가 안내사항
              </Text>
              <View style={styles.longTextContainer}>
                <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
                  {detail.refundPolicyAdditionalNotice}
                </Text>
              </View>
            </>
          )}
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>취소 수수료</Text>
          {refundPolicies.length > 0 ? (
            <View style={styles.refundPolicyContainer}>
              {refundPolicies.map((policy, index) => (
                <View
                  key={`${policy.daysBeforeCheckin}-${index}`}
                  style={styles.refundPolicyRow}>
                  <Text style={[FONTS.fs_12_medium, styles.refundPolicyText]}>
                    방문 {policy.daysBeforeCheckin}일 전
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.refundPolicyText]}>
                    총금액의
                  </Text>
                  <Text style={[FONTS.fs_14_semibold, styles.refundRateText]}>
                    {policy.refundRate}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.refundPolicyText]}>
                    % 환불
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.refundEmptyBox}>
              <Text style={[FONTS.fs_14_regular, styles.refundEmptyText]}>
                등록된 취소규정이 없어요.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>

    {/* 이미지 모달 */}
    {hasImages && (
      <ImageModal
        visible={imageModalVisible}
        title={detail.guesthouseName}
        images={modalImages}
        selectedImageIndex={imageIndex}
        onClose={() => setImageModalVisible(false)}
      />
    )}
    </ScrollView>
  );
};

export default MyGuesthousePreview;
