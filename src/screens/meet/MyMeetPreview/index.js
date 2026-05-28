import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Carousel from 'react-native-reanimated-carousel';
import MapView, {Marker} from 'react-native-maps';

dayjs.locale('ko');

import {FONTS} from '@constants/fonts';
import styles from './MyMeetPreview.styles';
import Avatar from '@components/Avatar';
import useSwipeTabs from '@hooks/useSwipeTabs';
import MeetDetailInfoModal from '@components/modals/Meet/MeetDetailInfoModal';

import ChevronLeft from '@assets/images/chevron_left_white.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import EmptyIcon from '@assets/images/meet_reservation_success.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';

const TABS = [
  {key: 'intro', label: '콘텐츠 소개'},
  {key: 'detail', label: '상세 안내'},
  {key: 'way', label: '오시는 길'},
];

const SNACK_TAG_LABEL = {
  PARTY_FOOD: '음식 제공',
  PARTY_DRINK: '음료 제공',
  PARTY_SNACK: '간식 제공',
  PARTY_ALCOHOL: '주류 제공',
  PARTY_INDIVIDUAL: '각자 준비',
  PARTY_TOGETHER: '다함께 준비',
  PARTY_NO_SMOKE: '금연',
};

const PARKING_TAG_LABEL = {
  PARTY_PARKING: '주차 가능',
  PARTY_GUESTHOUSE_PARKING: '전용 주차장',
  PARTY_PUBLIC_PARKING: '공용 주차장',
  PARTY_STREET_PARKING: '대로변 주차',
  PARTY_NO_PARKING: '주차 불가',
};

const {width: SCREEN_W} = Dimensions.get('window');
const IMAGE_H = 280;

const toArray = value => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null || value === '') {
    return [];
  }
  return [value];
};

const formatTime = timeStr => {
  if (!timeStr) {
    return '시간 없음';
  }
  const date = dayjs(timeStr);
  return date.isValid() ? date.format('HH:mm') : String(timeStr).slice(0, 5);
};

const normalizeInfoSections = value => {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'string') {
          return {title: '', content: item};
        }
        return {
          title: item?.title ?? item?.subtitle ?? '',
          content: item?.content ?? item?.body ?? '',
        };
      })
      .filter(item => item.title || item.content);
  }

  if (typeof value === 'string' && value.trim()) {
    return [{title: '', content: value.trim()}];
  }

  return [];
};

const MyMeetPreview = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {previewData = {}} = route.params ?? {};
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalType, setInfoModalType] = useState('tag');
  const [infoModalTitle, setInfoModalTitle] = useState('');
  const [infoModalTags, setInfoModalTags] = useState([]);
  const [infoModalContent, setInfoModalContent] = useState('');
  const [infoModalSections, setInfoModalSections] = useState([]);
  const {
    pagerRef,
    isActive,
    onTabPress,
    pageWidth,
    onPagerLayout,
    onMomentumScrollEnd,
  } = useSwipeTabs({
    tabs: TABS,
    initialKey: 'intro',
  });

  const {
    guesthouseName,
    hostProfileImage,
    partyTitle,
    partyTags,
    description,
    events,
    partySchedule,
    snackTags,
    snackInfo,
    rules,
    guesthouseAddress,
    latitude,
    longitude,
    meetingPlace,
    trafficInfo,
    parkingTag,
    parkingPlace,
    partyStartDateTime,
    partyStartTime,
    partyEndTime,
    partyImages,
    profileSummary,
  } = previewData;

  const sortedImages = useMemo(() => {
    return [...toArray(partyImages)]
      .map((img, index) => ({
        id: img?.id ?? `${img?.imageUrl ?? img?.partyImageUrl ?? index}`,
        imageUrl: img?.imageUrl ?? img?.partyImageUrl ?? '',
        isThumbnail: !!img?.isThumbnail,
      }))
      .filter(img => !!img.imageUrl)
      .sort((a, b) =>
        a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1,
      );
  }, [partyImages]);

  const hasImages = sortedImages.length > 0;
  const thumbnailIndex = Math.max(
    sortedImages.findIndex(i => i?.isThumbnail),
    0,
  );

  const tagList = useMemo(() => {
    const tags = Array.isArray(partyTags)
      ? partyTags
      : `${partyTags ?? ''}`.split(/\s+/);

    return tags
      .map(tag => String(tag).trim().replace(/^#+/, ''))
      .filter(Boolean)
      .filter(tag => tag !== '#');
  }, [partyTags]);

  const displayGuesthouseName =
    guesthouseName ?? profileSummary?.guesthouseName ?? '게스트하우스';
  const displayHostImage =
    hostProfileImage ?? profileSummary?.ownerProfileImageUrl;
  const eventList = useMemo(() => toArray(events), [events]);
  const ruleList = useMemo(() => normalizeInfoSections(rules), [rules]);
  const trafficInfoList = useMemo(
    () => normalizeInfoSections(trafficInfo),
    [trafficInfo],
  );
  const parkingPlaceList = useMemo(
    () => normalizeInfoSections(parkingPlace),
    [parkingPlace],
  );

  const scheduleText = useMemo(() => {
    const date = dayjs(partyStartDateTime);
    const dateLabel = date.isValid()
      ? `${date.format('MM.DD')} ${
          date.isSame(dayjs(), 'day') ? '오늘' : date.format('dd')
        }`
      : '오늘';
    return `${dateLabel} ${formatTime(partyStartTime)}~${formatTime(
      partyEndTime,
    )}`;
  }, [partyEndTime, partyStartDateTime, partyStartTime]);

  const snackTagTexts = useMemo(() => {
    return toArray(snackTags)
      .map(tag => SNACK_TAG_LABEL[tag] ?? tag)
      .filter(Boolean);
  }, [snackTags]);

  const parkingTagTexts = useMemo(() => {
    return toArray(parkingTag)
      .map(tag => PARKING_TAG_LABEL[tag] ?? tag)
      .filter(Boolean);
  }, [parkingTag]);

  const openTagModal = (title, tags, content) => {
    setInfoModalTitle(title);
    setInfoModalType('tag');
    setInfoModalTags(tags);
    setInfoModalContent(content);
    setInfoModalSections([]);
    setInfoModalVisible(true);
  };

  const openSectionModal = (title, sections) => {
    setInfoModalTitle(title);
    setInfoModalType('section');
    setInfoModalSections(sections);
    setInfoModalTags([]);
    setInfoModalContent('');
    setInfoModalVisible(true);
  };

  const mapCoordinate = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
    };
  }, [latitude, longitude]);

  const mapRegion = useMemo(() => {
    if (!mapCoordinate) {
      return null;
    }

    return {
      ...mapCoordinate,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    };
  }, [mapCoordinate]);

  const renderLocationMap = () => {
    if (!mapCoordinate || !mapRegion) {
      return null;
    }

    return (
      <View style={styles.locationMapContainer}>
        <MapView
          style={styles.locationMap}
          initialRegion={mapRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}>
          <Marker
            coordinate={mapCoordinate}
            title={meetingPlace || displayGuesthouseName}
            description={guesthouseAddress}
          />
        </MapView>
      </View>
    );
  };

  const renderEmptyInfo = () => (
    <View style={styles.emptyContainer}>
      <Image source={EmptyIcon} style={styles.emptyIcon} />
      <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
        더 궁금하신 점은 업체로 문의해 주세요
      </Text>
    </View>
  );

  const isEmptyWayInfo =
    !meetingPlace &&
    trafficInfoList.length === 0 &&
    parkingPlaceList.length === 0 &&
    parkingTagTexts.length === 0;

  const renderTabContent = tabKey => {
    if (tabKey === 'intro') {
      return (
        <View style={styles.tabContent}>
          {eventList.length === 0
            ? renderEmptyInfo()
            : eventList.map((ev, evIndex) => {
                const images = toArray(ev?.partyEventImageUrls);

                return (
                  <View
                    key={ev?.id ?? `${ev?.eventName ?? 'event'}-${evIndex}`}
                    style={styles.eventBlock}>
                    {images.length > 0 && (
                      <ScrollView
                        horizontal
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.eventImageRow}>
                        {images.map((url, idx) => (
                          <Image
                            key={`${url}-${idx}`}
                            source={{uri: url}}
                            style={styles.eventImageBlog}
                            resizeMode="cover"
                          />
                        ))}
                      </ScrollView>
                    )}
                    <Text style={[FONTS.fs_16_semibold, styles.eventTitle]}>
                      {ev?.eventName}
                    </Text>
                    {!!ev?.eventDescription && (
                      <Text style={[FONTS.fs_14_regular, styles.eventBody]}>
                        {ev.eventDescription}
                      </Text>
                    )}
                  </View>
                );
              })}
        </View>
      );
    }

    if (tabKey === 'detail') {
      return (
        <View style={styles.tabContent}>
          {!!partySchedule && (
            <>
              <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>
                일정
              </Text>
              <View style={styles.infoTextContainer}>
                <Text style={[FONTS.fs_14_regular, styles.infoText]}>
                  {partySchedule}
                </Text>
              </View>
            </>
          )}

          {(snackTagTexts.length > 0 || !!snackInfo) && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                음식 • 음료
              </Text>
              <View style={styles.detailInfoText}>
                <View style={styles.tagWrapper}>
                  <Text
                    style={[FONTS.fs_14_medium, styles.tagText]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {snackTagTexts.map(tag => `#${tag}`).join('  ')}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.detailInfoBtn}
                  onPress={() =>
                    openTagModal(
                      '음식 • 음료',
                      snackTagTexts.map(tag => `#${tag}`),
                      snackInfo,
                    )
                  }>
                  <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                    내용 확인하기
                  </Text>
                  <ChevronRight width={16} height={16} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {ruleList.length > 0 && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                이용규칙
              </Text>
              <View style={styles.detailInfoText}>
                <View style={styles.tagWrapper}>
                  <Text
                    style={[FONTS.fs_14_medium, styles.tagText]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {ruleList.map(rule => rule.title).filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.detailInfoBtn}
                  onPress={() =>
                    openSectionModal(
                      '이용규칙',
                      ruleList.map(rule => ({
                        subtitle: rule.title,
                        body: rule.content,
                      })),
                    )
                  }>
                  <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                    내용 확인하기
                  </Text>
                  <ChevronRight width={16} height={16} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!partySchedule &&
            snackTagTexts.length === 0 &&
            !snackInfo &&
            ruleList.length === 0 &&
            renderEmptyInfo()}
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {isEmptyWayInfo ? (
          <>
            {renderLocationMap()}
            {renderEmptyInfo()}
          </>
        ) : (
          <>
            <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>
              위치
            </Text>
            {!!meetingPlace && (
              <Text style={[FONTS.fs_14_regular, styles.infoText]}>
                만나는 장소 : {meetingPlace}
              </Text>
            )}
            {renderLocationMap()}
            {trafficInfoList.length > 0 && (
              <View style={styles.detailInfoContainer}>
                <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                  교통 정보
                </Text>
                <View style={styles.detailInfoText}>
                  <View style={styles.tagWrapper}>
                    <Text
                      style={[FONTS.fs_14_medium, styles.tagText]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {trafficInfoList
                        .map(item => item.title || item.content)
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.detailInfoBtn}
                    onPress={() =>
                      openSectionModal(
                        '교통 정보',
                        trafficInfoList.map(item => ({
                          subtitle: item.title,
                          body: item.content,
                        })),
                      )
                    }>
                    <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                      내용 확인하기
                    </Text>
                    <ChevronRight width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {(parkingTagTexts.length > 0 || parkingPlaceList.length > 0) && (
              <View style={styles.detailInfoContainer}>
                <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                  주차 정보
                </Text>
                <View style={styles.detailInfoText}>
                  <View style={styles.tagWrapper}>
                    <Text
                      style={[FONTS.fs_14_medium, styles.tagText]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {parkingTagTexts.map(tag => `#${tag}`).join('  ')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.detailInfoBtn}
                    onPress={() =>
                      openTagModal(
                        '주차 정보',
                        parkingTagTexts.map(tag => `#${tag}`),
                        parkingPlaceList
                          .map(item =>
                            [item.title, item.content].filter(Boolean).join('\n'),
                          )
                          .filter(Boolean)
                          .join('\n\n'),
                      )
                    }>
                    <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                      내용 확인하기
                    </Text>
                    <ChevronRight width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {hasImages ? (
            <Carousel
              width={SCREEN_W}
              height={IMAGE_H}
              data={sortedImages}
              defaultIndex={thumbnailIndex}
              loop={false}
              autoPlay={false}
              pagingEnabled
              renderItem={({item}) => (
                <Image
                  source={{uri: item.imageUrl}}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}
            />
          ) : (
            <View style={styles.thumbnail} />
          )}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <ChevronLeft width={28} height={28} />
            </TouchableOpacity>
            {tagList.length > 0 && (
              <View style={styles.heroTagRow}>
                {tagList.map((tag, index) => (
                  <View key={`${tag}-${index}`} style={styles.heroTagChip}>
                    <Text style={[FONTS.fs_12_medium, styles.heroTagText]}>
                      {tag}
                    </Text>
                  </View>
                ))}
                <View style={styles.heroTagChip}>
                  <Text style={[FONTS.fs_12_medium, styles.heroTagText]}>#</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.summaryCard}>
            <Avatar
              uri={displayHostImage}
              size={40}
              iconSize={16}
              style={styles.summaryAvatar}
            />
            <Text style={[FONTS.fs_16_semibold, styles.summaryGuesthouseName]}>
              {displayGuesthouseName}
            </Text>
            <Text
              style={[FONTS.fs_20_semibold, styles.titleText]}
              numberOfLines={2}
              ellipsizeMode="tail">
              {partyTitle || '파티 제목'}
            </Text>
          </View>

          <View style={styles.scheduleBar}>
            <CalendarIcon width={18} height={18} />
            <Text style={[FONTS.fs_14_regular, styles.scheduleText]}>
              {scheduleText}
            </Text>
          </View>

          {!!description && (
            <View style={styles.descriptionContainer}>
              <Text style={[FONTS.fs_14_regular, styles.description]}>
                {description}
              </Text>
            </View>
          )}

          <View style={styles.tabContainer}>
            {TABS.map((tab, index) => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tabButton,
                  isActive(tab.key) && styles.tabButtonActive,
                ]}
                onPress={() => onTabPress(index)}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.tabText,
                    isActive(tab.key) && styles.tabTextActive,
                    isActive(tab.key) && FONTS.fs_14_semibold,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onLayout={onPagerLayout}
            onMomentumScrollEnd={onMomentumScrollEnd}
            style={styles.tabPager}>
            {TABS.map(tab => (
              <View
                key={tab.key}
                style={[styles.tabPage, pageWidth > 0 && {width: pageWidth}]}>
                {renderTabContent(tab.key)}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <MeetDetailInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title={infoModalTitle}
        type={infoModalType}
        tags={infoModalTags}
        content={infoModalContent}
        sections={infoModalSections}
      />
    </View>
  );
};

export default MyMeetPreview;
