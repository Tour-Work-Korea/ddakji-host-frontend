import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import adminApi from '@utils/api/adminApi';
import styles from './NoticeDetail.styles';

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

const mapNoticeDetail = item => ({
  id: item?.id,
  categoryCode: item?.category || '',
  category: item?.categoryLabel || item?.category || '',
  title: item?.title || '',
  date: formatNoticeDate(item?.publishedAt || item?.updatedAt),
  summary: item?.summary || '',
  blocks: Array.isArray(item?.blocks)
    ? [...item.blocks].sort(
        (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0),
      )
    : [],
});

const NoticeContentImage = ({imageUrl, sortOrder}) => {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  useEffect(() => {
    let isMounted = true;

    Image.getSize(
      imageUrl,
      (width, height) => {
        if (isMounted && width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {},
    );

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return (
    <Image
      source={{uri: imageUrl}}
      style={[styles.contentImage, {aspectRatio}]}
      resizeMode="contain"
      accessibilityLabel={`공지사항 이미지 ${sortOrder}`}
    />
  );
};

const NoticeDetail = () => {
  const route = useRoute();
  const noticeId = route.params?.noticeId;
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNoticeDetail = async () => {
      if (!noticeId) {
        if (isMounted) {
          setNotice(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const {data} = await adminApi.getAdminNoticeDetail(noticeId);

        if (!isMounted) {
          return;
        }

        setNotice(mapNoticeDetail(data));
      } catch (error) {
        console.warn('[NoticeDetail] failed to fetch notice detail:', error?.message);

        if (isMounted) {
          setNotice(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNoticeDetail();

    return () => {
      isMounted = false;
    };
  }, [noticeId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="게딱지 공지사항" />
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="small" color={COLORS.grayscale_500} />
        </View>
      </View>
    );
  }

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

        <Text style={[FONTS.fs_18_semibold, styles.title]}>{notice.title}</Text>
        <Text style={[FONTS.fs_16_medium, styles.date]}>{notice.date}</Text>

        {notice.summary ? (
          <Markdown style={styles.markdownSummary}>{notice.summary}</Markdown>
        ) : null}

        {notice.blocks.map((block, index) => {
          if (block?.type === 'IMAGE' && block?.imageUrl) {
            return (
              <NoticeContentImage
                key={`image-${block.sortOrder ?? index}`}
                imageUrl={block.imageUrl}
                sortOrder={block.sortOrder ?? index + 1}
              />
            );
          }

          if (block?.type === 'TEXT' && block?.text) {
            return (
              <Markdown
                key={`text-${block.sortOrder ?? index}`}
                style={styles.markdownContent}>
                {block.text}
              </Markdown>
            );
          }

          return null;
        })}
      </ScrollView>
    </View>
  );
};

export default NoticeDetail;
