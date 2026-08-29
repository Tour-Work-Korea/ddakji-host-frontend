import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './MyMeetAdd.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import {
  addLocalDateEvent,
  getLocalDateEvents,
  updateLocalDateEvent,
} from '@utils/localDateEventStorage';

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
  const templateId = Number(route.params?.templateId);
  const localEventId = route.params?.localEventId;
  const reuseLocalEventId = route.params?.reuseLocalEventId;
  const isServerEditMode = Number.isFinite(templateId) && templateId > 0;
  const isLocalEditMode = Boolean(localEventId);
  const isReuseMode = Boolean(reuseLocalEventId);
  const isEditMode = isServerEditMode || isLocalEditMode;
  const scheduleType =
    route.params?.scheduleType ??
    (isLocalEditMode || isReuseMode ? 'DATE_EVENT' : 'DAILY');
  const isDateEvent = scheduleType === 'DATE_EVENT';
  const routeGuesthouseId = Number(route.params?.guesthouseId);
  const initialGuesthouseId = Number.isFinite(routeGuesthouseId) && routeGuesthouseId > 0
    ? routeGuesthouseId
    : null;
  const [loading, setLoading] = useState(isEditMode || isReuseMode);

  const [party, setParty] = useState({
    // 파티 제목 및 소개
    partyTitle: '',
    tags: '',
    partyImages: [],
    contentType: 'POTLUCK',

    // 기본 정보
    guesthouseId: initialGuesthouseId,
    eventDate: null,
    partyStartTime: '19:00:00',
    partyEndTime: '22:00:00',
    applicationType: 'SAME_DAY',
    minAttendees: null,
    maxAttendees: null,
    isGuest: false,
    chargeType: 'FREE',
    amount: null,
    priceOptions: [],
    femaleAmount: null,
    maleNonAmount: null,
    femaleNonAmount: null,

    // 필수 안내사항
    partyAnnouncements: [], // [{ announcement }]

    // 이벤트 소개글(모달)
    partyEvents: [], // [{ eventName, eventDescription, partyEventImageUrls:[] }]

    // 상세 안내(페이지)
    detailSchedule: '',
    snackTagList: [], // ["PARTY_FOOD", ...]
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
      return { ...img, isThumbnail: false };
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

  useEffect(() => {
    if (!isEditMode && !isReuseMode) return;

    let isMounted = true;

    const normalizePartyImages = images => {
      if (!Array.isArray(images)) return [];

      return enforceSingleThumbnail(
        stripDuplicatesByUrl(
          images
            .map((item, index) => ({item, index}))
            .sort((a, b) => {
              const aOrder = Number(a.item?.displayOrder);
              const bOrder = Number(b.item?.displayOrder);
              const normalizedA = Number.isFinite(aOrder) ? aOrder : a.index;
              const normalizedB = Number.isFinite(bOrder) ? bOrder : b.index;
              return normalizedA - normalizedB;
            })
            .map(({item}, index) => ({
              imageUrl: item?.imageUrl ?? item?.partyImageUrl ?? '',
              isThumbnail: !!item?.isThumbnail,
              displayOrder: index,
            }))
            .filter(item => item.imageUrl),
        ),
      );
    };

    const fetchTemplateDetail = async () => {
      try {
        setLoading(true);
        const sourceLocalEventId = localEventId ?? reuseLocalEventId;
        const data = isLocalEditMode || isReuseMode
          ? (
              await getLocalDateEvents(initialGuesthouseId)
            ).find(
              event =>
                String(event.localEventId) === String(sourceLocalEventId),
            )
          : (await hostMeetApi.getPartyTemplateDetail(templateId)).data;

        if (!data) {
          throw new Error('테스트 이벤트 정보를 찾을 수 없어요.');
        }

        if (!isMounted) return;

        const normalizedPriceOptions = Array.isArray(data?.priceOptions)
          ? data.priceOptions
            .map((option, index) => ({
              ...(option?.id != null ? {id: option.id} : {}),
              optionName: option?.optionName ?? '',
              amount: option?.amount ?? '',
              displayOrder: Number.isFinite(Number(option?.displayOrder))
                ? Number(option.displayOrder)
                : index,
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((option, index) => ({...option, displayOrder: index}))
          : [];

        if (
          normalizedPriceOptions.length === 0 &&
          (data?.chargeType === 'PAID' || Number(data?.amount) > 0)
        ) {
          normalizedPriceOptions.push({
            optionName: '기본 참가비',
            amount: data?.amount ?? '',
            displayOrder: 0,
          });
        }

        setParty(prev => ({
          ...prev,
          partyTitle: data?.partyTitle ?? '',
          tags: data?.partyTags ?? data?.tags ?? '',
          partyImages: normalizePartyImages(data?.partyImages),
          contentType: [
            'POTLUCK',
            'DINNER_PARTY',
            'BOOK',
            'WALK',
            'PROGRAM',
          ].includes(data?.contentType)
            ? data.contentType
            : prev.contentType,
          guesthouseId:
            Number(data?.guesthouseId) > 0
              ? Number(data.guesthouseId)
              : prev.guesthouseId,
          eventDate:
            isReuseMode
              ? null
              : data?.partyStartDateTime?.split?.('T')?.[0] ??
                data?.eventDate ??
                prev.eventDate,
          partyStartTime: data?.partyStartTime ?? prev.partyStartTime,
          partyEndTime: data?.partyEndTime ?? prev.partyEndTime,
          applicationType: ['SAME_DAY', 'ADVANCE'].includes(
            data?.applicationType,
          )
            ? data.applicationType
            : prev.applicationType,
          minAttendees: data?.minAttendees ?? data?.minAttendance ?? prev.minAttendees,
          maxAttendees: data?.maxAttendees ?? data?.maxAttendance ?? prev.maxAttendees,
          isGuest: data?.isGuest ?? prev.isGuest,
          chargeType:
            data?.chargeType ??
            (Number(data?.amount) > 0 || normalizedPriceOptions.length > 0
              ? 'PAID'
              : 'FREE'),
          amount:
            data?.amount ?? normalizedPriceOptions[0]?.amount ?? prev.amount,
          priceOptions: normalizedPriceOptions,
          femaleAmount: data?.femaleAmount ?? prev.femaleAmount,
          maleNonAmount: data?.maleNonAmount ?? prev.maleNonAmount,
          femaleNonAmount: data?.femaleNonAmount ?? prev.femaleNonAmount,
          partyAnnouncements: Array.isArray(data?.partyAnnouncements)
            ? data.partyAnnouncements.map(item => ({
              announcement: item?.announcement ?? '',
            }))
            : [],
          partyEvents: Array.isArray(data?.partyEvents)
            ? data.partyEvents.map(item => ({
              eventName: item?.eventName ?? '',
              eventDescription: item?.eventDescription ?? '',
              partyEventImageUrls: Array.isArray(item?.partyEventImageUrls)
                ? item.partyEventImageUrls
                : [],
            }))
            : Array.isArray(data?.events)
              ? data.events.map(item => ({
                eventName: item?.eventName ?? item?.title ?? '',
                eventDescription:
                  item?.eventDescription ?? item?.description ?? '',
                partyEventImageUrls: Array.isArray(item?.partyEventImageUrls)
                  ? item.partyEventImageUrls
                  : Array.isArray(item?.imageUrls)
                    ? item.imageUrls
                    : [],
              }))
              : [],
          detailSchedule: data?.detailSchedule ?? data?.partySchedule ?? '',
          snackTagList: (
            Array.isArray(data?.snackTagList)
              ? data.snackTagList
              : Array.isArray(data?.snackTags)
                ? data.snackTags
                : []
          )
            .map(tag =>
              typeof tag === 'string'
                ? tag
                : tag?.key ?? tag?.name ?? tag?.value ?? '',
            )
            .filter(Boolean),
          snacks: data?.snacks ?? data?.snackInfo ?? '',
          extraInfo: data?.extraInfo ?? '',
          rules: Array.isArray(data?.rules)
            ? data.rules.map(rule => ({
              title: rule?.title ?? '',
              content: rule?.content ?? '',
            }))
            : [],
          meetingPlace: data?.meetingPlace ?? '',
          trafficInfo: data?.trafficInfo ?? '',
          parkingInfo: data?.parkingInfo ?? '',
          parkingTag: Array.isArray(data?.parkingTag) ? data.parkingTag : [],
        }));
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: err?.response?.data?.message || err.message,
          position: 'top',
          visibilityTime: 2000,
        });
        navigation.goBack();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTemplateDetail();

    return () => {
      isMounted = false;
    };
  }, [
    initialGuesthouseId,
    isEditMode,
    isLocalEditMode,
    isReuseMode,
    localEventId,
    navigation,
    reuseLocalEventId,
    templateId,
  ]);

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
        // Keep local state key stable while accepting API's partyTags field on read/write.
        tags: payload.tags ?? prev.tags,
        partyImages: nextImages,
        contentType: payload.contentType ?? prev.contentType,
      };
    });
    setTitleIntroModalReset(false);
    setTitleIntroModalVisible(false);
  };

  // 기본 정보 페이지에서 돌아올 때
  // payload 예시:
  // {
  //   guesthouseId, partyStartTime, partyEndTime, applicationType,
  //   minAttendees, maxAttendees, isGuest, chargeType, amount,
  //   femaleAmount, maleNonAmount, femaleNonAmount
  // }
  const onSelectBasic = payload => {
    if (!payload) return;

    setParty(prev => {
      return {
        ...prev,
        guesthouseId: payload.guesthouseId ?? prev.guesthouseId,
        eventDate: payload.eventDate ?? prev.eventDate,
        partyStartTime: payload.partyStartTime ?? prev.partyStartTime,
        partyEndTime: payload.partyEndTime ?? prev.partyEndTime,
        applicationType: payload.applicationType ?? prev.applicationType,
        minAttendees: payload.minAttendees ?? prev.minAttendees,
        maxAttendees: payload.maxAttendees ?? prev.maxAttendees,
        isGuest: payload.isGuest ?? prev.isGuest,
        chargeType: payload.chargeType ?? prev.chargeType,
        amount: payload.amount ?? prev.amount,
        priceOptions: Array.isArray(payload.priceOptions)
          ? payload.priceOptions
          : prev.priceOptions,
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
  const onSelectEvent = ({ partyEvents }) => {
    const normalized = Array.isArray(partyEvents)
      ? partyEvents
        .map(e => {
          if (typeof e === 'string') {
            return { eventName: e, eventDescription: '', partyEventImageUrls: [] };
          }
          return {
            eventName: e?.eventName ?? '',
            eventDescription: e?.eventDescription ?? '',
            partyEventImageUrls: Array.isArray(e?.partyEventImageUrls) ? e.partyEventImageUrls : [],
          };
        })
        .filter(e => e.eventName.trim() !== '')
      : [];
    setParty(p => ({ ...p, partyEvents: normalized }));
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
    exactlyOneThumbnail(party.partyImages) &&
    ['POTLUCK', 'DINNER_PARTY', 'BOOK', 'WALK', 'PROGRAM'].includes(
      party.contentType,
    );
  const isBasicDone =
    Number(party.guesthouseId) > 0 &&
    (!isDateEvent || isNonEmpty(party.eventDate)) &&
    isNonEmpty(party.partyStartTime) &&
    isNonEmpty(party.partyEndTime) &&
    ['SAME_DAY', 'ADVANCE'].includes(party.applicationType) &&
    Number(party.minAttendees) > 0 &&
    Number(party.maxAttendees) >= Number(party.minAttendees) &&
    ['FREE', 'PAID'].includes(party.chargeType) &&
    (party.chargeType === 'FREE' || (
      Array.isArray(party.priceOptions) &&
      party.priceOptions.length > 0 &&
      party.priceOptions.every(option =>
        isNonEmpty(option?.optionName) && Number(option?.amount) > 0,
      ) &&
      new Set(party.priceOptions.map(option => option.optionName.trim())).size ===
        party.priceOptions.length
    ));
  const isAnnouncementsDone =
    Array.isArray(party.partyAnnouncements) && party.partyAnnouncements.length > 0;
  const isEventDone = Array.isArray(party.partyEvents) && party.partyEvents.length > 0;
  const isDetailDone = isNonEmpty(party.detailSchedule);
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
      partyImages: (party.partyImages || []).map((img, index) => ({
        imageUrl: img.imageUrl,
        isThumbnail: !!img.isThumbnail,
        displayOrder: index,
      })),
      partyTags: isNonEmpty(party.tags) ? String(party.tags).trim() : undefined,
      contentType: party.contentType,

      // 기본 정보
      guesthouseId: Number(party.guesthouseId),
      scheduleType: isDateEvent ? scheduleType : undefined,
      partyStartDateTime: isDateEvent ? party.eventDate : undefined,
      isApplyOpen: isDateEvent ? true : undefined,
      partyStartTime: party.partyStartTime,
      partyEndTime: party.partyEndTime,
      applicationType: party.applicationType,
      minAttendees: Number(party.minAttendees),
      maxAttendees: Number(party.maxAttendees),
      isGuest: !!party.isGuest,
      chargeType: party.chargeType,
      amount: party.chargeType === 'FREE' ? 0 : Number(party.amount),
      priceOptions: party.chargeType === 'PAID'
        ? party.priceOptions.map((option, index) => ({
          optionName: option.optionName.trim(),
          amount: Number(option.amount),
          displayOrder: index,
        }))
        : undefined,
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
      snackTagList: Array.isArray(party.snackTagList)
        ? party.snackTagList
        : [],
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
      if (Array.isArray(v) && v.length === 0 && k !== 'snackTagList') return;
      pruned[k] = v;
    });

    return pruned;
  };

  const buildPreviewData = () => ({
    guesthouseName: '게스트하우스',
    partyTitle: party.partyTitle,
    partyTags: party.tags,
    description: party.description ?? '',
    partyImages: (party.partyImages || []).map((img, index) => ({
      imageUrl: img.imageUrl,
      isThumbnail: !!img.isThumbnail,
      displayOrder: index,
    })),
    events: (party.partyEvents || []).map(event => ({
      eventName: event?.eventName ?? '',
      eventDescription: event?.eventDescription ?? '',
      partyEventImageUrls: Array.isArray(event?.partyEventImageUrls)
        ? event.partyEventImageUrls
        : [],
    })),
    partySchedule: party.detailSchedule,
    snackTags: party.snackTagList,
    snackInfo: party.snacks || party.extraInfo,
    rules: party.rules,
    partyStartDateTime:
      isDateEvent && party.eventDate
        ? party.eventDate
        : dayjs().format('YYYY-MM-DD'),
    partyStartTime: party.partyStartTime,
    partyEndTime: party.partyEndTime,
    meetingPlace: party.meetingPlace,
    trafficInfo: party.trafficInfo,
    parkingTag: party.parkingTag,
    parkingPlace: party.parkingInfo,
  });

  const handlePreview = () => {
    navigation.navigate('MyMeetPreview', {
      previewData: buildPreviewData(),
    });
  };

  const handleSubmit = async () => {
    if (!isSubmitReady) {
      Toast.show({
        type: 'error',
        text1: `필수 항목을 채워주시면 ${isEditMode ? '수정' : '등록'}할 수 있어요.`,
        position: 'top',
      });
      return;
    }
    const payload = buildPayload();

    try {
      if (isLocalEditMode) {
        await updateLocalDateEvent(
          party.guesthouseId,
          localEventId,
          payload,
        );
      } else if (isDateEvent && __DEV__) {
        await addLocalDateEvent(party.guesthouseId, payload);
      } else if (isServerEditMode) {
        await hostMeetApi.updateParty(templateId, payload);
      } else {
        await hostMeetApi.createParty(payload);
      }
      Toast.show({
        type: 'success',
        text1: `콘텐츠가 ${isEditMode ? '수정' : '등록'}되었습니다!`,
        position: 'top',
        visibilityTime: 1200,
      });
      if (!isEditMode && !isReuseMode && navigation.canGoBack()) {
        navigation.pop(2);
      } else {
        navigation.goBack();
      }
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

  const renderSectionRow = ({ title, description, required = false, done, onPress }) => (
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={isEditMode ? '콘텐츠 수정' : '콘텐츠 등록'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6A13" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={isEditMode ? '콘텐츠 수정' : '콘텐츠 등록'} />

      <View style={styles.scrollContent}>
        <View style={styles.bodyContainer}>
          {renderSectionRow({
            title: '콘텐츠 제목 및 소개',
            description: '',
            required: true,
            done: isTitleIntroDone,
            onPress: () => setTitleIntroModalVisible(true),
          })}

          {renderSectionRow({
            title: '기본 정보',
            description: isDateEvent
              ? '날짜 · 시간 · 참여 인원 등'
              : '시간 · 참여 인원 등',
            required: true,
            done: isBasicDone,
            onPress: () => setBasicModalVisible(true),
          })}

          {renderSectionRow({
            title: '필수 안내사항',
            description: '',
            required: true,
            done: isAnnouncementsDone,
            onPress: () => setAnnouncementsModalVisible(true),
          })}

          {renderSectionRow({
            title: '상세 안내',
            description: '상세 일정 · 음식/음료 정보(선택)',
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

      </View>

      <View style={styles.bottomContainer}>
        {/* <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>임시저장</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.previewButton}
          activeOpacity={0.8}
          onPress={handlePreview}>
          <Text style={[FONTS.fs_14_medium, styles.previewButtonText]}>
            미리보기
          </Text>
        </TouchableOpacity>
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
            {isEditMode ? '수정하기' : '등록하기'}
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
        initialContentType={party.contentType}
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
        showEventDate={isDateEvent}
        showApplicationPeriod={!isDateEvent}
        shouldResetOnClose={basicModalReset}
        onClose={() => setBasicModalVisible(false)}
        onSelect={onSelectBasic}
        initialValues={{
          guesthouseId: party.guesthouseId,
          eventDate: party.eventDate,
          partyStartTime: party.partyStartTime,
          partyEndTime: party.partyEndTime,
          applicationType: party.applicationType,
          minAttendees: party.minAttendees,
          maxAttendees: party.maxAttendees,
          isGuest: party.isGuest,
          chargeType: party.chargeType,
          amount: party.amount,
          priceOptions: party.priceOptions,
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
        initialEvents={party.partyEvents}
      />
    </View>
  );
};

export default MyMeetAdd;
