import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {
  describeMultiNightDiscount,
  validateMultiNightDiscount,
} from '@utils/multiNightDiscount';
import EnabledRadio from '@assets/images/radio_button_enabled.svg';
import DisabledRadio from '@assets/images/radio_button_disabled.svg';

const MultiNightDiscountForm = ({value, onChange, roomType}) => {
  const policy = value ?? {enabled: false};
  const update = patch => onChange({...policy, ...patch});
  const error = validateMultiNightDiscount(policy);
  const choice = (field, option, label) => {
    const selected = policy[field] === option;
    return (
      <TouchableOpacity
        key={option}
        accessibilityRole="radio"
        accessibilityState={{checked: selected}}
        accessibilityLabel={label}
        style={styles.choice}
        onPress={() =>
          update(
            field === 'type' ? {type: option, value: ''} : {[field]: option},
          )
        }>
        {selected ? (
          <EnabledRadio width={24} height={24} />
        ) : (
          <DisabledRadio width={24} height={24} />
        )}
        <Text style={[FONTS.fs_14_regular, styles.text]}>{label}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={[FONTS.fs_16_medium, styles.text]}>연박할인</Text>
        <View style={styles.toggle}>
          <Text style={[FONTS.fs_12_medium, styles.muted]}>
            {policy.enabled ? '적용' : '미적용'}
          </Text>
          <Switch
            accessibilityLabel="연박할인 적용"
            value={!!policy.enabled}
            trackColor={{
              true: COLORS.primary_orange,
              false: COLORS.grayscale_300,
            }}
            onValueChange={enabled =>
              onChange(
                enabled
                  ? {
                      enabled: true,
                      basis: policy.basis ?? 'ADDITIONAL_NIGHTS',
                      type: policy.type ?? 'FIXED',
                      value: policy.value ?? '',
                    }
                  : {enabled: false},
              )
            }
          />
        </View>
      </View>
      {policy.enabled && (
        <>
          <View style={styles.options}>
            {choice('basis', 'ADDITIONAL_NIGHTS', '추가 1박당 할인')}
            {choice('basis', 'ENTIRE_STAY', '전체 객실 금액 할인')}
          </View>
          <View style={styles.options}>
            {choice('type', 'FIXED', '정액 할인')}
            {choice('type', 'PERCENT', '정률 할인')}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              accessibilityLabel={
                policy.type === 'PERCENT' ? '연박 할인율' : '연박 할인 금액'
              }
              style={[FONTS.fs_14_regular, styles.input]}
              keyboardType="number-pad"
              value={String(policy.value ?? '')}
              placeholder={policy.type === 'PERCENT' ? '1~99' : '100원 이상'}
              placeholderTextColor={COLORS.grayscale_400}
              onChangeText={text => {
                if (/^\d*$/.test(text)) {
                  update({value: text});
                }
              }}
            />
            <Text style={styles.text}>
              {policy.type === 'PERCENT' ? '%' : '원'} 할인
            </Text>
          </View>
          {!!error && (
            <Text
              accessibilityRole="alert"
              style={[FONTS.fs_12_medium, styles.error]}>
              {error}
            </Text>
          )}
          {!error && (
            <Text style={[FONTS.fs_12_medium, styles.description]}>
              {describeMultiNightDiscount(policy)}
            </Text>
          )}
          <Text style={[FONTS.fs_12_medium, styles.muted]}>
            {roomType === 'DORMITORY'
              ? '1베드 기준이며, 예약 베드 수만큼 적용됩니다.'
              : '추가 인원 요금은 할인 대상에서 제외됩니다.'}
          </Text>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  section: {marginTop: 24, marginBottom: 20, gap: 12},
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {flexDirection: 'row', alignItems: 'center', gap: 8},
  options: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  choice: {flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44},
  text: {color: COLORS.grayscale_900},
  muted: {color: COLORS.grayscale_500},
  inputRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    color: COLORS.grayscale_900,
  },
  error: {color: COLORS.semantic_red},
  description: {color: COLORS.grayscale_700, lineHeight: 20},
});
export default MultiNightDiscountForm;
