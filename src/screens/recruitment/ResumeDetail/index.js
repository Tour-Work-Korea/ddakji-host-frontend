import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';

import {
  ApplicantAdditionalInfo,
  ApplicantTitle,
  ApplicantExperienceSection,
  ApplicantProfileHeader,
  ApplicantSelfIntroduction,
  ApplicantTag,
} from '@components/Employ/ApplicantDetail';
import AlertModal from '@components/modals/AlertModal';
import Loading from '@components/Loading';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';

import styles from './MyResumeDetail.styles';

const ResumeDetail = ({route}) => {
  const {
    id = null,
    isEditable = false,
    headerTitle = '이력서 수정',
  } = route.params || {};
  const [originalInfo, setOriginalInfo] = useState();
  const [formData, setFormData] = useState({
    resumeTitle: '',
    selfIntro: '',
    workExperience: [],
    hashtags: [],
  });
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const tryFetchResumeById = useCallback(async () => {
    try {
      const response = await hostEmployApi.getApplicantDetail(id);
      const parsedFormData = {
        resumeTitle: response.data.resumeTitle || '',
        selfIntro: response.data.selfIntro || '',
        workExperience: response.data.workExperience || [],
        hashtags: response.data.hashtags || response.data.userHashtag || [],
      };
      setFormData(parsedFormData);
      setOriginalInfo(response.data);
    } catch (error) {
      console.warn('이력서 조회 실패:', error);
      setErrorModal({
        visible: true,
        message: '이력서 조회에 실패했습니다',
        buttonText: '확인',
      });
    }
  }, [id]);

  useEffect(() => {
    if (id != null) {
      tryFetchResumeById();
    }
  }, [id, tryFetchResumeById]);

  return (
    <View style={styles.container}>
      <Header title={headerTitle} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {formData ? (
          <>
            <ApplicantProfileHeader data={originalInfo} />

            <ApplicantTitle
              title={formData?.resumeTitle}
              setTitle={data =>
                setFormData(prev => ({...prev, resumeTitle: data}))
              }
              isEditable={isEditable}
            />
            <ApplicantExperienceSection
              experiences={formData?.workExperience}
              isEditable={isEditable}
              setExperience={newList =>
                setFormData(prev => ({...prev, workExperience: newList}))
              }
            />
            <ApplicantTag
              tags={formData?.hashtags}
              isEditable={isEditable}
              setTags={newList =>
                setFormData(prev => ({...prev, hashtags: newList}))
              }
            />
            <ApplicantSelfIntroduction
              text={formData?.selfIntro}
              isEditable={isEditable}
              setSelfIntro={data =>
                setFormData(prev => ({...prev, selfIntro: data}))
              }
            />
            <ApplicantAdditionalInfo data={originalInfo} />
            <View style={styles.bottomGap} />
          </>
        ) : (
          <Loading title={'이력서를 불러오는 중입니다...'} />
        )}
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

export default ResumeDetail;
