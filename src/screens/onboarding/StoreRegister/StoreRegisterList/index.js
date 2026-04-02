import React, {useState, useCallback} from 'react';
import {View, FlatList, Alert, Text, TouchableOpacity} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Avatar from '@components/Avatar';
import Header from '@components/Header';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import EmptyState from '@components/EmptyState';

import styles from './StoreRegisterList.styles';
import {FONTS} from '@constants/fonts';
import EmptyIcon from '@assets/images/wa_blue_apply.svg';
import PlusIcon from '@assets/images/plus_orange.svg';

const StoreRegisterList = () => {
  const navigation = useNavigation();
  const [storeRegisters, setStoreRegisters] = useState([]);
  useFocusEffect(
    useCallback(() => {
      tryFetchStoreRegister();
    }, []),
  );

  const tryFetchStoreRegister = async () => {
    try {
      const response = await hostGuesthouseApi.getHostApplications();
      setStoreRegisters(response.data);
    } catch (error) {
      console.warn('입점신청서 조회 실패: ', error);
      Alert.alert('입점 신청서 조회에 실패했습니다.');
    }
  };

  const renderItem = ({item, index}) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        index !== storeRegisters.length - 1 && styles.listItemBorder,
      ]}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('GuesthouseManagement', {
          businessName: item.businessName,
          storeRegisterId: item.id,
        })
      }>
      <View style={styles.listItemLeft}>
        <Avatar
          uri={null}
          size={36}
          borderRadius={10}
          iconSize={18}
          style={styles.avatar}
        />
        <Text style={[FONTS.fs_18_medium, styles.businessName]} numberOfLines={1}>
          {item.businessName}
        </Text>
      </View>

      {item.status === '승인 완료' ? (
        <View style={styles.roleBadge}>
          <Text style={[FONTS.fs_14_semibold, styles.roleBadgeText]}>운영자</Text>
        </View>
      ) : (
        <Text style={[FONTS.fs_14_semibold, styles.pendingText]}>
          등록 심사중
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="내 게스트하우스" />

      <View style={styles.body}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.registerLink}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StoreRegisterForm1')}>
            <View style={styles.registerPlus}>
              <PlusIcon height={16} width={16}/>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.registerLinkText]}>
              게스트하우스 등록
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={storeRegisters}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={EmptyIcon}
                iconSize={{width: 188, height: 84}}
                title="게스트하우스가 없어요"
                description="지금 입점신청을 해보세요!"
              />
            </View>
          }
        />
      </View>
    </View>
  );
};

export default StoreRegisterList;
