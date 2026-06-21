import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';

import styles from './MyGuesthouseAdd.styles';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import useGuesthouseMetaStore from '@stores/guesthouseMetaStore';
import {resolveAmenityMetas} from '@utils/guesthouseMeta';
import Header from '@components/Header';
import GuesthouseInfoModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseInfoModal';
import GuesthouseIntroSummaryModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseIntroSummaryModal';
import GuesthouseRoomModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseRoom/GuesthouseRoomModal';
import GuesthouseRefundPolicyModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseRefundPolicyModal';
import GuesthouseDetailInfoModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseDetailInfoModal';
import GuesthouseRulesModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseRulesModal';
import GuesthouseAmenitiesModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseAmenitiesModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

const MyGuesthouseAdd = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeGuesthouseId = route.params?.guesthouseId ?? null;
  const guesthouseHashtags = useGuesthouseMetaStore(
    state => state.guesthouseHashtags,
  );
  const guesthouseAmenities = useGuesthouseMetaStore(
    state => state.guesthouseAmenities,
  );

  const [guesthouse, setGuesthouse] = useState({
    guesthouseAddress: '',
    guesthousePhone: '',
    guesthouseShortIntro: '',
    guesthouseLongDesc: '',
    checkIn: '15:00:00',
    checkOut: '11:00:00',
    contentCategories: [],
    guesthouseImages: [],
    roomInfos: [],
    refundPolicies: [],
    refundPolicyAdditionalNotice: '',
    amenities: [],
    hashtagIds: [],
    rules: '',
    guesthouseDetailAddress: '',
  });

  // 게스트하우스 정보 모달
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalReset, setInfoModalReset] = useState(true);
  // 게스트하우스 소개요약 모달
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [introModalReset, setIntroModalReset] = useState(true);
  // 객실 모달
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [roomModalReset, setRoomModalReset] = useState(true);
  // 취소 및 환불규정 모달
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundModalReset, setRefundModalReset] = useState(true);
  // 상세정보 모달
  const [detailInfoModalVisible, setDetailInfoModalVisible] = useState(false);
  const [detailInfoModalReset, setDetailInfoModalReset] = useState(true);
  // 이용규칙 모달
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [rulesModalReset, setRulesModalReset] = useState(true);
  // 편의시설 모달
  const [amenitiesModalVisible, setAmenitiesModalVisible] = useState(false);
  const [amenitiesModalReset, setAmenitiesModalReset] = useState(true);

  // 게스트하우스 정보 모달에서 "적용" 눌렀을 때
  const handleInfoSelect = (data) => {
    setGuesthouse(prev => ({
      ...prev,
      guesthouseAddress: data.address,
      guesthouseDetailAddress: data.addressDetail || '',
      guesthousePhone: data.phone,
      hashtagIds: data.tagIds,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      contentCategories: data.contentCategories || [],
    }));
    setInfoModalReset(false); // 닫아도 초기화 안 함
    setInfoModalVisible(false);
  };

  // 게스트하우스 소개요약 모달에서 "적용" 눌렀을 때
  const handleIntroSelect = (data) => {
    setGuesthouse(prev => ({
      ...prev,
      guesthouseImages: data.guesthouseImages,
      guesthouseShortIntro: data.shortIntroText,
    }));
    setIntroModalReset(false); // 닫아도 초기화 안 함
    setIntroModalVisible(false);
  };

  // 객실 모달에서 "적용" 눌렀을 때
  const handleRoomSelect = (rooms) => {
    setGuesthouse(prev => ({
      ...prev,
      roomInfos: rooms,
    }));
    setRoomModalReset(false); // 닫아도 유지
    setRoomModalVisible(false);
  };

  // 취소 및 환불규정 모달에서 "적용" 눌렀을 때
  const handleRefundPolicySelect = ({refundPolicies, refundNotice}) => {
    setGuesthouse(prev => ({
      ...prev,
      refundPolicies,
      refundPolicyAdditionalNotice: refundNotice,
    }));
    setRefundModalReset(false);
    setRefundModalVisible(false);
  };

  // 상세정보 모달에서 "적용" 눌렀을 때
  const handleDetailInfoSelect = (data) => {
    setGuesthouse(prev => ({
      ...prev,
      guesthouseLongDesc: data.guesthouseLongDesc,
    }));
    setDetailInfoModalReset(false); // 닫아도 유지
    setDetailInfoModalVisible(false);
  };

  // 이용규칙 모달에서 "적용" 눌렀을 때
  const handleRulesSelect = (rulesText) => {
    setGuesthouse(prev => ({ ...prev, rules: rulesText }));
    setRulesModalReset(false); // 닫아도 유지
    setRulesModalVisible(false);
  };

  // 편의시설 모달에서 "적용" 눌렀을 때
  const handleAmenitiesSelect = (ids) => {
    setGuesthouse(prev => ({
      ...prev,
      amenities: ids.map(id => ({ amenityId: id, count: 1 })),
    }));
    setAmenitiesModalReset(false); 
    setAmenitiesModalVisible(false);
  };

  // 유효성 체크
  const isNonEmpty = (v) =>
    (typeof v === 'string' && v.trim().length > 0) ||
    (typeof v === 'number' && !Number.isNaN(v));

  const hasNumberValue = (v) =>
    v !== null && v !== undefined && !Number.isNaN(Number(v));
  const hasThumb = (arr = []) => Array.isArray(arr) && arr.some(i => i?.isThumbnail === true);
  const isRoomValid = (room) =>
    isNonEmpty(room?.roomName) &&
    ['DORMITORY', 'PRIVATE'].includes(room?.roomType ?? '') &&
    hasNumberValue(room?.roomCapacity) &&
    isNonEmpty(room?.roomDesc) &&
    hasNumberValue(room?.roomPrice) &&
    Array.isArray(room?.roomImages) &&
    room.roomImages.length > 0 &&
    hasThumb(room.roomImages);

  const isSubmitReady =
    // 기본 정보
    isNonEmpty(guesthouse.guesthouseAddress) &&
    isNonEmpty(guesthouse.guesthousePhone) &&
    isNonEmpty(guesthouse.guesthouseShortIntro) &&
    isNonEmpty(guesthouse.guesthouseLongDesc) &&
    isNonEmpty(guesthouse.rules) && 
    Array.isArray(guesthouse.contentCategories) &&
    guesthouse.contentCategories.length > 0 &&
    // 체크인/체크아웃은 기본값 존재하므로 생략 가능 (원하면 isNonEmpty로 체크)
    // 이미지(숙소)
    Array.isArray(guesthouse.guesthouseImages) &&
    guesthouse.guesthouseImages.length > 0 &&
    hasThumb(guesthouse.guesthouseImages) &&
    // 객실
    Array.isArray(guesthouse.roomInfos) &&
    guesthouse.roomInfos.length > 0 &&
    guesthouse.roomInfos.every(isRoomValid) &&
    Array.isArray(guesthouse.refundPolicies) &&
    guesthouse.refundPolicies.length > 0 &&
    // 편의시설(최소 1개)
    Array.isArray(guesthouse.amenities) &&
    guesthouse.amenities.length > 0 &&
    // 해시태그(선택 기준이 있다면 유지)
    Array.isArray(guesthouse.hashtagIds) &&
    guesthouse.hashtagIds.length > 0;

  const handleSubmit = async () => {
    if (!isSubmitReady) return;

    try {
      if (!routeGuesthouseId) {
        Alert.alert('등록 실패', 'guesthouseId를 찾을 수 없습니다.');
        return;
      }

      const toLocalTime = (timeStr) => {
        if (typeof timeStr !== 'string') return timeStr;
        const [h = '0', m = '0', s = '0'] = timeStr.split(':');
        const pad = (v) => String(v).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
      };

      const normalizeRoom = (room) => {
        const roomType = room?.roomType ?? null;
        const roomCapacity = Number(room?.roomCapacity);
        const roomMaxCapacity = Number(
          roomType === 'DORMITORY'
            ? roomCapacity
            : room?.roomMaxCapacity ?? roomCapacity
        );

        return {
          roomName: room?.roomName ?? '',
          roomType,
          dormitoryGenderType:
            roomType === 'DORMITORY'
              ? room?.dormitoryGenderType ?? null
              : 'MIXED',
          femaleOnly: roomType === 'PRIVATE' ? !!room?.femaleOnly : false,
          roomCapacity,
          roomMaxCapacity,
          roomDesc: room?.roomDesc ?? '',
          roomPrice: Number(room?.roomPrice),
          roomImages: Array.isArray(room?.roomImages) ? room.roomImages : [],
        };
      };

      const dto = {
        guesthouseAddress: guesthouse.guesthouseAddress,
        guesthouseDetailAddress: guesthouse.guesthouseDetailAddress,
        guesthousePhone: guesthouse.guesthousePhone,
        checkIn: toLocalTime(guesthouse.checkIn),
        checkOut: toLocalTime(guesthouse.checkOut),
        contentCategories: guesthouse.contentCategories,
        hashtagIds: guesthouse.hashtagIds,
        guesthouseShortIntro: guesthouse.guesthouseShortIntro,
        guesthouseImages: guesthouse.guesthouseImages,
        roomInfos: guesthouse.roomInfos.map(normalizeRoom),
        refundPolicies: guesthouse.refundPolicies,
        refundPolicyAdditionalNotice: guesthouse.refundPolicyAdditionalNotice,
        guesthouseLongDesc: guesthouse.guesthouseLongDesc,
        rules: guesthouse.rules,
        amenities: guesthouse.amenities,
      };

      // console.log('📦 Guesthouse finalize dto:', JSON.stringify(dto, null, 2));

      const res = await hostGuesthouseApi.finalizeGuesthouse(routeGuesthouseId, dto);
      console.log('등록 성공', res.data);
      Toast.show({
        type: 'success',
        text1: '게스트하우스가 등록되었습니다!',
        position: 'top',
        visibilityTime: 1200,
      });

      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (error) {
      Alert.alert('등록 실패', error?.response?.data?.message ?? '오류가 발생했습니다.', [
        {text: '확인'},
      ]);
    }
  };

  const isInfoDone =
    isNonEmpty(guesthouse.guesthouseAddress) &&
    isNonEmpty(guesthouse.guesthousePhone) &&
    isNonEmpty(guesthouse.checkIn) &&
    isNonEmpty(guesthouse.checkOut) &&
    Array.isArray(guesthouse.contentCategories) &&
    guesthouse.contentCategories.length > 0 &&
    Array.isArray(guesthouse.hashtagIds) &&
    guesthouse.hashtagIds.length > 0;

  const isIntroDone =
    isNonEmpty(guesthouse.guesthouseShortIntro) &&
    Array.isArray(guesthouse.guesthouseImages) &&
    guesthouse.guesthouseImages.length > 0 &&
    hasThumb(guesthouse.guesthouseImages);

  const isRoomDone =
    Array.isArray(guesthouse.roomInfos) &&
    guesthouse.roomInfos.length > 0 &&
    guesthouse.roomInfos.every(isRoomValid);

  const isRefundDone =
    Array.isArray(guesthouse.refundPolicies) &&
    guesthouse.refundPolicies.length > 0;

  const isDetailDone = isNonEmpty(guesthouse.guesthouseLongDesc);

  const isRulesDone = isNonEmpty(guesthouse.rules);

  const isAmenitiesDone =
    Array.isArray(guesthouse.amenities) &&
    guesthouse.amenities.length > 0;

  const handlePreview = () => {
    const previewHashtags = guesthouseHashtags.filter(tag =>
      guesthouse.hashtagIds.includes(tag.id),
    );
    const previewAmenities = resolveAmenityMetas(
      guesthouse.amenities,
      guesthouseAmenities,
    );

    navigation.navigate('MyGuesthousePreview', {
      hideEditButton: true,
      previewData: {
        guesthouseName: '',
        guesthouseAddress: guesthouse.guesthouseAddress,
        guesthouseDetailAddress: guesthouse.guesthouseDetailAddress,
        guesthousePhone: guesthouse.guesthousePhone,
        guesthouseShortIntro: guesthouse.guesthouseShortIntro,
        guesthouseLongDesc: guesthouse.guesthouseLongDesc,
        checkIn: guesthouse.checkIn,
        checkOut: guesthouse.checkOut,
        contentCategories: guesthouse.contentCategories,
        guesthouseImages: guesthouse.guesthouseImages,
        roomInfos: guesthouse.roomInfos,
        refundPolicies: guesthouse.refundPolicies,
        refundPolicyAdditionalNotice: guesthouse.refundPolicyAdditionalNotice,
        amenities: previewAmenities,
        hashtags: previewHashtags,
        rules: guesthouse.rules,
      },
    });
  };

  // 아이콘 렌더 유틸
  const renderRightIcon = done => {
    return done ? <CheckOrange width={24} height={24} /> : <ChevronRight width={24} height={24} />;
  };

  const renderSectionRow = (title, done, onPress) => (
    <TouchableOpacity
      style={styles.section}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text
        style={[
          FONTS.fs_16_medium,
          styles.sectionTitle,
          done ? styles.sectionTitleDone : styles.sectionTitlePending,
        ]}>
        {title}
      </Text>
      <View style={styles.sectionIconWrap}>{renderRightIcon(done)}</View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="게스트하우스 등록" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.bodyContainer}>
          {renderSectionRow('정보', isInfoDone, () =>
            setInfoModalVisible(true),
          )}
          {renderSectionRow('소개요약', isIntroDone, () =>
            setIntroModalVisible(true),
          )}
          {renderSectionRow('객실', isRoomDone, () => setRoomModalVisible(true))}
          {renderSectionRow('취소 및 환불규정', isRefundDone, () =>
            setRefundModalVisible(true),
          )}
          {renderSectionRow('상세정보', isDetailDone, () =>
            setDetailInfoModalVisible(true),
          )}
          {renderSectionRow('이용규칙', isRulesDone, () =>
            setRulesModalVisible(true),
          )}
          {renderSectionRow('편의시설 및 서비스', isAmenitiesDone, () =>
            setAmenitiesModalVisible(true),
          )}
        </View>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          모든 항목을 입력하셔야 등록이 완료됩니다.
        </Text>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.previewButton}
          activeOpacity={0.8}
          onPress={handlePreview}>
          <Text style={[FONTS.fs_14_medium, styles.previewButtonText]}>
            미리보기
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            !isSubmitReady && styles.submitButtonDisabled,
          ]}
          disabled={!isSubmitReady}
          onPress={handleSubmit}
        >
          <Text 
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
              !isSubmitReady && styles.submitTextDisabled,
            ]}
          >
            등록하기
          </Text>
          {isSubmitReady ? (
            <CheckWhite width={24} height={24}/>
          ) : (
            <CheckBlack width={24} height={24}/>
          )}
        </TouchableOpacity>
      </View>

      {/* 게스트하우스 정보 모달 */}
      <GuesthouseInfoModal
        visible={infoModalVisible}
        shouldResetOnClose={infoModalReset}
        onClose={() => setInfoModalVisible(false)}
        onSelect={handleInfoSelect}
      />

      {/* 게스트하우스 소개요약 모달 */}
      <GuesthouseIntroSummaryModal
        visible={introModalVisible}
        shouldResetOnClose={introModalReset}
        onClose={() => setIntroModalVisible(false)}
        onSelect={handleIntroSelect}
      />
      
      {/* 객실 모달 */}
      <GuesthouseRoomModal
        visible={roomModalVisible}
        shouldResetOnClose={roomModalReset}
        onClose={() => setRoomModalVisible(false)}
        onSelect={handleRoomSelect}
      />

      <GuesthouseRefundPolicyModal
        visible={refundModalVisible}
        shouldResetOnClose={refundModalReset}
        onClose={() => setRefundModalVisible(false)}
        onSelect={handleRefundPolicySelect}
      />

      {/* 상세정보 모달 */}
      <GuesthouseDetailInfoModal
        visible={detailInfoModalVisible}
        shouldResetOnClose={detailInfoModalReset}
        onClose={() => setDetailInfoModalVisible(false)}
        onSelect={handleDetailInfoSelect}
      />

      {/* 이용규칙 모달 */}
      <GuesthouseRulesModal
        visible={rulesModalVisible}
        shouldResetOnClose={rulesModalReset}
        onClose={() => setRulesModalVisible(false)}
        onSelect={handleRulesSelect}
      />

      {/* 편의시설 및 서비스 모달 */}
      <GuesthouseAmenitiesModal
        visible={amenitiesModalVisible}
        shouldResetOnClose={amenitiesModalReset}
        onClose={() => setAmenitiesModalVisible(false)}
        onSelect={handleAmenitiesSelect}
      />
    </View>
  );
};

export default MyGuesthouseAdd;
