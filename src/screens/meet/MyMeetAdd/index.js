import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';

import styles from './MyMeetAdd.styles';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';

import MeetEventModal from '@components/modals/HostMy/Meet/AddMeet/MeetEventModal';
import PartyTitleIntroModal from '@components/modals/HostMy/Meet/AddMeet/PartyTitleIntroModal';
import PartyAnnouncementsModal from '@components/modals/HostMy/Meet/AddMeet/PartyAnnouncementsModal';
import PartyRulesModal from '@components/modals/HostMy/Meet/AddMeet/PartyRulesModal';
import PartyBasicsModal from '@components/modals/HostMy/Meet/AddMeet/PartyBasicsModal';
import PartyDetailInfoModal from '@components/modals/HostMy/Meet/AddMeet/PartyDetailInfoModal';
import PartyDirectionsModal from '@components/modals/HostMy/Meet/AddMeet/PartyDirectionsModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

const MyMeetAdd = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeGuesthouseId = Number(route.params?.guesthouseId);
  const initialGuesthouseId = Number.isFinite(routeGuesthouseId) && routeGuesthouseId > 0
    ? routeGuesthouseId
    : null;

  const [party, setParty] = useState({
    // 파티 제목 및 소개
    partyTitle: '',
    tags: '',
    partyImages: [],

    // 기본 정보
    guesthouseId: initialGuesthouseId,
    partyStartTime: '19:00:00',
    partyEndTime: '22:00:00',
    minAttendees: null,
    maxAttendees: null,
    isGuest: false,
    amount: null,
    femaleAmount: null,
    maleNonAmount: null,
    femaleNonAmount: null,

    // 필수 안내사항
    partyAnnouncements: [], // [{ announcement }]

    // 이벤트 소개글(모달)
    partyEvents: [], // [{ eventName, eventDescription, partyEventImageUrls:[] }]

    // 상세 안내(페이지)
    detailSchedule: '',
    snackTagList: [], // ["PARTY_SNACK", ...]
    snacks: '',
    extraInfo: '',

    // 이용 규칙
    rules: [], // [{title, content}]

    // 오시는 길(페이지)
    meetingPlace: '',
    trafficInfo: '',
    parkingInfo: '',
    parkingTag: [], // ["PARTY_PARKING", ...]
  });

  // 이벤트 소개글 모달 상태
  const [titleIntroModalVisible, setTitleIntroModalVisible] = useState(false);
  const [titleIntroModalReset, setTitleIntroModalReset] = useState(true);
  const [announcementsModalVisible, setAnnouncementsModalVisible] = useState(false);
  const [announcementsModalReset, setAnnouncementsModalReset] = useState(true);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [rulesModalReset, setRulesModalReset] = useState(true);
  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [basicModalReset, setBasicModalReset] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailModalReset, setDetailModalReset] = useState(true);
  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
  const [directionsModalReset, setDirectionsModalReset] = useState(true);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventModalReset] = useState(false);

  const isNonEmpty = v =>
    !(v === null || v === undefined || (typeof v === 'string' && v.trim() === ''));

  const countThumbnails = (arr = []) => arr.filter(x => x?.isThumbnail === true).length;
  const exactlyOneThumbnail = (arr = []) => countThumbnails(arr) === 1;

  const enforceSingleThumbnail = (arr = []) => {
    let seen = false;
    return arr.map(img => {
      if (img?.isThumbnail && !seen) {
        seen = true;
        return img;
      }
      return {...img, isThumbnail: false};
    });
  };

  const stripDuplicatesByUrl = (arr = []) => {
    const seen = new Set();
    return arr.filter(x => {
      if (!x?.imageUrl) return false;
      if (seen.has(x.imageUrl)) return false;
      seen.add(x.imageUrl);
      return true;
    });
  };

  const onSelectTitleIntro = payload => {
    if (!payload) return;

    setParty(prev => {
      let nextImages = prev.partyImages;

      if (Array.isArray(payload.partyImages)) {
        nextImages = enforceSingleThumbnail(stripDuplicatesByUrl(payload.partyImages));
      }

      return {
        ...prev,
        partyTitle: payload.partyTitle ?? prev.partyTitle,
        tags: payload.tags ?? prev.tags,
        partyImages: nextImages,
      };
    });
    setTitleIntroModalReset(false);
    setTitleIntroModalVisible(false);
  };

  // 기본 정보 페이지에서 돌아올 때
  // payload 예시:
  // {
  //   guesthouseId, partyStartTime, partyEndTime,
  //   minAttendees, maxAttendees, isGuest, amount, femaleAmount, maleNonAmount, femaleNonAmount
  // }
  const onSelectBasic = payload => {
    if (!payload) return;

    setParty(prev => {
      return {
        ...prev,
        guesthouseId: payload.guesthouseId ?? prev.guesthouseId,
        partyStartTime: payload.partyStartTime ?? prev.partyStartTime,
        partyEndTime: payload.partyEndTime ?? prev.partyEndTime,
        minAttendees: payload.minAttendees ?? prev.minAttendees,
        maxAttendees: payload.maxAttendees ?? prev.maxAttendees,
        isGuest: payload.isGuest ?? prev.isGuest,
        amount: payload.amount ?? prev.amount,
        femaleAmount: payload.femaleAmount ?? prev.femaleAmount,
        maleNonAmount: payload.maleNonAmount ?? prev.maleNonAmount,
        femaleNonAmount: payload.femaleNonAmount ?? prev.femaleNonAmount,
      };
    });
    setBasicModalReset(false);
    setBasicModalVisible(false);
  };

  const onSelectAnnouncements = payload => {
    if (!payload) return;

    const nextAnnouncements = Array.isArray(payload.partyAnnouncements)
      ? payload.partyAnnouncements
          .map(item => ({
            announcement: item?.announcement ?? item ?? '',
          }))
          .filter(item => item.announcement.trim() !== '')
      : [];

    setParty(prev => ({
      ...prev,
      partyAnnouncements:
        nextAnnouncements.length > 0 ? nextAnnouncements : prev.partyAnnouncements,
    }));
    setAnnouncementsModalReset(false);
    setAnnouncementsModalVisible(false);
  };

  // 상세 안내 페이지에서 돌아올 때
  // payload: { detailSchedule, snackTagList, snacks, extraInfo, rules }
  const onSelectDetail = payload => {
    if (!payload) return;
    setParty(prev => ({
      ...prev,
      detailSchedule: payload.detailSchedule ?? prev.detailSchedule,
      snackTagList: Array.isArray(payload.snackTagList) ? payload.snackTagList : prev.snackTagList,
      snacks: payload.snacks ?? prev.snacks,
      extraInfo: payload.extraInfo ?? prev.extraInfo,
      rules: Array.isArray(payload.rules) ? payload.rules : prev.rules,
    }));
    setDetailModalReset(false);
    setDetailModalVisible(false);
  };

  const onSelectRules = payload => {
    if (!payload) return;
    setParty(prev => ({
      ...prev,
      rules: Array.isArray(payload.rules) ? payload.rules : prev.rules,
    }));
    setRulesModalReset(false);
    setRulesModalVisible(false);
  };

  // 오시는 길 페이지에서 돌아올 때
  // payload: { meetingPlace, trafficInfo, parkingInfo, parkingTag }
  const onSelectWay = payload => {
    if (!payload) return;
    setParty(prev => ({
      ...prev,
      meetingPlace: payload.meetingPlace ?? prev.meetingPlace,
      trafficInfo: payload.trafficInfo ?? prev.trafficInfo,
      parkingInfo: payload.parkingInfo ?? prev.parkingInfo,
      parkingTag: Array.isArray(payload.parkingTag) ? payload.parkingTag : prev.parkingTag,
    }));
    setDirectionsModalReset(false);
    setDirectionsModalVisible(false);
  };

  // 이벤트 소개글 모달에서 "적용"
  // payload: { partyEvents: [{eventName, eventDescription, partyEventImageUrls: string[]}|string] }
  const onSelectEvent = ({partyEvents}) => {
    const normalized = Array.isArray(partyEvents)
      ? partyEvents
          .map(e => {
            if (typeof e === 'string') {
              return {eventName: e, eventDescription: '', partyEventImageUrls: []};
            }
            return {
              eventName: e?.eventName ?? '',
              eventDescription: e?.eventDescription ?? '',
              partyEventImageUrls: Array.isArray(e?.partyEventImageUrls) ? e.partyEventImageUrls : [],
            };
          })
          .filter(e => e.eventName.trim() !== '')
      : [];
    setParty(p => ({...p, partyEvents: normalized}));
    setEventModalVisible(false);
  };

  const stringifyInfo = value => {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (typeof item === 'string') return item.trim();
          const title = item?.title?.trim?.() ?? '';
          const content = item?.content?.trim?.() ?? '';
          return [title, content].filter(Boolean).join(' ');
        })
        .filter(Boolean)
        .join('\n');
    }
    return '';
  };

  const isTitleDone = isNonEmpty(party.partyTitle);
  const isTitleIntroDone =
    isTitleDone &&
    Array.isArray(party.partyImages) &&
    party.partyImages.length >= 1 &&
    exactlyOneThumbnail(party.partyImages);
  const isBasicDone =
    Number(party.guesthouseId) > 0 &&
    isNonEmpty(party.partyStartTime) &&
    isNonEmpty(party.partyEndTime) &&
    Number(party.minAttendees) > 0 &&
    Number(party.maxAttendees) >= Number(party.minAttendees);
  const isAnnouncementsDone =
    Array.isArray(party.partyAnnouncements) && party.partyAnnouncements.length > 0;
  const isEventDone = Array.isArray(party.partyEvents) && party.partyEvents.length > 0;
  const isDetailDone =
    isNonEmpty(party.detailSchedule) &&
    (Array.isArray(party.snackTagList) && party.snackTagList.length > 0);
  const isRulesDone = Array.isArray(party.rules) && party.rules.length > 0;
  const isWayDone =
    isNonEmpty(party.meetingPlace) ||
    isNonEmpty(stringifyInfo(party.trafficInfo)) ||
    isNonEmpty(stringifyInfo(party.parkingInfo)) ||
    (Array.isArray(party.parkingTag) && party.parkingTag.length > 0);
  // 제출 가능(필수 최소값만)
  const isSubmitReady =
    isTitleIntroDone &&
    isBasicDone &&
    isAnnouncementsDone &&
    isDetailDone;

  const buildPayload = () => {
    const base = {
      // 파티 제목 및 소개
      partyTitle: (party.partyTitle ?? '').trim(),
      partyImages: (party.partyImages || []).map(img => ({
        imageUrl: img.imageUrl,
        isThumbnail: !!img.isThumbnail,
      })),
      tags: isNonEmpty(party.tags) ? String(party.tags).trim() : undefined,

      // 기본 정보
      guesthouseId: Number(party.guesthouseId),
      partyStartTime: party.partyStartTime,
      partyEndTime: party.partyEndTime,
      minAttendees: Number(party.minAttendees),
      maxAttendees: Number(party.maxAttendees),
      isGuest: !!party.isGuest,
      amount: party.amount !== null && party.amount !== undefined ? Number(party.amount) : undefined,
      femaleAmount: party.femaleAmount !== null && party.femaleAmount !== undefined ? Number(party.femaleAmount) : undefined,
      maleNonAmount: party.maleNonAmount !== null && party.maleNonAmount !== undefined ? Number(party.maleNonAmount) : undefined,
      femaleNonAmount: party.femaleNonAmount !== null && party.femaleNonAmount !== undefined ? Number(party.femaleNonAmount) : undefined,

      // 필수 안내사항
      partyAnnouncements: Array.isArray(party.partyAnnouncements)
        ? party.partyAnnouncements
            .map(item => ({
              announcement: (item?.announcement ?? '').trim(),
            }))
            .filter(item => item.announcement !== '')
        : [],

      // 이벤트 소개글(모달)
      partyEvents:
        (party.partyEvents || []).map(e => ({
          eventName: e.eventName,
          eventDescription: e.eventDescription,
          partyEventImageUrls: Array.isArray(e.partyEventImageUrls) ? e.partyEventImageUrls : [],
        })),

      // 상세 안내(페이지)
      detailSchedule: isNonEmpty(party.detailSchedule) ? party.detailSchedule : undefined,
      snackTagList: Array.isArray(party.snackTagList) && party.snackTagList.length ? party.snackTagList : undefined,
      snacks: isNonEmpty(party.snacks) ? party.snacks : undefined,
      extraInfo: isNonEmpty(party.extraInfo) ? party.extraInfo : undefined,

      // 이용 규칙
      rules: Array.isArray(party.rules) && party.rules.length
        ? party.rules.map(rule => ({
            title: rule?.title ?? '',
            content: rule?.content ?? '',
          }))
        : undefined,

      // 오시는 길(페이지)
      meetingPlace: isNonEmpty(party.meetingPlace) ? party.meetingPlace : undefined,
      trafficInfo: isNonEmpty(stringifyInfo(party.trafficInfo))
        ? stringifyInfo(party.trafficInfo)
        : undefined,
      parkingInfo: isNonEmpty(stringifyInfo(party.parkingInfo))
        ? stringifyInfo(party.parkingInfo)
        : undefined,
      parkingTag: Array.isArray(party.parkingTag) && party.parkingTag.length ? party.parkingTag : undefined,
    };

    // undefined/null/빈문자열/빈배열 제거
    const pruned = {};
    Object.entries(base).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (Array.isArray(v) && v.length === 0) return;
      pruned[k] = v;
    });

    return pruned;
  };

  const handleSubmit = async () => {
    if (!isSubmitReady) {
      Toast.show({type: 'error', text1: '필수 항목을 채워주세요.', position: 'top'});
      return;
    }
    const payload = buildPayload();

    try {
      await hostMeetApi.createParty(payload);
      Toast.show({type: 'success', text1: '이벤트가 등록되었습니다!', position: 'top', visibilityTime: 1200});
      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err.message,
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const renderRightIcon = (done) =>
  done ? <CheckOrange width={24} height={24} /> : <ChevronRight width={24} height={24} />;

  const renderSectionRow = ({title, description, required = false, done, onPress}) => (
    <TouchableOpacity
      style={styles.section}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.sectionContent}>
        <View style={styles.sectionTitleRow}>
          <Text
            style={[
              FONTS.fs_16_semibold,
              styles.sectionTitle,
              done ? styles.sectionTitleDone : styles.sectionTitlePending,
            ]}>
            {title}
          </Text>
          {required ? (
            <Text style={[FONTS.fs_12_medium, styles.requiredText]}>*필수</Text>
          ) : null}
        </View>
        {!!description && (
          <Text style={[FONTS.fs_14_medium, styles.sectionDescription]}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.sectionIconWrap}>{renderRightIcon(done)}</View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="파티 등록" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.bodyContainer}>
          {renderSectionRow({
            title: '파티 제목 및 소개',
            description: party.partyTitle || '파티 제목 · 사진 · 태그 입력',
            required: true,
            done: isTitleIntroDone,
            onPress: () => setTitleIntroModalVisible(true),
          })}

          {renderSectionRow({
            title: '기본 정보',
            description: '시간 · 참여 인원 · 숙박 여부',
            required: true,
            done: isBasicDone,
            onPress: () => setBasicModalVisible(true),
          })}

          {renderSectionRow({
            title: '필수 안내사항',
            description: '파티 전 꼭 전달해야 할 내용을 작성해 주세요',
            required: true,
            done: isAnnouncementsDone,
            onPress: () => setAnnouncementsModalVisible(true),
          })}

          {renderSectionRow({
            title: '상세 안내',
            description: '상세 일정 · 음식 제공 여부',
            required: true,
            done: isDetailDone,
            onPress: () => setDetailModalVisible(true),
          })}

          {renderSectionRow({
            title: '소개글',
            description: '사진과 함께 자유롭게 작성해 보세요',
            done: isEventDone,
            onPress: () => setEventModalVisible(true),
          })}

          {renderSectionRow({
            title: '이용 규칙',
            description: '이용 규칙을 작성해주세요',
            done: isRulesDone,
            onPress: () => setRulesModalVisible(true),
          })}

          {renderSectionRow({
            title: '오시는 길',
            description: '집합 장소 · 교통 정보 · 주차 안내',
            done: isWayDone,
            onPress: () => setDirectionsModalVisible(true),
          })}
        </View>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          필수 항목을 입력하셔야 등록이 완료됩니다.
        </Text>

      </ScrollView>

      <View style={styles.bottomContainer}>
        {/* <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>임시저장</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.submitButton, !isSubmitReady && styles.submitButtonDisabled]}
          disabled={!isSubmitReady}
          onPress={handleSubmit}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
              !isSubmitReady && styles.submitTextDisabled,
            ]}>
            등록하기
          </Text>
          {isSubmitReady ? (
            <CheckWhite width={24} height={24} />
          ) : (
            <CheckBlack width={24} height={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* 이벤트 소개글 모달 */}
      <PartyTitleIntroModal
        visible={titleIntroModalVisible}
        shouldResetOnClose={titleIntroModalReset}
        onClose={() => setTitleIntroModalVisible(false)}
        onSelect={onSelectTitleIntro}
        initialPartyTitle={party.partyTitle}
        initialTags={party.tags}
        initialPartyImages={party.partyImages}
      />

      <PartyAnnouncementsModal
        visible={announcementsModalVisible}
        shouldResetOnClose={announcementsModalReset}
        onClose={() => setAnnouncementsModalVisible(false)}
        onSelect={onSelectAnnouncements}
        initialPartyAnnouncements={party.partyAnnouncements}
      />

      <PartyRulesModal
        visible={rulesModalVisible}
        shouldResetOnClose={rulesModalReset}
        onClose={() => setRulesModalVisible(false)}
        onSelect={onSelectRules}
        initialRules={party.rules}
      />

      <PartyBasicsModal
        visible={basicModalVisible}
        shouldResetOnClose={basicModalReset}
        onClose={() => setBasicModalVisible(false)}
        onSelect={onSelectBasic}
        initialValues={{
          guesthouseId: party.guesthouseId,
          partyStartTime: party.partyStartTime,
          partyEndTime: party.partyEndTime,
          minAttendees: party.minAttendees,
          maxAttendees: party.maxAttendees,
          isGuest: party.isGuest,
          amount: party.amount,
          femaleAmount: party.femaleAmount,
          maleNonAmount: party.maleNonAmount,
          femaleNonAmount: party.femaleNonAmount,
        }}
      />

      <PartyDetailInfoModal
        visible={detailModalVisible}
        shouldResetOnClose={detailModalReset}
        onClose={() => setDetailModalVisible(false)}
        onSelect={onSelectDetail}
        initialValues={{
          detailSchedule: party.detailSchedule,
          snackTagList: party.snackTagList,
          snacks: party.snacks,
          extraInfo: party.extraInfo,
        }}
      />

      <PartyDirectionsModal
        visible={directionsModalVisible}
        shouldResetOnClose={directionsModalReset}
        onClose={() => setDirectionsModalVisible(false)}
        onSelect={onSelectWay}
        initialValues={{
          meetingPlace: party.meetingPlace,
          trafficInfo: party.trafficInfo,
          parkingInfo: party.parkingInfo,
          parkingTag: party.parkingTag,
        }}
      />

      <MeetEventModal
        visible={eventModalVisible}
        shouldResetOnClose={eventModalReset}
        onClose={() => setEventModalVisible(false)}
        onSelect={onSelectEvent}
      />
    </View>
  );
};

export default MyMeetAdd;
