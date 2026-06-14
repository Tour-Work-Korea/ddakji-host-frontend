import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import AlertModal from '@components/modals/AlertModal';
import GuesthouseRoomModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseRoom/GuesthouseRoomModal';
import RoomActionModal from '@components/modals/HostMy/Guesthouse/RoomReservation/RoomActionModal';
import RoomPriceModal from '@components/modals/HostMy/Guesthouse/RoomReservation/RoomPriceModal';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import styles from './RoomList.styles';

import DeleteIcon from '@assets/images/delete_orange.svg';
import EditIcon from '@assets/images/edit_orange.svg';
import PlusIcon from '@assets/images/plus_black.svg';

const ROOM_TYPE_LABEL = {
  DORMITORY: '도미토리',
  PRIVATE: '일반 객실',
};
const CENTER_TOAST_TOP_OFFSET = Platform.OS === 'ios' ? 220 : 190;

const normalizeRoom = room => ({
  id: String(room?.roomId ?? room?.id ?? ''),
  roomId: room?.roomId ?? room?.id ?? null,
  name: room?.roomName ?? room?.name ?? '이름 없음',
  roomType: room?.roomType ?? '',
  roomCapacity: Number(room?.roomCapacity ?? 0),
  roomStatus: room?.roomStatus ?? 'CLOSED',
  isVisible: Boolean(room?.isVisible),
  isClosed:
    room?.isClosed != null
      ? Boolean(room?.isClosed)
      : String(room?.roomStatus ?? 'CLOSED') !== 'OPEN',
  thumbnailUrl: room?.thumbnailImg ?? null,
});

const buildRoomSubtitle = room => {
  const roomTypeLabel = ROOM_TYPE_LABEL[room?.roomType] ?? '객실';
  const capacity = Number(room?.roomCapacity ?? 0);

  if (capacity > 0) {
    return `[${capacity}인 ${roomTypeLabel}]`;
  }

  return roomTypeLabel;
};

const mapRoomDetailToEditableRoom = room => ({
  id: room?.id ?? room?.roomId ?? undefined,
  roomName: room?.roomName ?? '',
  roomCapacity: room?.roomCapacity ?? null,
  roomMaxCapacity: room?.roomMaxCapacity ?? room?.roomCapacity ?? null,
  roomDesc: room?.roomDesc ?? room?.roomDescription ?? '',
  roomPrice: room?.roomPrice != null ? String(room.roomPrice) : '',
  extraPersonPrice: room?.extraPersonPrice != null ? String(room.extraPersonPrice) : room?.extraPersonFee != null ? String(room.extraPersonFee) : '',
  roomExtraFees: room?.roomExtraFees ?? [],
  roomImages: (room?.roomImages ?? []).map(image => ({
    id: image?.id ?? undefined,
    roomImageUrl: image?.roomImageUrl ?? '',
    isThumbnail: Boolean(image?.isThumbnail),
  })),
  roomType: room?.roomType ?? null,
  dormitoryGenderType: room?.dormitoryGenderType ?? null,
  femaleOnly: Boolean(room?.femaleOnly),
});

const RoomList = ({guesthouseId}) => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingRoomId, setUpdatingRoomId] = useState(null);
  const [isEditRoomModalVisible, setIsEditRoomModalVisible] = useState(false);
  const [isCreateRoomModalVisible, setIsCreateRoomModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isPreparingEditRoom, setIsPreparingEditRoom] = useState(false);
  const [deleteTargetRoom, setDeleteTargetRoom] = useState(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionTargetRoom, setActionTargetRoom] = useState(null);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!guesthouseId) {
      setRooms([]);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await hostGuesthouseApi.getMyGuesthousesWithRooms();
      const payload = response?.data?.data ?? response?.data ?? [];
      const guesthouses = Array.isArray(payload) ? payload : [];
      const selectedGuesthouse = guesthouses.find(
        item => String(item?.guesthouseId) === String(guesthouseId),
      );
      const nextRooms = Array.isArray(selectedGuesthouse?.rooms)
        ? selectedGuesthouse.rooms.map(normalizeRoom).filter(room => room.roomId != null)
        : [];

      setRooms(nextRooms);
    } catch (error) {
      setRooms([]);
      setErrorMessage(
        error?.response?.data?.message ?? '객실 목록을 불러오지 못했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [guesthouseId]);

  useEffect(() => {
    setIsReordering(false);
    fetchRooms();
  }, [fetchRooms]);

  const handleMoveRoom = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= rooms.length) {
      return;
    }

    const next = [...rooms];
    const temp = next[index];
    next[index] = next[nextIndex];
    next[nextIndex] = temp;

    setRooms(next);
  };

  const handleSaveOrder = async () => {
    if (!guesthouseId || updatingRoomId != null) {
      return;
    }
    try {
      setUpdatingRoomId('saveOrder');
      const roomIds = rooms.map(room => room.roomId);
      await hostGuesthouseApi.updateRoomDisplayOrder(guesthouseId, roomIds);
      Toast.show({
        type: 'success',
        text1: '객실 순서가 성공적으로 변경되었습니다',
        position: 'top',
        topOffset: CENTER_TOAST_TOP_OFFSET,
      });
      setIsReordering(false);
      await fetchRooms();
    } catch (error) {
      const message = error?.response?.data?.message ?? '순서 변경에 실패했어요.';
      Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        topOffset: CENTER_TOAST_TOP_OFFSET,
      });
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const renderedRooms = useMemo(
    () =>
      rooms.map(room => ({
        ...room,
        subtitle: buildRoomSubtitle(room),
        exposed: Boolean(room?.isVisible),
      })),
    [rooms],
  );

  const handleToggleRoomVisibility = async (roomId, nextValue) => {
    if (!guesthouseId || !roomId || updatingRoomId != null) {
      return;
    }

    try {
      setUpdatingRoomId(roomId);
      await hostGuesthouseApi.updateRoomVisibility(guesthouseId, roomId, nextValue);
      setRooms(prev =>
        prev.map(item =>
          item.roomId === roomId
            ? {...item, isVisible: nextValue}
            : item,
        ),
      );
      Toast.show({
        type: 'success',
        text1: nextValue ? '객실이 노출 처리 되었습니다' : '객실이 숨김 처리 되었습니다',
        position: 'top',
        topOffset: CENTER_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ?? '객실 노출 상태 변경에 실패했어요.';
      setErrorMessage(message);
      Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        topOffset: CENTER_TOAST_TOP_OFFSET,
      });
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const handlePressEditAction = room => {
    if (isPreparingEditRoom) {
      return;
    }
    setActionTargetRoom(room);
    setActionModalVisible(true);
  };

  const handlePressEditRoom = async roomId => {
    if (!guesthouseId || !roomId || isPreparingEditRoom) {
      return;
    }

    try {
      setIsPreparingEditRoom(true);
      const response = await hostGuesthouseApi.getGuesthouseDetail(guesthouseId);
      const guesthouseDetail = response?.data ?? null;
      const roomInfos = Array.isArray(guesthouseDetail?.roomInfos)
        ? guesthouseDetail.roomInfos
        : [];
      const targetRoom = roomInfos.find(room => String(room?.id) === String(roomId));

      if (!targetRoom) {
        Toast.show({
          type: 'error',
          text1: '객실 정보를 불러오지 못했어요.',
          position: 'top',
        });
        return;
      }

      setEditingRoom(mapRoomDetailToEditableRoom(targetRoom));
      setIsEditRoomModalVisible(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? '객실 정보를 불러오지 못했어요.',
        position: 'top',
      });
    } finally {
      setIsPreparingEditRoom(false);
    }
  };

  const handleSelectEditedRoom = updatedRooms => {
    const updatedRoom = Array.isArray(updatedRooms) ? updatedRooms[0] : null;
    if (!updatedRoom) {
      return;
    }

    setRooms(prev =>
      prev.map(room =>
        String(room?.roomId) === String(updatedRoom?.id)
          ? {
              ...room,
              name: updatedRoom?.roomName ?? room.name,
              roomType: updatedRoom?.roomType ?? room.roomType,
              roomCapacity: Number(updatedRoom?.roomCapacity ?? room.roomCapacity ?? 0),
              roomStatus: room.roomStatus,
              isVisible: room.isVisible,
              isClosed: room.isClosed,
              thumbnailUrl:
                updatedRoom?.roomImages?.find(image => image?.isThumbnail)?.roomImageUrl ??
                updatedRoom?.roomImages?.[0]?.roomImageUrl ??
                room.thumbnailUrl,
            }
          : room,
      ),
    );
    setEditingRoom(null);
    setIsEditRoomModalVisible(false);
  };

  const handlePressDeleteRoom = room => {
    if (!room?.roomId || isDeletingRoom) {
      return;
    }

    setDeleteTargetRoom(room);
  };

  const handleConfirmDeleteRoom = async () => {
    if (!guesthouseId || !deleteTargetRoom?.roomId || isDeletingRoom) {
      return;
    }

    try {
      setIsDeletingRoom(true);
      await hostGuesthouseApi.deleteRoom(guesthouseId, deleteTargetRoom.roomId);
      setRooms(prev =>
        prev.filter(room => String(room?.roomId) !== String(deleteTargetRoom.roomId)),
      );
      Toast.show({
        type: 'success',
        text1: '객실이 삭제되었어요.',
        position: 'top',
      });
      setDeleteTargetRoom(null);
    } catch (error) {
      const message = error?.response?.data?.message ?? '객실 삭제에 실패했어요.';
      setErrorMessage(message);
      Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
      });
    } finally {
      setIsDeletingRoom(false);
    }
  };

  const handleSelectCreatedRoom = async () => {
    await fetchRooms();
    setIsCreateRoomModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 상단 고정 헤더 영역 */}
      <View style={styles.headerRow}>
        <Text style={[FONTS.fs_16_semibold, styles.headerTitle]}>
          운영 중인 객실 <Text style={{color: COLORS.primary_blue}}>{renderedRooms.length}</Text>개
        </Text>

        <View style={styles.headerButtons}>
          {isReordering ? (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.reorderCancelButton}
                onPress={() => {
                  setIsReordering(false);
                  fetchRooms();
                }}>
                <Text style={[FONTS.fs_12_medium, styles.reorderCancelButtonText]}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.reorderSaveButton}
                disabled={updatingRoomId === 'saveOrder'}
                onPress={handleSaveOrder}>
                <Text style={[FONTS.fs_12_medium, styles.reorderSaveButtonText]}>순서 저장</Text>
              </TouchableOpacity>
            </>
          ) : (
            renderedRooms.length > 1 && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.reorderStartButton}
                onPress={() => setIsReordering(true)}>
                <Text style={[FONTS.fs_12_medium, styles.reorderStartButtonText]}>순서 변경</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {isReordering && (
          <View style={styles.reorderBanner}>
            <Text style={[FONTS.fs_12_medium, styles.reorderBannerText]}>
              💡 위/아래(▲/▼) 버튼을 눌러 객실의 노출 순서를 변경하고 [순서 저장]을 눌러주세요.
            </Text>
          </View>
        )}

        {isLoading ? (
          <Text style={[FONTS.fs_14_medium, styles.emptyText]}>
            객실 목록을 불러오는 중입니다
          </Text>
        ) : errorMessage ? (
          <Text style={[FONTS.fs_14_medium, styles.emptyText]}>{errorMessage}</Text>
        ) : renderedRooms.length === 0 ? (
          <Text style={[FONTS.fs_14_medium, styles.emptyText]}>등록된 객실이 없습니다</Text>
        ) : (
          renderedRooms.map((room, index) => {
            const isExposed = room.exposed;

            return (
              <View key={room.id} style={styles.roomCard}>
                {room.thumbnailUrl ? (
                  <Image
                    source={{uri: room.thumbnailUrl}}
                    style={styles.roomImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.roomImage} />
                )}

                <View style={styles.roomContent}>
                  <View>
                    {isReordering && (
                      <View style={styles.reorderBadge}>
                        <Text style={[FONTS.fs_10_bold, styles.reorderBadgeText]}>
                          노출 {index + 1}순위
                        </Text>
                      </View>
                    )}
                    <Text style={[FONTS.fs_16_medium, styles.roomName]} numberOfLines={1}>
                      {room.name}
                    </Text>
                    <Text style={[FONTS.fs_14_medium, styles.roomSubtitle]}>
                      {room.subtitle}
                    </Text>
                  </View>

                  {!isReordering && (
                    <View style={styles.roomBottomRow}>
                      <View
                        style={[
                          styles.exposureBadge,
                          isExposed ? styles.exposureBadgeOn : styles.exposureBadgeOff,
                        ]}>
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            isExposed ? styles.exposureTextOn : styles.exposureTextOff,
                          ]}>
                          {isExposed ? '노출중' : '미노출'}
                        </Text>
                      </View>

                      <Switch
                        value={isExposed}
                        disabled={updatingRoomId === room.roomId}
                        onValueChange={nextValue =>
                          handleToggleRoomVisibility(room.roomId, nextValue)
                        }
                        trackColor={{
                          false: COLORS.grayscale_300,
                          true: COLORS.primary_blue,
                        }}
                        thumbColor={COLORS.grayscale_0}
                      />
                    </View>
                  )}

                  {!isReordering && (
                    <View style={styles.roomActionColumn}>
                      <View style={styles.iconRow}>
                        <TouchableOpacity
                          activeOpacity={isPreparingEditRoom ? 1 : 0.8}
                          style={styles.iconButton}
                          disabled={isPreparingEditRoom}
                          onPress={() => handlePressEditAction(room)}>
                          <EditIcon width={22} height={22} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={isDeletingRoom ? 1 : 0.8}
                          style={styles.iconButton}
                          disabled={isDeletingRoom}
                          onPress={() => handlePressDeleteRoom(room)}>
                          <DeleteIcon width={22} height={22} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {isReordering && (
                  <View style={styles.reorderControlRow}>
                    <TouchableOpacity
                      activeOpacity={index === 0 ? 1 : 0.8}
                      disabled={index === 0}
                      style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                      onPress={() => handleMoveRoom(index, -1)}>
                      <Text style={[FONTS.fs_14_medium, styles.reorderButtonText]}>▲</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={index === renderedRooms.length - 1 ? 1 : 0.8}
                      disabled={index === renderedRooms.length - 1}
                      style={[
                        styles.reorderButton,
                        index === renderedRooms.length - 1 && styles.reorderButtonDisabled,
                      ]}
                      onPress={() => handleMoveRoom(index, 1)}>
                      <Text style={[FONTS.fs_14_medium, styles.reorderButtonText]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {!isReordering && (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryButton}
            onPress={() => setIsCreateRoomModalVisible(true)}>
            <Text style={[FONTS.fs_14_medium, styles.secondaryButtonText]}>객실 추가</Text>
            <PlusIcon width={18} height={18} />
          </TouchableOpacity>
        </View>
      )}

      <AlertModal
        visible={Boolean(deleteTargetRoom)}
        title="객실을 삭제하시겠습니까?"
        message="삭제 후에는 되돌릴 수 없습니다."
        buttonText="삭제하기"
        buttonText2="취소"
        onPress={handleConfirmDeleteRoom}
        onPress2={() => {
          if (!isDeletingRoom) {
            setDeleteTargetRoom(null);
          }
        }}
      />

      <GuesthouseRoomModal
        visible={isCreateRoomModalVisible}
        onClose={() => {
          setIsCreateRoomModalVisible(false);
        }}
        onSelect={handleSelectCreatedRoom}
        shouldResetOnClose
        guesthouseId={guesthouseId}
        defaultRooms={[]}
        directCreateMode
      />

      <GuesthouseRoomModal
        visible={isEditRoomModalVisible}
        onClose={() => {
          setIsEditRoomModalVisible(false);
          setEditingRoom(null);
        }}
        onSelect={handleSelectEditedRoom}
        shouldResetOnClose
        guesthouseId={guesthouseId}
        defaultRooms={editingRoom ? [editingRoom] : []}
        directEditMode
        directEditRoomId={editingRoom?.id ?? null}
      />

      <RoomActionModal
        visible={actionModalVisible}
        onClose={() => {
          setActionModalVisible(false);
          setActionTargetRoom(null);
        }}
        roomName={actionTargetRoom?.name ?? ''}
        onPressPriceChange={() => {
          setActionModalVisible(false);
          setPriceModalVisible(true);
        }}
        onPressInfoChange={() => {
          setActionModalVisible(false);
          if (actionTargetRoom?.roomId) {
            handlePressEditRoom(actionTargetRoom.roomId);
          }
        }}
      />

      <RoomPriceModal
        visible={priceModalVisible}
        onClose={() => {
          setPriceModalVisible(false);
          setActionTargetRoom(null);
        }}
        room={actionTargetRoom}
        guesthouseId={guesthouseId}
      />
    </View>
  );
};

export default RoomList;
