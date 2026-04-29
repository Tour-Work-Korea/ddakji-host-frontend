import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import ButtonScarlet from '@components/ButtonScarlet';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import XBtn from '@assets/images/x_gray.svg';
import PlusOrange from '@assets/images/plus_orange.svg';
import DeleteGray from '@assets/images/delete_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const DEFAULT_POLICY_DAYS = [1, 2, 3, 4, 5, 6, 7];

const DEFAULT_POLICY_RATE_MAP = {
  1: '0',
  2: '0',
  3: '30',
  4: '40',
  5: '50',
  6: '50',
  7: '100',
};

const normalizePolicies = (policies = []) =>
  [...policies]
    .filter(
      item =>
        Number(item?.daysBeforeCheckin) >= 1 &&
        item?.refundRate !== '' &&
        item?.refundRate !== null &&
        item?.refundRate !== undefined &&
        Number(item?.refundRate) >= 0 &&
        Number(item?.refundRate) <= 100,
    )
    .map(item => ({
      daysBeforeCheckin: Number(item.daysBeforeCheckin),
      refundRate: Number(item.refundRate),
    }))
    .sort((a, b) => a.daysBeforeCheckin - b.daysBeforeCheckin);

const GuesthouseRefundPolicyModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
}) => {
  const [refundNotice, setRefundNotice] = useState('');
  const [refundPolicies, setRefundPolicies] = useState([]);
  const [appliedData, setAppliedData] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [draftDays, setDraftDays] = useState('');
  const [draftRate, setDraftRate] = useState('');

  const { keyboardHeight, registerInput, scrollRef } = useKeyboardAwareScrollView({ iosOnly: false });
  const isKeyboardVisible = keyboardHeight > 0;

  // Keyboard visibility handled by useKeyboardAwareScrollView

  useEffect(() => {
    if (visible && appliedData) {
      setRefundNotice(appliedData.refundNotice);
      setRefundPolicies(appliedData.refundPolicies);
    }
  }, [appliedData, visible]);

  const sortedPolicies = useMemo(
    () => normalizePolicies(refundPolicies),
    [refundPolicies],
  );
  const displayPolicies = useMemo(() => {
    const dayMap = new Map(
      refundPolicies.map(item => [
        Number(item.daysBeforeCheckin),
        item?.refundRate === null || item?.refundRate === undefined
          ? ''
          : String(item.refundRate),
      ]),
    );
    const mergedDays = Array.from(
      new Set([
        ...DEFAULT_POLICY_DAYS,
        ...refundPolicies
          .map(item => Number(item.daysBeforeCheckin))
          .filter(day => Number.isInteger(day) && day >= 1),
      ]),
    ).sort((a, b) => a - b);

    return mergedDays.map(daysBeforeCheckin => ({
      daysBeforeCheckin,
      refundRate: dayMap.get(daysBeforeCheckin) ?? '',
      isDefault: DEFAULT_POLICY_DAYS.includes(daysBeforeCheckin),
    }));
  }, [refundPolicies]);

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        setRefundNotice(appliedData.refundNotice);
        setRefundPolicies(appliedData.refundPolicies);
      } else {
        setRefundNotice('');
        setRefundPolicies([]);
      }
    }
    setAddModalVisible(false);
    setDraftDays('');
    setDraftRate('');
    onClose();
  };

  const handleOverlayPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }

    if (addModalVisible) {
      setAddModalVisible(false);
      return;
    }

    handleModalClose();
  };

  const handleAddPolicy = () => {
    const days = Number(draftDays);
    const rate = Number(draftRate);

    if (!Number.isInteger(days) || days < 1) {
      return;
    }

    if (!Number.isInteger(rate) || rate < 0 || rate > 100) {
      return;
    }

    setRefundPolicies(prev =>
      normalizePolicies([
        ...prev.filter(item => Number(item.daysBeforeCheckin) !== days),
        { daysBeforeCheckin: days, refundRate: rate },
      ]),
    );
    setDraftDays('');
    setDraftRate('');
    setAddModalVisible(false);
  };

  const handlePolicyRateChange = (daysBeforeCheckin, text) => {
    const sanitized = text.replace(/[^0-9]/g, '').slice(0, 3);

    setRefundPolicies(prev => {
      const next = prev.filter(
        item => Number(item.daysBeforeCheckin) !== Number(daysBeforeCheckin),
      );

      return [
        ...next,
        {
          daysBeforeCheckin: Number(daysBeforeCheckin),
          refundRate: sanitized,
        },
      ].sort((a, b) => a.daysBeforeCheckin - b.daysBeforeCheckin);
    });
  };

  const handleRemovePolicy = daysBeforeCheckin => {
    if (DEFAULT_POLICY_DAYS.includes(Number(daysBeforeCheckin))) {
      handlePolicyRateChange(daysBeforeCheckin, '');
      return;
    }

    setRefundPolicies(prev =>
      prev.filter(
        item => Number(item.daysBeforeCheckin) !== Number(daysBeforeCheckin),
      ),
    );
  };

  const handleConfirm = () => {
    const policiesWithDefaults = displayPolicies.map(p => ({
      daysBeforeCheckin: p.daysBeforeCheckin,
      refundRate:
        p.refundRate === ''
          ? DEFAULT_POLICY_RATE_MAP[p.daysBeforeCheckin] ?? ''
          : p.refundRate,
    }));

    const nextPolicies = normalizePolicies(policiesWithDefaults);
    setAppliedData({
      refundNotice,
      refundPolicies: nextPolicies,
    });
    onSelect?.({
      refundPolicies: nextPolicies,
      refundNotice,
    });
    onClose();
  };

  const isAddDisabled =
    !Number.isInteger(Number(draftDays)) ||
    Number(draftDays) < 1 ||
    !Number.isInteger(Number(draftRate)) ||
    Number(draftRate) < 0 ||
    Number(draftRate) > 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleOverlayPress}
        />
        <View style={[styles.modalContainer, { paddingBottom: isKeyboardVisible ? keyboardHeight + 10 : 40 }]}>
            <View style={styles.header}>
              <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
                취소 및 환불규정
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.sectionHeader}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                  추가 안내사항 (선택)
                </Text>
                <Text style={[FONTS.fs_12_light, styles.countText]}>
                  <Text style={styles.countTextActive}>{refundNotice.length}</Text>
                  /5,000
                </Text>
              </View>

              <TextInput
                style={[styles.noticeInput, FONTS.fs_14_regular]}
                multiline
                maxLength={5000}
                placeholder="취소 및 환불 시 안내할 내용을 작성해주세요"
                placeholderTextColor={COLORS.grayscale_400}
                value={refundNotice}
                onChangeText={setRefundNotice}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.rewriteButton}
                onPress={() => setRefundNotice('')}>
                <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>
                  다시쓰기
                </Text>
              </TouchableOpacity>

              <Text style={[FONTS.fs_16_medium, styles.policyTitle]}>
                환불기준 설정
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.policyDescription]}>
                환불기준을 입력해주세요. 해당 기준에 의해 환불 처리 됩니다.
                {'\n'}
                설정하시지 않은 날짜는 <Text style={styles.policyWarning}>100% 환불 </Text>됩니다.
              </Text>

              <View style={styles.policyList}>
                <View style={styles.policyRow}>
                  <View style={styles.policyContent}>
                    <Text style={[FONTS.fs_14_medium, styles.policyLabel]}>
                      방문 당일
                    </Text>
                    <Text style={[FONTS.fs_14_medium, styles.policyAmountLabel]}>
                      취소 및 환불 불가
                    </Text>
                  </View>
                </View>

                {displayPolicies.map(policy => {
                  const field = registerInput(`policy-${policy.daysBeforeCheckin}`);
                  return (
                  <View
                    key={policy.daysBeforeCheckin}
                    style={styles.policyRow}
                    onLayout={field.onLayout}
                  >
                    <View style={styles.policyContent}>
                      <Text style={[FONTS.fs_14_medium, styles.policyLabel]}>
                        {`방문 ${policy.daysBeforeCheckin}일전`}
                      </Text>
                      <Text style={[FONTS.fs_14_medium, styles.policyAmountLabel]}>
                        총금액의
                      </Text>
                      <View style={styles.valueBox}>
                        <TextInput
                          value={policy.refundRate}
                          onChangeText={text =>
                            handlePolicyRateChange(
                              policy.daysBeforeCheckin,
                              text,
                            )
                          }
                          onFocus={field.onFocus}
                          keyboardType="number-pad"
                          style={[FONTS.fs_14_medium, styles.valueInput]}
                          placeholder={DEFAULT_POLICY_RATE_MAP[policy.daysBeforeCheckin] ?? '100'}
                          placeholderTextColor={COLORS.grayscale_400}
                          maxLength={3}
                        />
                      </View>
                      <Text style={[FONTS.fs_14_medium, styles.policyPercentLabel]}>
                        % 환불
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removePolicyButton}
                      activeOpacity={0.8}
                      onPress={() =>
                        handleRemovePolicy(policy.daysBeforeCheckin)
                      }>
                      <DeleteGray width={18} height={18} />
                    </TouchableOpacity>
                  </View>
                )})}
              </View>

              <TouchableOpacity
                style={styles.addPolicyButton}
                activeOpacity={0.8}
                onPress={() => setAddModalVisible(true)}>
                <View style={styles.plusBtn}>
                  <PlusOrange width={16} height={16} />
                </View>
                <Text style={[FONTS.fs_14_medium, styles.addPolicyButtonText]}>
                  환불기준 추가
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <ButtonScarlet
              title="적용하기"
              onPress={handleConfirm}
              disabled={sortedPolicies.length === 0}
              style={styles.submitButton}
            />

            <Modal
              visible={addModalVisible}
              transparent
              onRequestClose={() => setAddModalVisible(false)}>
              <KeyboardAvoidingView 
                style={styles.addOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={() => setAddModalVisible(false)}
                />
                <View style={styles.addModalContainer}>
                  <Text style={[FONTS.fs_20_semibold, styles.addModalTitle]}>
                    환불기준 추가
                  </Text>

                  <View style={styles.addFormRow}>
                    <Text style={[FONTS.fs_16_medium, styles.addFormLabel]}>
                      방문
                    </Text>
                    <TextInput
                      value={draftDays}
                      onChangeText={text =>
                        setDraftDays(text.replace(/[^0-9]/g, ''))
                      }
                      keyboardType="number-pad"
                      style={[styles.addInput, FONTS.fs_16_medium]}
                      maxLength={3}
                    />
                    <Text style={[FONTS.fs_16_medium, styles.addFormSuffix]}>
                      일전
                    </Text>
                    <Text style={[FONTS.fs_16_medium, styles.addFormAmount]}>
                      총금액의
                    </Text>
                    <TextInput
                      value={draftRate}
                      onChangeText={text =>
                        setDraftRate(text.replace(/[^0-9]/g, ''))
                      }
                      keyboardType="number-pad"
                      style={[styles.addInput, FONTS.fs_16_medium]}
                      maxLength={3}
                    />
                    <Text style={[FONTS.fs_16_medium, styles.addFormSuffix]}>
                      % 환불
                    </Text>
                  </View>

                  <View style={styles.addButtonRow}>
                    <ButtonWhite
                      title="취소"
                      onPress={() => setAddModalVisible(false)}
                      style={styles.modalActionButton}
                    />
                    <ButtonScarlet
                      title="추가하기"
                      onPress={handleAddPolicy}
                      disabled={isAddDisabled}
                      style={styles.modalActionButton}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>
          </View>
      </View>
    </Modal>
  );
};

export default GuesthouseRefundPolicyModal;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  body: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.grayscale_800,
  },
  countText: {
    color: COLORS.grayscale_400,
  },
  countTextActive: {
    color: COLORS.primary_orange,
  },
  noticeInput: {
    minHeight: 154,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    color: COLORS.grayscale_800,
  },
  rewriteButton: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  rewriteText: {
    color: COLORS.grayscale_500,
  },
  policyTitle: {
    color: COLORS.grayscale_800,
    marginTop: 22,
    marginBottom: 8,
  },
  policyDescription: {
    color: COLORS.grayscale_600,
    lineHeight: 18,
  },
  policyWarning: {
    color: COLORS.semantic_red,
  },

  //  환불 기준 리스트
  policyList: {
    marginTop: 18,
    gap: 24,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  policyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  policyLabel: {
    marginRight: 20,
    color: COLORS.grayscale_700,
  },
  policyAmountLabel: {
    color: COLORS.grayscale_700,
    textAlign: 'center',
  },
  valueBox: {
    width: 56,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  valueInput: {
    width: '100%',
    color: COLORS.grayscale_700,
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  valueBoxText: {
    color: COLORS.grayscale_700,
  },
  policyPercentLabel: {
    width: 52,
    marginLeft: 8,
    color: COLORS.grayscale_700,
    textAlign: 'center',
  },
  removePolicyButton: {
    width: 28,
    height: 28,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 추가 버튼
  plusBtn: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
  },
  addPolicyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 18,
    marginBottom: 20,
  },
  addPolicyButtonText: {
    marginLeft: 4,
  },

  // 적용
  submitButton: {
    marginBottom: 0,
  },

  // 환불기준 추가 모달
  addOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.modal_background,
  },
  addModalContainer: {
    backgroundColor: COLORS.grayscale_0,
    width: '90%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  addModalTitle: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
    marginBottom: 20,
  },
  addFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'center',
  },
  addFormLabel: {
    color: COLORS.grayscale_800,
    marginRight: 8,
  },
  addInput: {
    width: 52,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    textAlign: 'center',
    color: COLORS.grayscale_800,
    paddingVertical: 0,
    paddingHorizontal: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  addFormSuffix: {
    color: COLORS.grayscale_700,
    marginLeft: 8,
  },
  addFormAmount: {
    color: COLORS.grayscale_700,
    marginLeft: 12,
    marginRight: 8,
  },
  addButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionButton: {
    flex: 1,
  },
});
