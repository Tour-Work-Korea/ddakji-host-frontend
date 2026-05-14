import React, {useEffect, useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import styles from './NotificationSettings.styles';

import RightArrow from '@assets/images/chevron_right_black.svg';

const NotificationSettings = ({guesthouseId}) => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  const [rooms, setRooms] = useState([]);

  const effectiveGuesthouseId = useMemo(
    () => guesthouseId ?? null,
    [guesthouseId],
  );

  useEffect(() => {
    const fetchGuesthousesWithRooms = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthousesWithRooms();
        const payload = response?.data?.data ?? response?.data ?? [];
        setGuesthouses(Array.isArray(payload) ? payload : []);
      } catch (error) {
        setGuesthouses([]);
      }
    };

    fetchGuesthousesWithRooms();
  }, []);

  useEffect(() => {
    const current = guesthouses.find(
      item => String(item?.guesthouseId) === String(effectiveGuesthouseId),
    );
    setRooms(Array.isArray(current?.rooms) ? current.rooms : []);
  }, [effectiveGuesthouseId, guesthouses]);

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View>
          <Text style={[FONTS.fs_16_semibold]}>체크인 안내문</Text>
          <Text style={[FONTS.fs_12_medium, styles.notiText]}>
            안내문 설정 시, 체크인 당일 예약자에게 알림이 전송됩니다.
          </Text>
        </View>

        <View style={styles.roomList}>
          {rooms.length === 0 ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              객실이 없습니다
            </Text>
          ) : (
            rooms.map(room => (
              <TouchableOpacity
                key={String(room?.roomId)}
                onPress={() =>
                  navigation.navigate('RoomGuideMessageEditor', {
                    guesthouseId: effectiveGuesthouseId,
                    roomId: room?.roomId,
                    roomName: room?.roomName ?? '이름 없음',
                  })
                }
                style={styles.selectRow}
                activeOpacity={0.8}>
                <Text style={[FONTS.fs_16_medium, styles.roomNameText]}>
                  {room?.roomName ?? '이름 없음'}
                </Text>
                <RightArrow width={24} height={24} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </View>
  );
};

export default NotificationSettings;
