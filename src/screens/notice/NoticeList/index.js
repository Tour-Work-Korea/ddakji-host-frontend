import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {notices} from '@data/notices';
import ChevronDownIcon from '@assets/images/chevron_down_black.svg';
import ChevronUpIcon from '@assets/images/chevron_up_black.svg';
import SearchIcon from '@assets/images/search_gray.svg';
import styles from './NoticeList.styles';

const SEARCH_OPTIONS = [
  {label: '제목', value: 'title'},
  {label: '내용', value: 'content'},
];

const NoticeList = () => {
  const navigation = useNavigation();
  const [searchType, setSearchType] = useState('title');
  const [keyword, setKeyword] = useState('');
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);

  const filteredNotices = useMemo(() => {
    const normalizedKeyword = keyword.trim();

    if (!normalizedKeyword) {
      return notices;
    }

    return notices.filter(item => {
      const targetText = searchType === 'content' ? item.content : item.title;
      return targetText.includes(normalizedKeyword);
    });
  }, [keyword, searchType]);

  const selectedOption = SEARCH_OPTIONS.find(item => item.value === searchType);

  const renderNoticeCard = notice => (
    <TouchableOpacity
      key={notice.key}
      style={styles.noticeCard}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('NoticeDetail', {
          noticeKey: notice.key,
        })
      }>
      <View style={styles.noticeCardTop}>
        <View
          style={[
            styles.badge,
            notice.tone === 'blue' ? styles.badgeBlue : styles.badgePink,
          ]}>
          <Text
            style={[
              FONTS.fs_14_semibold,
              notice.tone === 'blue' ? styles.badgeBlueText : styles.badgePinkText,
            ]}>
            {notice.category}
          </Text>
        </View>
      </View>

      <Text style={[FONTS.fs_18_semibold, styles.noticeTitle]}>{notice.title}</Text>
      <Text style={[FONTS.fs_16_medium, styles.dateText]}>{notice.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="게딱지 공지사항" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
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
                    {SEARCH_OPTIONS.map(option => (
                      <Pressable
                        key={option.value}
                        style={styles.optionItem}
                        onPress={() => {
                          setSearchType(option.value);
                          setIsSearchTypeOpen(false);
                        }}>
                        <Text
                          style={[
                            FONTS.fs_14_medium,
                            styles.optionText,
                            option.value === searchType && styles.optionTextActive,
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

        <View style={styles.noticeList}>
          {filteredNotices.length > 0 ? (
            filteredNotices.map(renderNoticeCard)
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
                검색 결과가 없습니다.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NoticeList;
