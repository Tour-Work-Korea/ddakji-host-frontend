import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Header from '@components/Header';
import IosNoticeBannerAd from '@components/ads/IosNoticeBannerAd';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import adminApi from '@utils/api/adminApi';
import ChevronDownIcon from '@assets/images/chevron_down_black.svg';
import SearchIcon from '@assets/images/search_gray.svg';
import styles from './NoticeList.styles';

const CATEGORY_OPTIONS = [
  {label: '전체', value: ''},
  {label: '운영', value: 'OPERATIONS'},
  {label: '마케팅', value: 'MARKETING'},
  {label: '정책', value: 'POLICY'},
  {label: '이벤트', value: 'EVENT'},
];

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
});

const NoticeList = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
  const [noticeList, setNoticeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const fetchNotices = async ({
    nextPage = 0,
    reset = false,
    searchKeyword = '',
    category = '',
  }) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const {data} = await adminApi.getAdminNotices({
        category: category || undefined,
        q: searchKeyword || undefined,
        page: nextPage,
      });

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];
      const mappedItems = items.map(mapNoticeSummary);

      setNoticeList(prev => (reset ? mappedItems : [...prev, ...mappedItems]));
      setPage(typeof data?.page === 'number' ? data.page : nextPage);
      setHasNext(Boolean(data?.hasNext));
    } catch (error) {
      console.warn('[NoticeList] failed to fetch notices:', error?.message);

      if (reset) {
        setNoticeList([]);
        setPage(0);
        setHasNext(false);
      }
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    const normalizedKeyword = keyword.trim();
    const timeoutId = setTimeout(() => {
      fetchNotices({
        nextPage: 0,
        reset: true,
        searchKeyword: normalizedKeyword,
        category: selectedCategory,
      });
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [keyword, selectedCategory]);

  const selectedOption = CATEGORY_OPTIONS.find(
    item => item.value === selectedCategory,
  );

  const handleEndReached = () => {
    if (loading || loadingMore || !hasNext) {
      return;
    }

    fetchNotices({
      nextPage: page + 1,
      reset: false,
      searchKeyword: keyword.trim(),
      category: selectedCategory,
    });
  };

  const renderNoticeCard = ({item: notice}) => (
    <TouchableOpacity
      style={styles.noticeCard}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('NoticeDetail', {
          noticeId: notice.id,
          noticeKey: notice.key,
        })
      }>
      <View style={styles.noticeCardTop}>
        <View
          style={[
            styles.badge,
            styles.badgeVariants[notice.categoryCode] || styles.badgeBlue,
          ]}>
          <Text
            style={[
              FONTS.fs_14_semibold,
              styles.badgeText,
              styles.badgeTextVariants[notice.categoryCode] || styles.badgeBlueText,
            ]}>
            {notice.category}
          </Text>
        </View>
      </View>

      <Text style={[FONTS.fs_18_semibold, styles.noticeTitle]}>{notice.title}</Text>
      <Text style={[FONTS.fs_16_medium, styles.dateText]}>{notice.date}</Text>
    </TouchableOpacity>
  );

  const renderSearchBar = () => (
    <View style={styles.searchRow}>
      <View style={styles.searchBox}>
        <View style={styles.searchFieldRow}>
          <View style={styles.searchTypeWrap}>
            <Pressable
              style={styles.searchTypeButton}
              onPress={() => setIsSearchTypeOpen(prev => !prev)}>
              <Text style={[FONTS.fs_16_regular, styles.searchTypeText]}>
                {selectedOption?.label}
              </Text>
              <ChevronDownIcon width={12} height={12} />
            </Pressable>

            {isSearchTypeOpen ? (
              <View style={styles.optionMenu}>
                {CATEGORY_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    style={styles.optionItem}
                    onPress={() => {
                      setSelectedCategory(option.value);
                      setIsSearchTypeOpen(false);
                    }}>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.optionText,
                        option.value === selectedCategory &&
                          styles.optionTextActive,
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <TextInput
            style={[FONTS.fs_14_medium, styles.searchInput]}
            value={keyword}
            onChangeText={setKeyword}
            placeholder="입력 후 검색하세요"
            placeholderTextColor={COLORS.grayscale_400}
          />

          <View style={styles.searchIconWrap}>
            <SearchIcon width={20} height={20} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="small" color={COLORS.grayscale_500} />
        </View>
      );
    }

    return (
      <View style={styles.emptyWrap}>
        <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
          검색 결과가 없습니다.
        </Text>
      </View>
    );
  };

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.grayscale_500} />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <Header title="게딱지 공지사항" />

      {renderSearchBar()}

      <FlatList
        data={noticeList}
        keyExtractor={item => item.key}
        renderItem={renderNoticeCard}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.listContentContainer,
          Platform.OS === 'ios' && {paddingBottom: insets.bottom + 84},
        ]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {Platform.OS === 'ios' ? (
        <View style={styles.fixedAdContainer}>
          <IosNoticeBannerAd />
        </View>
      ) : null}
    </View>
  );
};

export default NoticeList;
