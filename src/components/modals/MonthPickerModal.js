import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

export default function MonthPickerModal({
  visible,
  initialDate = new Date(), // Date object
  onClose,
  onConfirm,
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // 현재 연도 기준으로 앞뒤 5년 범위 제공
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    if (visible) {
      if (initialDate instanceof Date && !isNaN(initialDate.getTime())) {
        setYear(initialDate.getFullYear());
        setMonth(initialDate.getMonth() + 1);
      } else {
        const d = new Date();
        setYear(d.getFullYear());
        setMonth(d.getMonth() + 1);
      }
    }
  }, [initialDate, visible]);

  const handleApply = () => {
    const yStr = String(year);
    const mStr = String(month).padStart(2, '0');
    if (onConfirm) {
      onConfirm({ year, month, formatted: `${yStr}-${mStr}` });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row' }}>
                {/* 년 */}
                <Picker selectedValue={year} onValueChange={setYear} style={{ flex: 1 }}>
                  {yearOptions.map((y) => (
                    <Picker.Item key={y} label={`${y}년`} value={y} />
                  ))}
                </Picker>
                {/* 월 */}
                <Picker selectedValue={month} onValueChange={setMonth} style={{ flex: 1 }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <Picker.Item key={m} label={`${m}월`} value={m} />
                  ))}
                </Picker>
              </View>

              <ButtonScarlet
                title="조회하기"
                onPress={handleApply}
                style={{ marginTop: 16 }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 16
  }
});
