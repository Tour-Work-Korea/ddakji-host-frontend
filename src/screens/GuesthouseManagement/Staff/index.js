import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {FONTS} from '@constants/fonts';
import ApplicantCheck from './ApplicantCheck';
import StaffPosting from './StaffPosting';
import styles from './Staff.styles';

const chips = ['스탭 공고', '지원서 조회'];

const Staff = ({guesthouseId}) => {
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
        <StaffPosting guesthouseId={guesthouseId} />
      ) : (
        <ApplicantCheck guesthouseId={guesthouseId} />
      )}
    </View>
  );
};

export default Staff;
