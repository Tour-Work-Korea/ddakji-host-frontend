import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import AlertModal from '@components/modals/AlertModal';
import hostMeetApi from '@utils/api/hostMeetApi';
import styles from './PartyInfo.styles';

import PeopleIcon from '@assets/images/people_gray.svg';
import PencilIcon from '@assets/images/edit_gray.svg';
import TrashIcon from '@assets/images/delete_gray.svg';

const PartyInfo = ({ guesthouseId }) => {
  const navigation = useNavigation();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchParties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hostMeetApi.getMyParties();
      const allParties = response?.data || [];
      const filtered = allParties.filter(
        party => String(party.guesthouseId) === String(guesthouseId),
      );
      setParties(filtered);
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

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

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

  const renderItem = ({ item }) => (
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
        <View style={styles.cardBottom}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => handleEdit(item.templateId)}>
            <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
              수정하기
            </Text>
            <PencilIcon width={20} height={20} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => handleDelete(item.templateId)}>
            <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
              삭제하기
            </Text>
            <TrashIcon width={20} height={20} style={styles.actionIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
