import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { FONTS } from '@constants/fonts';
import ReservationCheck from './ReservationCheck';
import Settings from './Settings';
import styles from './PartyReservation.styles';

const chips = ['신청 관리', '설정'];

const PartyReservation = ({ guesthouseId }) => {
  const [activeChip, setActiveChip] = useState(chips[0]);

  return (
    <View style={styles.container}>
      <View style={styles.chipRow}>
        {chips.map(chip => (
          <TouchableOpacity
            key={chip}
            activeOpacity={0.8}
            style={[styles.chip, activeChip === chip && styles.chipActive]}
            onPress={() => setActiveChip(chip)}>
            <Text
              style={[
                FONTS.fs_14_medium,
                activeChip === chip ? styles.chipTextActive : styles.chipText,
              ]}>
              {chip}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeChip === chips[0] ? (
        <ReservationCheck guesthouseId={guesthouseId} />
      ) : (
        <Settings guesthouseId={guesthouseId} />
      )}
    </View>
  );
};

export default PartyReservation;
