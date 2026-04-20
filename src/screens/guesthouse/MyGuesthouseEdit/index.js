import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';

import styles from './MyGuesthouseEdit.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import GuesthouseInfoModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseInfoModal';
import GuesthouseIntroSummaryModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseIntroSummaryModal';
import GuesthouseRoomModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseRoom/GuesthouseRoomModal';
import GuesthouseRefundPolicyModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseRefundPolicyModal';
import GuesthouseDetailInfoModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseDetailInfoModal';
import GuesthouseRulesModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseRulesModal';
import GuesthouseAmenitiesModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseAmenitiesModal';
import useGuesthouseMetaStore from '@stores/guesthouseMetaStore';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckWhite from '@assets/images/check_white.svg';

const MyGuesthouseEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const guesthouseHashtags = useGuesthouseMetaStore(
    state => state.guesthouseHashtags,
  );
  const guesthouseAmenities = useGuesthouseMetaStore(
    state => state.guesthouseAmenities,
  );
  const hashtagNameToId = useMemo(
    () => Object.fromEntries(guesthouseHashtags.map(tag => [tag.hashtag, tag.id])),
    [guesthouseHashtags],
  );
  const hashtagIdToName = useMemo(
    () => Object.fromEntries(guesthouseHashtags.map(tag => [tag.id, tag.hashtag])),
    [guesthouseHashtags],
  );
  const amenityNameToId = useMemo(
    () => Object.fromEntries(guesthouseAmenities.map(amenity => [amenity.name, amenity.id])),
    [guesthouseAmenities],
  );
  const amenityTypeToId = useMemo(
    () => Object.fromEntries(guesthouseAmenities.map(amenity => [amenity.amenityType, amenity.id])),
    [guesthouseAmenities],
  );
  const amenityIdToMeta = useMemo(
    () => Object.fromEntries(guesthouseAmenities.map(amenity => [amenity.id, amenity])),
    [guesthouseAmenities],
  );

  const [guesthouse, setGuesthouse] = useState({
    guesthouseName: '',
    guesthouseAddress: '',
    guesthousePhone: '',
    guesthouseShortIntro: '',
    guesthouseLongDesc: '',
    checkIn: '15:00:00',
    checkOut: '11:00:00',
    guesthouseImages: [],
    roomInfos: [],
    refundPolicies: [],
    amenities: [],
    hashtags: [],
    rules: '',
    guesthouseDetailAddress: '',
  });

  // 선택된 amenities id만 별도로 들고 다니는 상태 (모달 프리셋용)
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // 상세 화면에서 보낸 초기값 주입
  useEffect(() => {
    const initial = route.params?.initialGuesthouse;
    if (!initial) return;

    // 해시태그 처리
    const hashtagNames = Array.isArray(initial.hashtags) ? initial.hashtags : [];
    const hashtagIds = hashtagNames
      .map(name => hashtagNameToId[name])
      .filter(v => v !== null && v !== undefined);

    // 어매너티 문자열(amenityType 라벨) | { amenityId } | (상세의) { amenityType } 모두 대응
    const initAmenities = initial.amenities || [];
    let selectedIds = [];

    if (initAmenities.length > 0) {
        const first = initAmenities[0];
      if (typeof first === 'string') {
        selectedIds = initAmenities
          .map(name => amenityNameToId[name])
          .filter(Boolean);
      } else if (first && typeof first === 'object') {
        if ('amenityId' in first) {
          selectedIds = initAmenities
            .map(a => a.amenityId)
            .filter(v => v != null);
        } else if ('amenityType' in first) {
          selectedIds = initAmenities
            .map(
              a =>
                amenityTypeToId[a.amenityType] ||
                amenityNameToId[a.name] ||
                amenityNameToId[a.amenityType],
            )
            .filter(Boolean);
        }
      }
    }

    setGuesthouse(prev => ({
      ...prev,
      ...initial,
      hashtagIds,            // 모달 프리셋/서버 전송용
      hashtags: hashtagNames, // 화면 표기용
      // 내부 상태는 id 기반으로 맞춰서 들고다니면 이후 처리(저장) 편함
      amenities: selectedIds.map(id => ({ amenityId: id, count: 1 })),
    }));
    setSelectedAmenities(selectedIds);
  }, [amenityNameToId, amenityTypeToId, hashtagNameToId, route.params]);

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
    const namesFromIds = (data.tagIds || [])
    .map(id => hashtagIdToName[id])
    .filter(Boolean);

    setGuesthouse(prev => ({
      ...prev,
      guesthouseName: data.name,
      guesthouseAddress: data.address,
      guesthouseDetailAddress: data.addressDetail || '',
      guesthousePhone: data.phone,
      hashtagIds: data.tagIds,   // 서버 전송/프리셋(id)
      hashtags: namesFromIds,    // 미리보기/렌더용(이름)
      checkIn: data.checkIn,
      checkOut: data.checkOut
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

  const handleRefundPolicySelect = refundPolicies => {
    setGuesthouse(prev => ({
      ...prev,
      refundPolicies,
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
    setSelectedAmenities(ids);
    setAmenitiesModalReset(false); 
    setAmenitiesModalVisible(false);
  };

  const handleSubmit = async () => {
    Toast.show({
      type: 'success',
      text1: '수정이 완료되었습니다!',
      position: 'top',
      visibilityTime: 1200,
    });
    navigation.goBack()
  };

  const renderSectionRow = (title, onPress) => (
    <TouchableOpacity
      style={styles.section}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text
        style={[
          FONTS.fs_16_medium,
          styles.sectionTitle,
          styles.sectionTitlePending,
        ]}>
        {title}
      </Text>
      <View style={styles.sectionIconWrap}>
        <ChevronRight width={24} height={24} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="게스트하우스 정보 수정" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.bodyContainer}>
          {renderSectionRow('게스트하우스 정보', () =>
            setInfoModalVisible(true),
          )}
          {renderSectionRow('게스트하우스 소개요약', () =>
            setIntroModalVisible(true),
          )}
          {renderSectionRow('객실', () =>
            setRoomModalVisible(true),
          )}
          {renderSectionRow('취소 및 환불규정', () =>
            setRefundModalVisible(true),
          )}
          {renderSectionRow('상세정보', () =>
            setDetailInfoModalVisible(true),
          )}
          {renderSectionRow('이용규칙', () =>
            setRulesModalVisible(true),
          )}
          {renderSectionRow('편의시설 및 서비스', () =>
            setAmenitiesModalVisible(true),
          )}

          <Text style={[FONTS.fs_12_medium, styles.explainText]}>
            각 섹션마다 수정사항이 바로 적용됩니다.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        {/* <TouchableOpacity 
          style={styles.previewButton}
          onPress={() => {
            // 해시태그: 이름 -> {id, hashtag}
            const previewHashtags = (guesthouse?.hashtags || [])
              .map(name => {
                const id = hashtagNameToId[name];
                return id ? {id, hashtag: name} : {id: null, hashtag: name};
              })
              .filter(t => t.id !== null);

            // 어매니티: 상태가 어떤 형태든 메타 객체 기준으로 통일
            const previewAmenities = (guesthouse?.amenities || [])
              .map(a => {
                if (typeof a === 'string') {
                  const amenityId =
                    amenityTypeToId[a] || amenityNameToId[a];
                  return amenityId ? amenityIdToMeta[amenityId] : null;
                }
                if (typeof a === 'number') return amenityIdToMeta[a];
                if (a && typeof a === 'object') {
                  if ('amenityId' in a) return amenityIdToMeta[a.amenityId];
                  if ('amenityType' in a) {
                    const amenityId =
                      amenityTypeToId[a.amenityType] ||
                      amenityNameToId[a.name] ||
                      amenityNameToId[a.amenityType];
                    return amenityId ? amenityIdToMeta[amenityId] : a;
                  }
                }
                return null;
              })
              .filter(Boolean);

            const previewData = {
              ...guesthouse,
              hashtags: previewHashtags,
              amenities: previewAmenities,
            };

            navigation.navigate('MyGuesthousePreview', {
              hideEditButton: true,
              previewData,
            });
          }}
        >
          <Text style={[FONTS.fs_14_medium, styles.previewButtonText]}>
            미리보기
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text 
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
            ]}
          >
            수정완료
          </Text>
          <CheckWhite width={24} height={24}/>
        </TouchableOpacity>
      </View>

      {/* 게스트하우스 정보 모달 */}
      <GuesthouseInfoModal
        visible={infoModalVisible}
        shouldResetOnClose={infoModalReset}
        onClose={() => setInfoModalVisible(false)}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        defaultName={guesthouse?.guesthouseName || ''}
        defaultAddress={guesthouse?.guesthouseAddress || ''}
        defaultDetailAddress={guesthouse?.guesthouseDetailAddress || ''}
        defaultPhone={guesthouse?.guesthousePhone || ''}
        defaultCheckIn={guesthouse?.checkIn || '15:00:00'}
        defaultCheckOut={guesthouse?.checkOut || '11:00:00'}
        defaultHashtags={
          (guesthouse?.hashtags || [])
            .map(name => guesthouseHashtags.find(t => t.hashtag === name))
            .filter(Boolean)
        }
        onSelect={handleInfoSelect}
      />

      {/* 게스트하우스 소개요약 모달 */}
      <GuesthouseIntroSummaryModal
        visible={introModalVisible}
        shouldResetOnClose={introModalReset}
        onClose={() => setIntroModalVisible(false)}
        defaultImages={guesthouse?.guesthouseImages || []}
        defaultShortIntro={guesthouse?.guesthouseShortIntro || ''}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleIntroSelect}
      />
      
      {/* 객실 모달 */}
      <GuesthouseRoomModal
        visible={roomModalVisible}
        shouldResetOnClose={roomModalReset}
        onClose={() => setRoomModalVisible(false)}
        defaultRooms={guesthouse?.roomInfos || []}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleRoomSelect}
      />

      <GuesthouseRefundPolicyModal
        visible={refundModalVisible}
        shouldResetOnClose={refundModalReset}
        onClose={() => setRefundModalVisible(false)}
        defaultPolicies={guesthouse?.refundPolicies || []}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleRefundPolicySelect}
      />

      {/* 상세정보 모달 */}
      <GuesthouseDetailInfoModal
        visible={detailInfoModalVisible}
        shouldResetOnClose={detailInfoModalReset}
        onClose={() => setDetailInfoModalVisible(false)}
        defaultLongDesc={guesthouse?.guesthouseLongDesc || ''}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleDetailInfoSelect}
      />

      {/* 이용규칙 모달 */}
      <GuesthouseRulesModal
        visible={rulesModalVisible}
        shouldResetOnClose={rulesModalReset}
        onClose={() => setRulesModalVisible(false)}
        defaultRules={guesthouse?.rules || ''}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleRulesSelect}
      />

      {/* 편의시설 및 서비스 모달 */}
      <GuesthouseAmenitiesModal
        visible={amenitiesModalVisible}
        shouldResetOnClose={amenitiesModalReset}
        onClose={() => setAmenitiesModalVisible(false)}
        defaultSelected={selectedAmenities}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleAmenitiesSelect}
      />
    </View>
  );
};

export default MyGuesthouseEdit;
