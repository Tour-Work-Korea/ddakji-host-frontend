import React, {useMemo} from 'react';
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import Avatar from '@components/Avatar';
import useUserStore from '@stores/userStore';
import {navigateWithLoginGuard} from '@utils/auth/requireLogin';

import LogoIcon from '@assets/images/logo_orange.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import MenuIcon from '@assets/images/menu_gray.svg';
import RightArrowIcon from '@assets/images/chevron_right_gray.svg';
import HomeBannerBg from '@assets/images/home/home_banner_bg.png';
import InstaEventImg from '@assets/images/home/insta_event_img.png';

import styles from './HostHome.styles';

const notices = [
  {
    key: 'operation',
    badge: '운영',
    title: '게딱지 사장님 전용 서비스 오픈안내',
    tone: 'blue',
  },
  {
    key: 'marketing',
    badge: '마케팅',
    title: '게스트하우스 홍보용 인스타 피드 제작 지원',
    tone: 'pink',
  },
];

const businessInfo = [
  {label: '대표자', value: '이하늘, 정재원'},
  {label: '주소', value: '제주시 연동 263-13 레지던스아트3'},
  {label: '사업자등록번호', value: '888-25-02003'},
  {label: '통신판매번호', value: '2025-서울양천-0825'},
  {label: '연락처', value: '010-4123-0075'},
];

const INSTAGRAM_URL =
  'https://www.instagram.com/guesthouse_ddakji?igsh=ZGFmdHVmbDV3eHM0';

const HostHome = () => {
  const {width: screenWidth} = useWindowDimensions();
  const heroBackgroundHeight = 436;
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedProfileId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );

  const selectedGuesthouse = useMemo(() => {
    const guesthouseProfiles = hostProfile?.guesthouseProfiles ?? [];

    return (
      guesthouseProfiles.find(
        item => String(item.guesthouseId) === selectedProfileId,
      ) || guesthouseProfiles[0]
    );
  }, [hostProfile?.guesthouseProfiles, selectedProfileId]);

  const guesthouseProfiles = hostProfile?.guesthouseProfiles ?? [];
  const hasGuesthouseProfiles = guesthouseProfiles.length > 0;
  const guesthouseName = selectedGuesthouse?.guesthouseName || '게딱지';
  const guesthouseImage = selectedGuesthouse?.profileImageUrl || null;

  const handlePressInstagramLink = async () => {
    try {
      await Linking.openURL(INSTAGRAM_URL);
    } catch (error) {
      console.warn('[HostHome] failed to open instagram url:', error?.message);
    }
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
            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
              <BellIcon width={18} height={18} />
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
            <TouchableOpacity
              style={styles.instaEventCard}
              activeOpacity={0.9}
              onPress={() => navigateWithLoginGuard('HostMyPage')}>
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
                    onPress={handlePressInstagramLink}>
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
            </TouchableOpacity>

            <View style={styles.myBusinessSection}>
              <TouchableOpacity
                style={styles.sectionTitleRow}
                activeOpacity={0.8}
                onPress={() => navigateWithLoginGuard('StoreRegisterList')}>
                <Text style={[FONTS.fs_18_bold, styles.sectionTitle]}>
                  내 업체 <Text style={styles.myBusinessCount}>{guesthouseProfiles.length}</Text>
                </Text>
                <RightArrowIcon width={24} height={24} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.myBusinessCard}
                activeOpacity={0.85}
                onPress={() => navigateWithLoginGuard('HostMyPage')}>
                <View style={styles.myBusinessCardLeft}>
                  <Avatar
                    uri={guesthouseImage}
                    size={60}
                    borderRadius={10}
                    iconSize={24}
                  />
                  <Text
                    style={[FONTS.fs_18_semibold, styles.myBusinessName]}
                    numberOfLines={1}>
                    {guesthouseName}
                  </Text>
                </View>

                <View style={styles.myBusinessBadge}>
                  <Text style={[FONTS.fs_14_semibold, styles.myBusinessBadgeText]}>
                    운영자
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.heroSection}>
            <Image
              source={HomeBannerBg}
              resizeMode="cover"
              style={[
                styles.heroBackground,
                {width: screenWidth, height: heroBackgroundHeight},
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
                    게스트하우스 등록하기
                  </Text>
                </View>
                <RightArrowIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.noticeSection}>
          <TouchableOpacity style={styles.sectionTitleRow} activeOpacity={0.8}>
            <Text style={[FONTS.fs_18_bold, styles.sectionTitle]}>
              공지사항
            </Text>
            <RightArrowIcon width={24} height={24} />
          </TouchableOpacity>

          <View style={styles.noticeList}>
            {notices.map(notice => (
              <TouchableOpacity
                key={notice.key}
                style={styles.noticeCard}
                activeOpacity={0.85}>
                <View
                  style={[
                    styles.noticeBadge,
                    notice.tone === 'blue'
                      ? styles.noticeBadgeBlue
                      : styles.noticeBadgePink,
                  ]}>
                  <Text
                    style={[
                      FONTS.fs_14_semibold,
                      notice.tone === 'blue'
                        ? styles.noticeBadgeBlueText
                        : styles.noticeBadgePinkText,
                    ]}>
                    {notice.badge}
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
