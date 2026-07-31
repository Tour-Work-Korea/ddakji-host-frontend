import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import AlertModal from '@components/modals/AlertModal';
import hostMeetApi from '@utils/api/hostMeetApi';
import styles from './PartyInfo.styles';

import PeopleIcon from '@assets/images/people_gray.svg';
import PencilIcon from '@assets/images/edit_gray.svg';
import TrashIcon from '@assets/images/delete_gray.svg';
import PlusIcon from '@assets/images/plus_white.svg';

const MENU_TOAST_TOP_OFFSET = Platform.OS === 'ios' ? 220 : 190;

const PartyInfo = ({ guesthouseId }) => {
  const navigation = useNavigation();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [updatingTemplateIds, setUpdatingTemplateIds] = useState([]);

  const fetchParties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hostMeetApi.getMyParties();
      const rawParties = response?.data;
      const allParties = Array.isArray(rawParties)
        ? rawParties
        : rawParties?.content ?? [];
      const filtered = allParties.filter(
        party => String(party.guesthouseId) === String(guesthouseId),
      );
      const resolvedParties = await Promise.all(
        filtered.map(async party => {
          const applyOpen = party?.isApplyOpen ?? party?.isApply;
          if (typeof applyOpen === 'boolean' || party?.templateId == null) {
            return party;
          }

          try {
            const detailResponse = await hostMeetApi.getPartyTemplateDetail(
              party.templateId,
            );
            return {...party, ...(detailResponse?.data ?? {})};
          } catch (error) {
            return party;
          }
        }),
      );
      setParties(resolvedParties);
    } catch (error) {
      console.log('Error fetching parties:', error);
      setParties([]);
    } finally {
      setLoading(false);
    }
  }, [guesthouseId]);

  useFocusEffect(
    useCallback(() => {
      if (guesthouseId) {
        fetchParties();
      }
    }, [guesthouseId, fetchParties]),
  );

  const handleRegister = () => {
    navigation.navigate('MyMeetAdd', { guesthouseId });
  };

  const handleEdit = templateId => {
    navigation.navigate('MyMeetAdd', { templateId, guesthouseId });
  };

  const handleDelete = templateId => {
    setDeleteTargetId(templateId);
  };

  const handleToggleApplyOpen = async (templateId, nextValue) => {
    if (
      templateId == null ||
      updatingTemplateIds.some(id => String(id) === String(templateId))
    ) {
      return;
    }

    setUpdatingTemplateIds(prev => [...prev, templateId]);

    try {
      await hostMeetApi.updatePartyApplicationOpen(templateId, nextValue);
      setParties(prev =>
        prev.map(party =>
          String(party.templateId) === String(templateId)
            ? {...party, isApplyOpen: nextValue, isApply: nextValue}
            : party,
        ),
      );
      Toast.show({
        type: 'success',
        text1: nextValue
          ? '이제 파티 참여 신청을 받을 수 있어요.'
          : '이제 파티 정보만 보여줘요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.message ||
          '파티 신청 설정 변경 중 오류가 발생했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } finally {
      setUpdatingTemplateIds(prev =>
        prev.filter(id => String(id) !== String(templateId)),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) {
      return;
    }

    try {
      await hostMeetApi.deleteParty(deleteTargetId);
      setDeleteTargetId(null);
      fetchParties();
    } catch (error) {
      console.log('Delete party err:', error);
      setDeleteTargetId(null);
      Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary_orange} />
      </View>
    );
  }

  if (parties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[FONTS.fs_20_medium, styles.emptyText]}>
          게스트하우스의 특별한 파티를{'\n'}게딱지에 소개해보세요!
        </Text>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={[FONTS.fs_14_medium, styles.registerButtonText]}>
            파티 등록하기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isApplyOpen = Boolean(item?.isApplyOpen ?? item?.isApply);
    const isUpdating = updatingTemplateIds.some(
      id => String(id) === String(item.templateId),
    );

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={{ uri: item.partyImageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <Text
                style={[FONTS.fs_16_semibold, styles.partyTitle]}
                numberOfLines={2}>
                {item.partyTitle}
              </Text>
              <View style={styles.attendanceRow}>
                <PeopleIcon width={14} height={14} />
                <Text style={[FONTS.fs_12_medium, styles.attendanceText]}>
                  최대인원 {item.maxAttendance}명
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => handleEdit(item.templateId)}>
            <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
              수정
            </Text>
            <PencilIcon width={18} height={18} />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => handleDelete(item.templateId)}>
            <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
              삭제
            </Text>
            <TrashIcon width={18} height={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.applicationSetting}>
          <View style={styles.applicationSettingTextWrap}>
            <View style={styles.applicationSettingLabelRow}>
              <Text
                style={[FONTS.fs_14_semibold, styles.applicationSettingTitle]}>
                참여 신청
              </Text>
              <Text
                style={[
                  FONTS.fs_12_semibold,
                  isApplyOpen
                    ? styles.applicationStatusOpen
                    : styles.applicationStatusClosed,
                ]}>
                {isApplyOpen ? '신청 받는 중' : '정보만 노출'}
              </Text>
            </View>
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.applicationSettingDescription,
              ]}>
              {isApplyOpen
                ? '게스트가 파티를 확인하고 참여 신청할 수 있어요.'
                : '파티 정보만 보여주고 신규 신청은 받지 않아요.'}
            </Text>
          </View>
          <Switch
            value={isApplyOpen}
            onValueChange={nextValue =>
              handleToggleApplyOpen(item.templateId, nextValue)
            }
            disabled={isUpdating}
            trackColor={{
              false: COLORS.grayscale_300,
              true: COLORS.primary_orange,
            }}
            thumbColor={COLORS.grayscale_0}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={parties}
        keyExtractor={(item, index) =>
          item.templateId ? String(item.templateId) : String(index)
        }
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.addButton, styles.addButtonLocation]}
        activeOpacity={0.8}
        onPress={handleRegister}>
        <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
          파티 등록하기
        </Text>
        <PlusIcon width={24} height={24} />
      </TouchableOpacity>

      <AlertModal
        visible={deleteTargetId !== null}
        title="삭제 확인"
        message="정말로 이 파티를 삭제하시겠습니까?"
        buttonText="삭제"
        buttonText2="취소"
        onPress={confirmDelete}
        onPress2={() => setDeleteTargetId(null)}
      />
    </View>
  );
};

export default PartyInfo;
