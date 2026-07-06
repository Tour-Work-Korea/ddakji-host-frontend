import React, {useCallback, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import ApplicantItem from '@components/Employ/ApplicantItem';
import AlertModal from '@components/modals/AlertModal';
import hostEmployApi from '@utils/api/hostEmployApi';
import ApplyLogo from '@assets/images/wa_blue_apply.svg';
import styles from './ApplicantCheck.styles';

const getRecruitSortTime = recruit => {
  const time = recruit?.deadline ? new Date(recruit.deadline).getTime() : 0;

  return Number.isNaN(time) ? 0 : time;
};

const sortRecruitsByRecent = recruits =>
  [...(recruits ?? [])].sort(
    (left, right) => getRecruitSortTime(right) - getRecruitSortTime(left),
  );

const filterRecruitsByGuesthouse = (recruits, guesthouseId) => {
  if (!guesthouseId) {
    return recruits ?? [];
  }

  return (recruits ?? []).filter(
    recruit => String(recruit?.guesthouseId) === String(guesthouseId),
  );
};

const hasApplicationCount = recruit =>
  recruit?.applicationCount !== undefined ||
  recruit?.applicantCount !== undefined ||
  recruit?.applyCount !== undefined;

const getApplicantsCount = data => {
  if (Array.isArray(data)) {
    return data.length;
  }

  if (Array.isArray(data?.content)) {
    return data.content.length;
  }

  return Number(data?.totalElements ?? data?.count ?? 0);
};

const ApplicantCheck = ({guesthouseId}) => {
  const navigation = useNavigation();
  const [myRecruits, setMyRecruits] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    onPress: null,
    onPress2: null,
    buttonText: '',
    buttonText2: '',
  });
  const [loading, setLoading] = useState(true);

  const getMyRecruits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await hostEmployApi.getMyRecruits();
      const filteredRecruits = filterRecruitsByGuesthouse(
        response.data,
        guesthouseId,
      );
      const sortedRecruits = sortRecruitsByRecent(filteredRecruits);
      const recruitsWithCounts = await Promise.all(
        sortedRecruits.map(async recruit => {
          if (hasApplicationCount(recruit)) {
            return recruit;
          }

          try {
            const applicantsResponse = await hostEmployApi.getApplicantsByRecruit(
              recruit.recruitId,
            );

            return {
              ...recruit,
              applicationCount: getApplicantsCount(applicantsResponse.data),
            };
          } catch {
            return {
              ...recruit,
              applicationCount: 0,
            };
          }
        }),
      );

      setMyRecruits(recruitsWithCounts);
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          '나의 공고 조회 중 오류가 발생했습니다',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        onPress2: null,
        buttonText: '확인',
        buttonText2: null,
      });
    } finally {
      setLoading(false);
    }
  }, [guesthouseId]);

  useFocusEffect(
    useCallback(() => {
      getMyRecruits();
    }, [getMyRecruits]),
  );

  const handleViewDetail = recruit => {
    navigation.navigate('ApplicantListByRecruit', {recruit});
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <></>
      ) : myRecruits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ApplyLogo width={187} />
          <View style={styles.textContainer}>
            <Text style={styles.emptyTitle}>등록한 알바 공고가 없어요</Text>
            <Text style={styles.emptySubTitle}>
              지금 바로 공고를 등록 해보세요!
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={myRecruits}
          renderItem={({item}) => (
            <ApplicantItem
              item={item}
              onPress={handleViewDetail}
              variant="staffPosting"
              showApplicationCount={true}
            />
          )}
          keyExtractor={item => item.recruitId.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AlertModal
        title={errorModal.title}
        buttonText={errorModal.buttonText}
        buttonText2={errorModal.buttonText2}
        onPress={errorModal.onPress}
        onPress2={errorModal.onPress2}
        visible={errorModal.visible}
      />
    </View>
  );
};

export default ApplicantCheck;
