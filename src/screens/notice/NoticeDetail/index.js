import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {findNoticeByKey} from '@data/notices';
import styles from './NoticeDetail.styles';

const NoticeDetail = () => {
  const route = useRoute();
  const noticeKey = route.params?.noticeKey;
  const notice = findNoticeByKey(noticeKey);

  if (!notice) {
    return (
      <View style={styles.container}>
        <Header title="게딱지 공지사항" />
        <View style={styles.emptyWrap}>
          <Text style={[FONTS.fs_16_medium, styles.emptyText]}>
            공지 내용을 찾을 수 없습니다.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="게딱지 공지사항" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
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

        <Text style={[FONTS.fs_18_semibold, styles.title]}>{notice.title}</Text>
        <Text style={[FONTS.fs_16_medium, styles.date]}>{notice.date}</Text>

        <View style={styles.divider} />

        <Text style={[FONTS.fs_16_medium, styles.content]}>
          {notice.content}
        </Text>
      </ScrollView>
    </View>
  );
};

export default NoticeDetail;
