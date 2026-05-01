import React, {useCallback, useState} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import ApplicantItem from '@components/Employ/ApplicantItem';
import AlertModal from '@components/modals/AlertModal';
import PrevRecruitModal from '@components/modals/Employ/PrevRecruitModal';
import ResultModal from '@components/modals/ResultModal';
import {FONTS} from '@constants/fonts';
import hostEmployApi from '@utils/api/hostEmployApi';
import BlueSmileLogo from '@assets/images/logo_blue_smile.svg';
import PlusIcon from '@assets/images/plus_white.svg';
import styles from './StaffPosting.styles';

const StaffPosting = ({guesthouseId}) => {
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
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [prevRecruitModalVisible, setPrevRecruitModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const getMyRecruits = async () => {
    setLoading(true);
    try {
      const response = await hostEmployApi.getMyRecruits();
      setMyRecruits(response.data);
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
  };

  useFocusEffect(
    useCallback(() => {
      getMyRecruits();
    }, []),
  );

  const handleViewDetail = recruit => {
    navigation.navigate('EmployDetail', {
      id: recruit?.recruitId,
      fromHost: true,
    });
  };

  const fetchDeleteRecruit = async id => {
    try {
      await hostEmployApi.requestDeleteRecruit(id, '마감요청');
      setResultModalVisible(true);
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ?? '마감요청 중 오류가 발생했습니다',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        onPress2: null,
        buttonText: '확인',
        buttonText2: null,
      });
    }
  };

  const confirmDelete = id => {
    setErrorModal(prev => ({...prev, visible: false}));
    fetchDeleteRecruit(id);
  };

  const handleDeletePosting = id => {
    setErrorModal({
      visible: true,
      title: '마감 요청은 되돌릴 수 없는 작업이에요\n계속 진행하시겠어요?',
      onPress: () => confirmDelete(id),
      onPress2: () => setErrorModal(prev => ({...prev, visible: false})),
      buttonText: '요청할래요',
      buttonText2: '보류할게요',
    });
  };

  const handleClickNewRecruit = () => {
    setErrorModal({
      visible: true,
      title:
        '이전에 작성한 공고를 불러와 등록하시겠어요,\n아니면 새로 작성하시겠어요?',
      onPress: () => {
        setPrevRecruitModalVisible(true);
        setErrorModal(prev => ({...prev, visible: false}));
      },
      onPress2: () => {
        navigation.navigate('RecruitmentForm', {
          guesthouseId,
          returnToStaffTab: true,
        });
        setErrorModal(prev => ({...prev, visible: false}));
      },
      buttonText: '공고 불러오기',
      buttonText2: '새로 작성하기',
    });
  };

  const handlePickPrevRecruit = id => {
    navigation.navigate('RecruitmentForm', {
      recruitId: id,
      guesthouseId,
      returnToStaffTab: true,
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <></>
      ) : myRecruits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[FONTS.fs_20_semibold, styles.emptyTitle]}>
            아직 등록된 스탭 공고가 없어요{'\n'}지금 바로 공고를 등록해보세요
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleClickNewRecruit}>
            <Text style={[FONTS.fs_14_medium, styles.primaryButtonText]}>
              스탭 공고 등록하기
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myRecruits}
          renderItem={({item}) => (
            <ApplicantItem
              item={item}
              onPress={handleViewDetail}
              isRemovable={true}
              handleDeletePosting={() => handleDeletePosting(item.recruitId)}
            />
          )}
          keyExtractor={item => item.recruitId.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!loading && myRecruits.length > 0 ? (
        <TouchableOpacity
          style={[styles.addButton, styles.addButtonLocation]}
          activeOpacity={0.8}
          onPress={handleClickNewRecruit}>
          <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
            스탭공고 등록하기
          </Text>
          <PlusIcon width={24} height={24} />
        </TouchableOpacity>
      ) : null}

      <AlertModal
        title={errorModal.title ?? null}
        message={errorModal.message ?? null}
        buttonText={errorModal.buttonText}
        buttonText2={errorModal.buttonText2}
        onPress={errorModal.onPress}
        onPress2={errorModal.onPress2}
        visible={errorModal.visible}
      />
      <PrevRecruitModal
        visible={prevRecruitModalVisible}
        items={myRecruits}
        onClose={() => setPrevRecruitModalVisible(false)}
        onPick={handlePickPrevRecruit}
      />
      <ResultModal
        visible={resultModalVisible}
        onClose={() => {
          setResultModalVisible(false);
        }}
        title="마감요청이 되었어요!"
        Icon={BlueSmileLogo}
      />
    </View>
  );
};

export default StaffPosting;
