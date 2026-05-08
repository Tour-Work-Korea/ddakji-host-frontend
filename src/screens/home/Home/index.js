import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import Avatar from '@components/Avatar';
import useUserStore from '@stores/userStore';
import adminApi from '@utils/api/adminApi';
import { updateProfile } from '@utils/auth/login';
import { navigateWithLoginGuard } from '@utils/auth/requireLogin';
import { navigate } from '@utils/navigationService';
import notificationApi from '@utils/api/notificationApi';
import { useFocusEffect } from '@react-navigation/native';

import LogoIcon from '@assets/images/logo_blue.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import MenuIcon from '@assets/images/menu_gray.svg';
import RightArrowIcon from '@assets/images/chevron_right_gray.svg';
import HomeBannerBg from '@assets/images/home/home_banner_bg.png';
import InstaEventImg from '@assets/images/home/insta_event_img.png';

import styles from './HostHome.styles';

const businessInfo = [
  { label: '대표자', value: '이하늘, 정재원' },
  { label: '주소', value: '제주시 연동 263-13 레지던스아트3' },
  { label: '사업자등록번호', value: '888-25-02003' },
  { label: '통신판매번호', value: '2025-서울양천-0825' },
  { label: '연락처', value: '010-4123-0075' },
];

const PROMOTION_FORM_URL =
  'https://forms.gle/cxQYceW29NWomXDJ9';

const formatNoticeDate = value => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

const mapNoticeSummary = item => ({
  id: item?.id,
  key: String(item?.id ?? ''),
  categoryCode: item?.category || '',
  category: item?.categoryLabel || item?.category || '',
  title: item?.title || '',
  date: formatNoticeDate(item?.publishedAt || item?.updatedAt),
  summary: item?.summary || '',
  exposeOnHome: Boolean(item?.exposeOnHome),
  pinned: Boolean(item?.pinned),
});

const HostHome = () => {
  const { width: screenWidth } = useWindowDimensions();
  const heroBackgroundHeight = 436;
  const hostProfile = useUserStore(state => state.hostProfile);
  const [homeNotices, setHomeNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const guesthouseProfiles = hostProfile?.guesthouseProfiles ?? [];
  const hasGuesthouseProfiles = guesthouseProfiles.length > 0;

  useEffect(() => {
    let isMounted = true;

    const fetchHomeNotices = async () => {
      try {
        const { data } = await adminApi.getHomeNotices();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];
        const mappedItems = items.map(mapNoticeSummary).slice(0, 2);

        if (!isMounted) {
          return;
        }

        setHomeNotices(mappedItems);
      } catch (error) {
        console.warn('[HostHome] failed to fetch notices:', error?.message);

        if (isMounted) {
          setHomeNotices([]);
        }
      }
    };

    fetchHomeNotices();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      const count = Number(
        data?.unreadCount ?? data?.count ?? data?.data ?? data ?? 0,
      );
      setUnreadCount(Number.isNaN(count) ? 0 : count);
    } catch (error) {
      console.warn('[HostHome] failed to fetch unread count:', error?.message);
      setUnreadCount(0);
    }
  }, []);

  const syncHostProfile = useCallback(async () => {
    await updateProfile('HOST');
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      syncHostProfile();
    }, [fetchUnreadCount, syncHostProfile]),
  );

  const handlePressPromotionFormLink = async () => {
    try {
      await Linking.openURL(PROMOTION_FORM_URL);
    } catch (error) {
      console.warn('[HostHome] failed to open promotion form url:', error?.message);
    }
  };

  const handlePressNoticeList = () => {
    navigate('NoticeList');
  };

  const handlePressNotificationCenter = () => {
    navigate('NotificationCenter');
  };

  const handlePressNoticeDetail = notice => {
    navigate('NoticeDetail', {
      noticeId: notice?.id,
      noticeKey: notice?.key,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LogoIcon width={60} height={28} />

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.8}
              onPress={handlePressNotificationCenter}>
              <BellIcon width={18} height={18} />
              {unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={[FONTS.fs_12_medium, styles.unreadBadgeText]}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.8}
              onPress={() => navigateWithLoginGuard('마이')}>
              <MenuIcon width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>

        {hasGuesthouseProfiles ? (
          <View style={styles.dashboardSection}>


            <View style={styles.instaEventCard}>
              <View style={styles.instaEventContent}>
                <View style={styles.instaEventTextWrap}>
                  <Text style={[FONTS.fs_16_medium, styles.instaEventTitle]}>
                    제휴 게스트하우스 대상{'\n'}
                    홍보 콘텐츠 제작 지원
                  </Text>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.instaEventDescription,
                    ]}>
                    <Text style={[styles.instaEventAccent, FONTS.fs_14_semibold]}>게딱지 인증</Text>{' '}
                    게스트하우스로{'\n'}
                    더 많은 여행자에게 노출됩니다!
                  </Text>

                  <TouchableOpacity
                    style={styles.instaEventLinkRow}
                    activeOpacity={0.8}
                    onPress={handlePressPromotionFormLink}>
                    <Text style={[FONTS.fs_12_medium, styles.instaEventLink]}>
                      제작 신청하기
                    </Text>
                    <RightArrowIcon width={16} height={16} />
                  </TouchableOpacity>
                </View>

                <View style={styles.instaEventImageWrap}>
                  <Image
                    source={InstaEventImg}
                    resizeMode="contain"
                    style={styles.instaEventImage}
                  />
                </View>
              </View>
            </View>

            <View style={styles.myBusinessSection}>
              <TouchableOpacity
                style={styles.sectionTitleRow}
                activeOpacity={0.8}
                onPress={() => navigateWithLoginGuard('StoreRegisterList')}>
                <Text style={[FONTS.fs_18_bold, styles.sectionTitle]}>
                  내 게하 <Text style={styles.myBusinessCount}>{guesthouseProfiles.length}</Text>
                </Text>
                <RightArrowIcon width={24} height={24} />
              </TouchableOpacity>

              <View style={styles.myBusinessList}>
                {guesthouseProfiles.map((guesthouse, index) => {
                  const isApproved =
                    guesthouse?.applicationStatus === '승인 완료' ||
                    guesthouse?.applicationStatus === 'APPROVED' ||
                    guesthouse?.status === '승인 완료' ||
                    guesthouse?.status === 'APPROVED';

                  const isPending = !isApproved;

                  return (
                    <TouchableOpacity
                      key={String(
                        guesthouse?.guesthouseId ?? guesthouse?.id ?? `guesthouse-${index}`,
                      )}
                      style={styles.myBusinessCard}
                      activeOpacity={isPending ? 1 : 0.85}
                      disabled={isPending}
                      onPress={() =>
                        navigateWithLoginGuard('GuesthouseManagement', {
                          profileKey: String(guesthouse?.guesthouseId ?? guesthouse?.id),
                          guesthouseName: guesthouse?.guesthouseName || '게스트하우스',
                          guesthouseId: guesthouse?.guesthouseId ?? null,
                        })
                      }>
                      <View style={styles.myBusinessCardLeft}>
                        <Avatar
                          uri={guesthouse?.guesthouseProfileImageUrl || guesthouse?.profileImageUrl || null}
                          size={60}
                          borderRadius={10}
                        />
                        <View style={styles.myBusinessName}>
                          <Text
                            style={FONTS.fs_18_semibold}
                            numberOfLines={1}>
                            {guesthouse?.guesthouseName}
                          </Text>
                          {isPending && (
                            <Text style={[FONTS.fs_14_medium, { color: COLORS.semantic_red, marginTop: 4 }]}>
                              등록 심사중
                            </Text>
                          )}
                        </View>
                      </View>

                      {!isPending && (
                        <View style={styles.myBusinessBadge}>
                          <Text style={[FONTS.fs_14_semibold, styles.myBusinessBadgeText]}>
                            운영자
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.heroSection}>
            <Image
              source={HomeBannerBg}
              resizeMode="cover"
              style={[
                styles.heroBackground,
                { width: screenWidth, height: heroBackgroundHeight },
              ]}
            />

            <View style={styles.heroTextWrap}>
              <Text style={[FONTS.fs_20_semibold, styles.heroTitle]}>
                게스트하우스 딱, 지금!
              </Text>
              <Text style={[FONTS.fs_18_medium, styles.heroDescription]}>
                게스트하우스 통합관리를{'\n'}
                게딱지에서 할 수 있어요!
              </Text>

              <TouchableOpacity
                style={styles.registerLink}
                activeOpacity={0.8}
                onPress={() => navigateWithLoginGuard('StoreRegisterList')}>
                <View style={styles.registerLinkTextWrap}>
                  <View style={styles.registerLinkBgLine} />
                  <Text style={[FONTS.fs_18_semibold, styles.registerLinkText]}>
                    입점 신청하기
                  </Text>
                </View>
                <RightArrowIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.noticeSection}>
          <TouchableOpacity
            style={styles.sectionTitleRow}
            activeOpacity={0.8}
            onPress={handlePressNoticeList}>
            <Text style={[FONTS.fs_18_bold, styles.sectionTitle]}>
              공지사항
            </Text>
            <RightArrowIcon width={24} height={24} />
          </TouchableOpacity>

          <View style={styles.noticeList}>
            {homeNotices.map(notice => (
              <TouchableOpacity
                key={notice.key}
                style={styles.noticeCard}
                activeOpacity={0.85}
                onPress={() => handlePressNoticeDetail(notice)}>
                <View
                  style={[
                    styles.noticeBadge,
                    styles.noticeBadgeVariants[notice.categoryCode] ||
                    styles.noticeBadgeBlue,
                  ]}>
                  <Text
                    style={[
                      FONTS.fs_14_semibold,
                      styles.noticeBadgeText,
                      styles.noticeBadgeTextVariants[notice.categoryCode] ||
                      styles.noticeBadgeBlueText,
                    ]}>
                    {notice.category}
                  </Text>
                </View>
                <Text style={[FONTS.fs_14_medium, styles.noticeText]}>
                  {notice.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.businessSection}>
          <Text style={[FONTS.fs_12_medium, styles.businessTitle]}>
            워커웨이 사업자 정보
          </Text>

          <View style={styles.businessList}>
            {businessInfo.map(item => (
              <View key={item.label} style={styles.businessRow}>
                <Text style={[FONTS.fs_12_medium, styles.businessLabel]}>
                  {item.label}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.businessValue]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HostHome;
