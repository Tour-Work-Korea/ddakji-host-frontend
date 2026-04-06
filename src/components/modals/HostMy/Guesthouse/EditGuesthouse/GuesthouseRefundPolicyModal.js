import React, {useEffect, useMemo, useState} from 'react';
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
} from 'react-native';
import Toast from 'react-native-toast-message';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';
import PlusOrange from '@assets/images/plus_orange.svg';
import DeleteGray from '@assets/images/delete_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const DEFAULT_POLICY_DAYS = [1, 2, 3];

const normalizePolicies = (policies = []) =>
  [...policies]
    .filter(
      item =>
        Number(item?.daysBeforeCheckin) >= 1 &&
        item?.refundRate !== '' &&
        item?.refundRate !== null &&
        item?.refundRate !== undefined &&
        Number(item?.refundRate) >= 0 &&
        Number(item?.refundRate) <= 100 &&
        Number(item?.refundRate) !== 100,
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
  defaultPolicies = [],
  guesthouseId,
}) => {
  const [refundPolicies, setRefundPolicies] = useState([]);
  const [appliedData, setAppliedData] = useState([]);
  const [baselinePolicies, setBaselinePolicies] = useState([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [draftDays, setDraftDays] = useState('');
  const [draftRate, setDraftRate] = useState('');

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const fallbackPolicies = normalizePolicies(defaultPolicies);

    const syncRefundPolicies = async () => {
      if (!guesthouseId) {
        setRefundPolicies(fallbackPolicies);
        setAppliedData(fallbackPolicies);
        setBaselinePolicies(fallbackPolicies);
        return;
      }

      try {
        const response = await hostGuesthouseApi.getGuesthouseRefundPolicies(
          guesthouseId,
        );
        const serverPolicies = Array.isArray(response?.data?.policies)
          ? response.data.policies
          : Array.isArray(response?.data)
            ? response.data
            : [];
        const normalized = normalizePolicies(serverPolicies);
        setRefundPolicies(normalized);
        setAppliedData(normalized);
        setBaselinePolicies(normalized);
      } catch (error) {
        setRefundPolicies(fallbackPolicies);
        setAppliedData(fallbackPolicies);
        setBaselinePolicies(fallbackPolicies);
      }
    };

    syncRefundPolicies();
  }, [defaultPolicies, guesthouseId, visible]);

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
      setRefundPolicies(appliedData);
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
        {daysBeforeCheckin: days, refundRate: rate},
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

  const handleConfirm = async () => {
    const nextPolicies = normalizePolicies(refundPolicies);
    const hasChanged =
      JSON.stringify(nextPolicies) !== JSON.stringify(baselinePolicies);

    if (!guesthouseId) {
      Toast.show({
        type: 'error',
        text1: '수정 중 오류가 발생했어요.',
        position: 'top',
      });
      onClose();
      return;
    }

    if (!hasChanged) {
      onSelect?.(nextPolicies);
      onClose();
      return;
    }

    try {
      await hostGuesthouseApi.updateGuesthouseRefundPolicies(
        guesthouseId,
        nextPolicies,
      );

      Toast.show({
        type: 'success',
        text1: '수정이 등록되었습니다!',
        position: 'top',
      });

      setRefundPolicies(nextPolicies);
      setAppliedData(nextPolicies);
      setBaselinePolicies(nextPolicies);
      onSelect?.(nextPolicies);
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '수정 중 오류가 발생했어요.',
        position: 'top',
      });
      onClose();
    }
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
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -220 : 0}>
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <View style={styles.header}>
                  <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
                    취소 및 환불규정
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleModalClose}>
                    <XBtn width={24} height={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.body}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}>
                  <Text style={[FONTS.fs_16_medium, styles.policyTitle]}>
                    환불기준 설정
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.policyDescription]}>
                    환불기준을 입력해주세요. 해당 기준에 의해 환불 처리 됩니다.
                    {'\n'}
                    입력하지 않거나 <Text style={styles.policyWarning}>100% 환불</Text>인 날짜는 저장되지 않습니다.
                  </Text>

                  <View style={styles.policyList}>
                    {displayPolicies.map(policy => (
                      <View
                        key={policy.daysBeforeCheckin}
                        style={styles.policyRow}>
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
                              keyboardType="number-pad"
                              style={[FONTS.fs_14_medium, styles.valueInput]}
                              placeholder="100"
                              placeholderTextColor={COLORS.grayscale_400}
                              maxLength={3}
                            />
                          </View>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              styles.policyPercentLabel,
                            ]}>
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
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.addPolicyButton}
                    activeOpacity={0.8}
                    onPress={() => setAddModalVisible(true)}>
                    <View style={styles.plusBtn}>
                      <PlusOrange width={16} height={16} />
                    </View>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.addPolicyButtonText,
                      ]}>
                      환불기준 추가
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <ButtonScarlet
                  title="적용하기"
                  onPress={handleConfirm}
                  style={styles.submitButton}
                />

                <Modal
                  visible={addModalVisible}
                  transparent
                  onRequestClose={() => setAddModalVisible(false)}>
                  <TouchableWithoutFeedback
                    onPress={() => setAddModalVisible(false)}>
                    <View style={styles.addOverlay}>
                      <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.addModalContainer}>
                          <Text
                            style={[
                              FONTS.fs_20_semibold,
                              styles.addModalTitle,
                            ]}>
                            환불기준 추가
                          </Text>

                          <View style={styles.addFormRow}>
                            <Text
                              style={[FONTS.fs_16_medium, styles.addFormLabel]}>
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
                            <Text
                              style={[
                                FONTS.fs_16_medium,
                                styles.addFormSuffix,
                              ]}>
                              일전
                            </Text>
                            <Text
                              style={[
                                FONTS.fs_16_medium,
                                styles.addFormAmount,
                              ]}>
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
                            <Text
                              style={[
                                FONTS.fs_16_medium,
                                styles.addFormSuffix,
                              ]}>
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
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GuesthouseRefundPolicyModal;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
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
  policyTitle: {
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  policyDescription: {
    color: COLORS.grayscale_600,
    lineHeight: 18,
  },
  policyWarning: {
    color: COLORS.semantic_red,
  },
  policyList: {
    marginTop: 18,
    gap: 14,
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
  submitButton: {
    marginBottom: 0,
  },
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
  },
  addFormLabel: {
    color: COLORS.grayscale_800,
    marginRight: 8,
  },
  addInput: {
    width: 58,
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
    height: 48,
  },
});
