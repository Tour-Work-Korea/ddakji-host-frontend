import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import ChevronDownIcon from '@assets/images/chevron_down_gray.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import MenuIcon from '@assets/images/menu_gray.svg';

const tabs = ['게하 정보', '객실 예약', '파티 정보', '파티 예약'];

const StoreRegisterPending = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const businessName = route.params?.businessName || '게스트하우스';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text
            style={[FONTS.fs_20_semibold, styles.topBarTitle]}
            numberOfLines={1}>
            {businessName}
          </Text>
          <ChevronDownIcon width={16} height={16} />
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <BellIcon width={18} height={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MenuIcon width={18} height={18} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab, index) => (
          <View
            key={tab}
            style={[styles.tabItem, index === 0 && styles.tabItemActive]}>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.tabText,
                index === 0 && styles.tabTextActive,
              ]}>
              {tab}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.chipRow}>
        <View style={[styles.chip, styles.chipActive]}>
          <Text style={[FONTS.fs_14_medium, styles.chipTextActive]}>
            나의 게하
          </Text>
        </View>
        <View style={styles.chip}>
          <Text style={[FONTS.fs_14_medium, styles.chipText]}>리뷰 관리</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={[FONTS.fs_20_semibold, styles.emptyTitle]}>
          {`${businessName}에 대한 등록 심사가\n완료 되었습니다.\n게스트하우스 정보를\n작성해보세요!`}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MyGuesthouseAdd')}>
          <Text style={[FONTS.fs_14_medium, styles.primaryButtonText]}>
            게스트하우스 정보 작성
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  topBarTitle: {
    color: COLORS.grayscale_800,
    marginRight: 4,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary_orange,
  },
  tabText: {
    color: COLORS.grayscale_500,
  },
  tabTextActive: {
    color: COLORS.primary_orange,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.grayscale_100,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary_orange,
  },
  chipText: {
    color: COLORS.grayscale_700,
  },
  chipTextActive: {
    color: COLORS.grayscale_0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 120,
  },
  emptyTitle: {
    color: COLORS.grayscale_700,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 40,
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: COLORS.grayscale_0,
  },
  primaryButtonText: {
    color: COLORS.grayscale_700,
  },
});

export default StoreRegisterPending;
