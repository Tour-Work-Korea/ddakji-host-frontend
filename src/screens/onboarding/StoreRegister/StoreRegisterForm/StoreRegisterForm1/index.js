import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

import AlertModal from '@components/modals/AlertModal';
import { validateStoreForm1 } from '@utils/validation/storeRegisterValidation';
import { adaptiveCompressToJPEG } from '@utils/imageUploadHandler';
import { hostStorRegisterAgrees } from '@data/agree';
import styles from '../StoreRegisterForm.styles';
import { FONTS } from '@constants/fonts';
import Logo from '@assets/images/logo_blue.svg';
import { COLORS } from '@constants/colors';
import NextIcon from '@assets/images/arrow_right_white.svg';
import NextDisabledIcon from '@assets/images/arrow_right_black.svg';
import Photo from '@assets/images/Photo.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';

const StoreRegisterForm1 = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    img: { uri: '' },
    bankbookImg: { uri: '' },
    licenseImg: { uri: '' },
  });
  const [agreements, setAgreements] = useState(hostStorRegisterAgrees);
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '확인',
  });

  useEffect(() => {
    setIsAllAgreed(agreements.every(item => item.isAgree));
  }, [agreements]);

  const isNextEnabled = useMemo(() => {
    const errors = validateStoreForm1(formData);
    return errors.length === 0;
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAgreement = id => {
    setAgreements(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isAgree: !item.isAgree } : item,
      ),
    );
  };

  const renderCheckbox = (isChecked, onPress) => (
    <View>
      {isChecked ? (
        <TouchableOpacity
          style={[styles.checkbox, styles.checked]}
          onPress={onPress}>
          <CheckOrange width={24} height={24} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.checkbox} onPress={onPress}>
          <CheckGray width={24} height={24} />
        </TouchableOpacity>
      )}
    </View>
  );

  const pickImage = async (field) => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.length > 0) {
      const selected = result.assets[0];
      const originalUri = selected.uri;

      let compressedUri = originalUri;
      try {
        compressedUri = await adaptiveCompressToJPEG(originalUri, {
          targetBytes: 1.8 * 1024 * 1024,
          startMax: 1600,
          minMax: 800,
          startQuality: 0.8,
          minQuality: 0.55,
          stepQuality: 0.1,
        });
      } catch (error) {
        console.warn(`[StoreRegisterForm1] ${field} compress failed:`, error);
      }

      setFormData(prev => ({
        ...prev,
        [field]: {
          uri: compressedUri,
          type: 'image/jpeg',
          name: selected.fileName ?? `${field}.jpg`,
        },
      }));
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateStoreForm1(formData);

    if (validationErrors.length > 0) {
      setErrorModal({
        visible: true,
        title: validationErrors[0],
      });
      return;
    }

    if (!isAllAgreed) {
      setErrorModal({
        visible: true,
        title: '이용 약관에 동의해주세요.',
      });
      return;
    }

    navigation.navigate('StoreRegisterForm2', {
      prevData: {
        ...formData,
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.flexGrow}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.viewFlexBox}>
              <View>
                <View style={styles.groupParent}>
                  <Logo width={60} height={29} />
                  <View>
                    <Text style={styles.titleText}>
                      등록을 위한 필수 정보를 입력해주세요
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      사업자 등록 상호명 or 법인명
                    </Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="상호명 또는 법인명을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.name}
                        onChangeText={text => handleInputChange('name', text)}
                        maxLength={30}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업자 등록증 사본</Text>
                    <Text style={styles.hintText}>
                      주민등록번호 등 민감한 개인정보는 가리고 업로드해주세요.
                    </Text>
                    <TouchableOpacity
                      style={styles.documentUploadBox}
                      onPress={() => pickImage('img')}
                      activeOpacity={0.8}>
                      {formData?.img?.uri ? (
                        <Image
                          source={{ uri: formData.img.uri }}
                          style={styles.photoBox}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.photoContainer}>
                          <Photo width={30} height={30} />
                          <Text style={styles.imageUploadHint}>사진 업로드</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>통장 사본</Text>
                    <Text style={styles.hintText}>
                      정산을 지급받으실 계좌의 통장 사본을 업로드해주세요.
                    </Text>
                    <TouchableOpacity
                      style={styles.documentUploadBox}
                      onPress={() => pickImage('bankbookImg')}
                      activeOpacity={0.8}>
                      {formData?.bankbookImg?.uri ? (
                        <Image
                          source={{ uri: formData.bankbookImg.uri }}
                          style={styles.photoBox}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.photoContainer}>
                          <Photo width={30} height={30} />
                          <Text style={styles.imageUploadHint}>사진 업로드</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>영업 신고증 사본</Text>
                    <Text style={styles.hintText}>
                      최근 발급된 유효한 영업 신고증 사본을 업로드해주세요.
                    </Text>
                    <TouchableOpacity
                      style={styles.documentUploadBox}
                      onPress={() => pickImage('licenseImg')}
                      activeOpacity={0.8}>
                      {formData?.licenseImg?.uri ? (
                        <Image
                          source={{ uri: formData.licenseImg.uri }}
                          style={styles.photoBox}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.photoContainer}>
                          <Photo width={30} height={30} />
                          <Text style={styles.imageUploadHint}>사진 업로드</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.agreeGap}>
                    {agreements.map(item => (
                      <View style={styles.parentWrapperFlexBox} key={item.id}>
                        <View
                          style={[
                            styles.checkboxGroup,
                            styles.parentWrapperFlexBox,
                          ]}>
                          {renderCheckbox(item.isAgree, () =>
                            handleAgreement(item.id),
                          )}
                          <View
                            style={[
                              styles.frameContainer,
                              styles.parentWrapperFlexBox,
                            ]}>
                            <View
                              style={[
                                styles.parent,
                                styles.parentWrapperFlexBox,
                              ]}>
                              {item.isRequired ? (
                                <Text
                                  style={[
                                    styles.textRequired,
                                    styles.textBlue,
                                  ]}>
                                  [필수]
                                </Text>
                              ) : null}
                              <Text style={styles.textAgreeTitle}>
                                {item.title}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('AgreeDetail', {
                                  id: item.id,
                                  who: 'HOST',
                                })
                              }>
                              <Text style={[styles.textSmall, styles.textBlue]}>
                                보기
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.buttonLayout}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    (!isNextEnabled || !isAllAgreed) && styles.addButtonDisable,
                  ]}
                  onPress={handleSubmit}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.addButtonText,
                      (!isNextEnabled || !isAllAgreed) &&
                      styles.addButtonTextDisable,
                    ]}>
                    다음
                  </Text>
                  {isNextEnabled && isAllAgreed ? (
                    <NextIcon width={24} height={24} />
                  ) : (
                    <NextDisabledIcon width={24} height={24} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <AlertModal
          visible={errorModal.visible}
          title={errorModal.title}
          buttonText={'확인'}
          onPress={() => setErrorModal(prev => ({ ...prev, visible: false }))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default StoreRegisterForm1;
