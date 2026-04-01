import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Avatar from '@components/Avatar';
import AlertModal from '@components/modals/AlertModal';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import authApi from '@utils/api/authApi';
import {tryLogout} from '@utils/auth/login';

import LogoIcon from '@assets/images/logo_orange.svg';
import CloseIcon from '@assets/images/x_gray.svg';
import GuesthouseIcon from '@assets/images/menu_guesthouse.svg';
import MemberIcon from '@assets/images/menu_authority.svg';
import NoticeIcon from '@assets/images/menu_notice.svg';
import ContractIcon from '@assets/images/menu_contract.svg';
import AlarmIcon from '@assets/images/menu_alarm.svg';
import PolicyIcon from '@assets/images/menu_policy.svg';
import VersionIcon from '@assets/images/menu_version.svg';
import RightArrowIcon from '@assets/images/chevron_right_gray.svg';

import styles from './HostHomeMenu.styles';

const menuSections = [
  {
    key: 'guesthouse',
    label: '내 게스트하우스',
    icon: GuesthouseIcon,
    routeName: 'StoreRegisterList',
  },
  {
    key: 'authority',
    label: '권한관리',
    icon: MemberIcon,
  },
  {
    key: 'notice',
    label: '공지사항',
    icon: NoticeIcon,
    routeName: 'NoticeList',
  },
  {
    key: 'contract',
    label: '계약서 및 개인정보 동의 현황',
    icon: ContractIcon,
    routeName: 'StoreRegisterList',
  },
  {
    key: 'alarm',
    label: '알림 설정',
    icon: AlarmIcon,
    routeName: 'CustomerNotificationSettings',
  },
  {
    key: 'policy',
    label: '등록 기준/ 정책',
    icon: PolicyIcon,
    routeName: 'Terms',
  },
  {
    key: 'version',
    label: '버전 정보  2.0',
    icon: VersionIcon,
  },
];

const HostHomeMenu = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedProfileId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );

  const selectedGuesthouse = useMemo(
    () => {
      const guesthouseProfiles = hostProfile?.guesthouseProfiles ?? [];

      return (
      guesthouseProfiles.find(
        item => String(item.guesthouseId) === selectedProfileId,
      ) || guesthouseProfiles[0]
      );
    },
    [hostProfile?.guesthouseProfiles, selectedProfileId],
  );

  const profileName = hostProfile?.name || '';
  const profileEmail = hostProfile?.email || '';
  const profileImage =
    selectedGuesthouse?.profileImageUrl || hostProfile?.photoUrl || null;

  const handleMenuPress = routeName => {
    if (routeName) {
      navigation.navigate(routeName);
    }
  };

  const handleLogout = async () => {
    await tryLogout();
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const handleWithdrawal = async () => {
    if (isWithdrawing) {
      return;
    }

    setIsWithdrawing(true);
    setModalVisible(false);

    try {
      await authApi.withdrawal();
      await tryLogout();
    } catch (error) {
      console.warn('[HostHomeMenu] withdrawal failed:', error?.message);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
      setIsWithdrawing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.topRow}>
          <LogoIcon width={60} height={30} />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            style={styles.closeButton}>
            <CloseIcon width={28} height={28} />
          </TouchableOpacity>
        </View>

        {/* 프로필 */}
        <View style={styles.profileSection}>
          <Avatar uri={profileImage} size={52} iconSize={52} />
          <View style={styles.profileTextWrap}>
            <Text style={[FONTS.fs_18_semibold, styles.profileName]}>
              {profileName}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.profileEmail]}>
              {profileEmail}
            </Text>
          </View>
        </View>

        {/* 등록, 이용방법 */}
        <View style={styles.topActionRow}>
          <TouchableOpacity
            style={styles.topActionButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('StoreRegisterList')}>
            <Text style={[FONTS.fs_14_medium, styles.topActionText]}>
              게스트하우스 등록
            </Text>
          </TouchableOpacity>
          <View style={styles.topActionDivide}/>
          <TouchableOpacity style={styles.topActionButton} activeOpacity={0.85}>
            <Text style={[FONTS.fs_14_medium, styles.topActionText]}>
              이용방법 안내
            </Text>
          </TouchableOpacity>
        </View>

        {/* 메뉴 */}
        <View style={styles.menuList}>
          {menuSections.map((item, index) => {
            const Icon = item.icon;
            const isNavigable = Boolean(item.routeName);
            const isLastItem = index === menuSections.length - 1;

            return (
              <Pressable
                key={item.key}
                style={[styles.menuItem, isLastItem && styles.menuItemLast]}
                onPress={() => handleMenuPress(item.routeName)}>
                <View style={styles.menuLeft}>
                  <View style={styles.iconWrap}>
                    <Icon width={22} height={22} />
                  </View>
                  <Text
                    style={[
                      FONTS.fs_16_medium,
                      styles.menuLabel,
                      !isNavigable && styles.menuLabelMuted,
                    ]}>
                    {item.label}
                  </Text>
                </View>
                <RightArrowIcon width={24} height={24} />
              </Pressable>
            );
          })}
        </View>

        {/* 로그아웃, 탈퇴 */}
        <View style={styles.footerActions}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleLogout}>
            <Text style={[FONTS.fs_12_medium, styles.footerActionText]}>
              로그아웃
            </Text>
          </TouchableOpacity>
          <Text style={[FONTS.fs_14_medium, styles.footerDivider]}>|</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}>
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.footerActionText,
                styles.footerActionTextPlain,
              ]}>
              WA 회원 탈퇴
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AlertModal
        visible={modalVisible}
        title={'정말 탈퇴하시겠어요?'}
        buttonText={'취소'}
        buttonText2={'탈퇴하기'}
        onPress={() => setModalVisible(false)}
        onPress2={handleWithdrawal}
      />
    </View>
  );
};

export default HostHomeMenu;
