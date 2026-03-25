import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';

import styles from './EmployDetail.styles';
import RecruitDescriptionSection from './RecruitDescriptionSection';
import RecruitHeaderSection from './RecruitHeaderSection';
import RecruitProfileSection from './RecruitProfileSection';
import RecruitTapSection from './RecruitTapSection';
import Loading from '@components/Loading';
import AlertModal from '@components/modals/AlertModal';
import hostEmployApi from '@utils/api/hostEmployApi';

const EmployDetail = ({route}) => {
  const {id} = route.params ?? {};
  const [recruit, setRecruit] = useState({});
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const tryFetchRecruitById = useCallback(async () => {
    try {
      const response = await hostEmployApi.getRecruitDetail(id);
      setRecruit(response.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '공고 상세 조회에 실패했습니다.',
        buttonText: '확인',
      });
    }
  }, [id]);

  useEffect(() => {
    tryFetchRecruitById();
  }, [tryFetchRecruitById]);

  if (!recruit) {
    return <Loading title="채용 공고를 불러오고 있어요" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더(썸네일, 해시태그) */}
        <RecruitHeaderSection
          tags={recruit?.hashtags}
          guesthouseName={recruit?.guesthouseName}
          recruitImages={recruit?.recruitImages}
        />
        <View style={styles.contentContainer}>
          {/* 상단 기본 정보(공고 제목, 위치, 요약) */}
          <RecruitProfileSection recruit={recruit} />
          <View style={styles.devide} />
          {/* 탭 */}
          <RecruitTapSection recruit={recruit} />
          <View style={styles.devide} />
          <RecruitDescriptionSection description={recruit?.recruitDetail} />
        </View>
      </ScrollView>
      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmployDetail;
