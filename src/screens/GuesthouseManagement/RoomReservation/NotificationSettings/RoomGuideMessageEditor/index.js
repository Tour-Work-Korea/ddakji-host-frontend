import React, {useEffect, useRef, useState} from 'react';
import {
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import styles from './RoomGuideMessageEditor.styles';

const RoomGuideMessageEditor = ({route, navigation}) => {
  const roomName = route?.params?.roomName ?? '객실';
  const guesthouseId = route?.params?.guesthouseId;
  const roomId = route?.params?.roomId;
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchCheckinNotice = async () => {
      if (!guesthouseId || !roomId) {
        return;
      }

      try {
        const response = await hostGuesthouseApi.getRoomCheckinNotice(
          guesthouseId,
          roomId,
        );
        const payload = response?.data?.data ?? response?.data ?? {};
        setMessage(payload?.noticeText ?? '');
      } catch (error) {
        setMessage('');
      }
    };

    fetchCheckinNotice();
  }, [guesthouseId, roomId]);

  const handleSave = async () => {
    if (!guesthouseId || !roomId || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await hostGuesthouseApi.updateRoomCheckinNotice(guesthouseId, roomId, message);
      setIsSaving(false);
      navigation.goBack();
      InteractionManager.runAfterInteractions(() => {
        Toast.show({
          type: 'success',
          text1: '체크인 안내문 작성이 완료되었어요.',
          position: 'top',
        });
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '저장에 실패했어요.',
        position: 'top',
      });
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.screen}>
          <Header title={roomName} />

          <View style={styles.body}>
            <View style={styles.descriptionBox}>
              <Text style={[FONTS.fs_14_semibold, {color: COLORS.semantic_yellow}]}>
                ⚠️
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.descriptionText]}>
                예약 고객에게 체크인 전날 카카오 알림톡이 발송됩니다.{'\n'}
                고객에게 전달할 안내 내용을 작성해주세요.
              </Text>
            </View>

            <View style={styles.inputHeader}>
              <Text style={[FONTS.fs_16_medium]}>체크인 안내문 작성</Text>
              <Text style={[FONTS.fs_12_light, styles.countText]}>
                <Text style={{color: COLORS.primary_orange}}>{message.length}</Text>/2000
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                value={message}
                onChangeText={setMessage}
                style={[FONTS.fs_14_medium, styles.input]}
                multiline
                scrollEnabled
                maxLength={2000}
                textAlignVertical="top"
                placeholder="체크인 전 참고할 내용을 작성해주세요. (예: 주차 안내, 늦은 체크인 안내 등)"
                placeholderTextColor={styles.placeholderText.color}
              />
            </View>
            <TouchableOpacity
              style={styles.rewriteButton}
              onPress={() => {
                setMessage('');
              }}
              activeOpacity={0.8}>
              <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>다시쓰기</Text>
            </TouchableOpacity>

            <ButtonScarlet
              title={isSaving ? '저장 중' : '저장'}
              onPress={handleSave}
              disabled={isSaving}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RoomGuideMessageEditor;
