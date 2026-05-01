import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { FONTS } from '@constants/fonts';
import MyGuesthouse from './MyGuesthouse';
import ReviewManagement from './ReviewManagement';
import styles from './GuesthouseInfo.styles';

const chips = ['나의 게하', '리뷰 관리'];

const GuesthouseInfo = props => {
  const [activeChip, setActiveChip] = useState(
    chips.includes(props.initialChip) ? props.initialChip : chips[0],
  );
  const reviewGuesthouseId =
    props.guesthouseDetail?.id ??
    props.effectiveGuesthouseId ??
    props.routeGuesthouseId ??
    null;
  const hasReviewGuesthouse = !!reviewGuesthouseId;

  useEffect(() => {
    if (chips.includes(props.initialChip)) {
      setActiveChip(props.initialChip);
    }
  }, [props.initialChip]);

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
          activeOpacity={hasReviewGuesthouse ? 0.8 : 1}
          style={[styles.chip, activeChip === chips[1] && styles.chipActive]}
          disabled={!hasReviewGuesthouse}
          onPress={() => {
            if (!hasReviewGuesthouse) {
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

      {activeChip === chips[1] && hasReviewGuesthouse ? (
        <ReviewManagement guesthouseId={reviewGuesthouseId} />
      ) : (
        <MyGuesthouse {...props} />
      )}
    </>
  );
};

export default GuesthouseInfo;
