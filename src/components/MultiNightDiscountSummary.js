import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {describeMultiNightDiscount} from '@utils/multiNightDiscount';

const MultiNightDiscountSummary = ({policy, compact = false}) => {
  const description = describeMultiNightDiscount(policy);
  if (!description) {
    return null;
  }
  return (
    <Text style={[FONTS.fs_12_medium, styles.text]}>
      {compact ? '연박할인 적용' : description}
    </Text>
  );
};
const styles = StyleSheet.create({
  text: {color: COLORS.primary_orange, marginTop: 6, lineHeight: 18},
});
export default MultiNightDiscountSummary;
