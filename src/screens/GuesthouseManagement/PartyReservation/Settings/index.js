import React, {useState} from 'react';
import {Switch, Text, TouchableOpacity, View} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import styles from './Settings.styles';

import CancelReservationIcon from '@assets/images/cancel_reservation.svg';
import MinusIcon from '@assets/images/minus_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';

const Settings = () => {
  const [isExposed, setIsExposed] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(20);

  const handleChangeCapacity = diff => {
    setMaxCapacity(prev => Math.max(1, prev + diff));
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        <View style={styles.cancelTitleRow}>
          <CancelReservationIcon width={24} height={24} />
          <Text style={[FONTS.fs_20_semibold, styles.cancelTitle]}>
            오늘의 파티 취소
          </Text>
        </View>

        <Text style={[FONTS.fs_14_regular, styles.cancelDescription]}>
          예기치 못한 상황으로 오늘 파티를 진행할 수 없는 경우 사용하세요. 모든
          예약자에게 즉시 알림이 발송됩니다.
        </Text>

        <TouchableOpacity activeOpacity={0.8} style={styles.cancelButton}>
          <Text style={[FONTS.fs_16_medium, styles.cancelButtonText]}>
            오늘 파티 취소하기
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[FONTS.fs_20_semibold, styles.sectionTitle]}>
          파티 노출 상태
        </Text>

        <View style={styles.sectionCard}>
          <View style={styles.exposureRow}>
            <View style={styles.exposureInfo}>
              <View style={styles.exposureTitleRow}>
                <Text style={[FONTS.fs_20_semibold, styles.partyTitle]}>
                  524 포틀럭 파티
                </Text>
                <View style={styles.exposureBadge}>
                  <Text style={[FONTS.fs_14_medium, styles.exposureBadgeText]}>
                    노출중
                  </Text>
                </View>
              </View>

              <Text style={[FONTS.fs_16_regular, styles.exposureDescription]}>
                현재 유저에게 노출 중입니다
              </Text>
            </View>

            <Switch
              value={isExposed}
              onValueChange={setIsExposed}
              trackColor={{
                false: COLORS.grayscale_300,
                true: COLORS.primary_orange,
              }}
              thumbColor={COLORS.grayscale_0}
              ios_backgroundColor={COLORS.grayscale_300}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[FONTS.fs_20_semibold, styles.sectionTitle]}>
          파티 최대 인원
        </Text>

        <View style={styles.sectionCard}>
          <Text style={[FONTS.fs_16_semibold, styles.capacityLabel]}>
            현재 신청: <Text style={styles.capacityValue}>8명</Text>
          </Text>

          <View style={styles.capacityControlRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.capacityButton}
              onPress={() => handleChangeCapacity(-1)}>
              <MinusIcon width={18} height={18} />
            </TouchableOpacity>

            <View style={styles.capacityInputBox}>
              <Text style={[FONTS.fs_20_medium, styles.capacityInputText]}>
                {maxCapacity}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.capacityButton}
              onPress={() => handleChangeCapacity(1)}>
              <PlusIcon width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Settings;
