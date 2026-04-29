import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { FONTS } from '@constants/fonts';
import MyGuesthouse from './MyGuesthouse';
import ReviewManagement from './ReviewManagement';
import styles from './GuesthouseInfo.styles';

const chips = ['나의 게하', '리뷰 관리'];

const GuesthouseInfo = props => {
  const [activeChip, setActiveChip] = useState(chips[0]);
  const hasGuesthouseDetail = !!props.guesthouseDetail;

  return (
    <>
      <View style={styles.chipRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.chip, activeChip === chips[0] && styles.chipActive]}
          onPress={() => setActiveChip(chips[0])}>
          <Text
            style={[
              FONTS.fs_14_medium,
              activeChip === chips[0] ? styles.chipTextActive : styles.chipText,
            ]}>
            {chips[0]}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={hasGuesthouseDetail ? 0.8 : 1}
          style={[styles.chip, activeChip === chips[1] && styles.chipActive]}
          disabled={!hasGuesthouseDetail}
          onPress={() => {
            if (!hasGuesthouseDetail) {
              return;
            }
            setActiveChip(chips[1]);
          }}>
          <Text
            style={[
              FONTS.fs_14_medium,
              activeChip === chips[1] ? styles.chipTextActive : styles.chipText,
            ]}>
            {chips[1]}
          </Text>
        </TouchableOpacity>
      </View>

      {activeChip === chips[1] && hasGuesthouseDetail ? (
        <ReviewManagement guesthouseId={props.guesthouseDetail.id} />
      ) : (
        <MyGuesthouse {...props} />
      )}
    </>
  );
};

export default GuesthouseInfo;
