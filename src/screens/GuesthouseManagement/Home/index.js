import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import adminApi from '@utils/api/adminApi';
import styles from './Home.styles';

import ChevronRightIcon from '@assets/images/chevron_right_gray.svg';

const reservationSummary = [
  {label: '확정 대기', value: '0'},
  {label: '오늘 확정', value: '0'},
  {label: '오늘 이용', value: '0'},
  {label: '오늘 취소', value: '0'},
];

const mapNoticeSummary = item => ({
  id: item?.id,
  key: String(item?.id ?? ''),
  categoryCode: item?.category || '',
  category: item?.categoryLabel || item?.category || '',
  title: item?.title || '',
  publishedAt: item?.publishedAt || item?.updatedAt || '',
});

const Home = () => {
  const navigation = useNavigation();
  const [latestNotice, setLatestNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestNotice = async () => {
      try {
        const {data} = await adminApi.getHomeNotices();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];

        const latestItem = items
          .map(mapNoticeSummary)
          .sort((a, b) => {
            const aTime = new Date(a.publishedAt).getTime();
            const bTime = new Date(b.publishedAt).getTime();

            return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
          })[0] || null;

        if (!isMounted) {
          return;
        }

        setLatestNotice(latestItem);
      } catch (error) {
        console.warn(
          '[GuesthouseManagementHome] failed to fetch latest notice:',
          error?.message,
        );

        if (isMounted) {
          setLatestNotice(null);
        }
      }
    };

    fetchLatestNotice();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={[FONTS.fs_16_semibold, styles.cardTitle]}>예약 마감</Text>
        <Text style={[FONTS.fs_14_medium, styles.cardDescription]}>
          예약을 받지 않으며,
        </Text>
        <Text style={[FONTS.fs_14_medium, styles.cardDescription]}>
          게스트에게 예약 버튼이 보이지 않아요
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReservationMethodSettings')}>
          <Text style={[FONTS.fs_12_medium, styles.actionButtonText]}>
            설정 변경하기
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.noticeRow}
        onPress={() => navigation.navigate('NoticeList')}>
        <View
          style={[
            styles.noticeBadge,
            styles.noticeBadgeVariants[latestNotice?.categoryCode] ||
              styles.noticeBadgeBlue,
          ]}>
          <Text
            style={[
              FONTS.fs_14_semibold,
              styles.noticeBadgeText,
              styles.noticeBadgeTextVariants[latestNotice?.categoryCode] ||
                styles.noticeBadgeBlueText,
            ]}>
            {latestNotice?.category || '운영'}
          </Text>
        </View>
        <Text style={[FONTS.fs_14_medium, styles.noticeText]}>
          {latestNotice?.title || '공지사항이 없습니다.'}
        </Text>
        <ChevronRightIcon width={16} height={16} />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={[FONTS.fs_18_semibold, styles.cardTitle]}>예약 현황</Text>

        <View style={styles.summaryRow}>
          {reservationSummary.map(item => (
            <View key={item.label} style={styles.summaryItem}>
              <Text style={[FONTS.fs_22_bold, styles.summaryValue]}>
                {item.value}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.summaryLabel]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;
