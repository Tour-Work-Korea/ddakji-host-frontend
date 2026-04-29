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
import {useEffect, useMemo, useState, useRef} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';

import AlertModal from '@components/modals/AlertModal';
import AddressSearchModal from '@components/modals/AddressSearchModal';
import {validateStoreForm1} from '@utils/validation/storeRegisterValidation';
import {adaptiveCompressToJPEG} from '@utils/imageUploadHandler';
import {hostStorRegisterAgrees} from '@data/agree';
import styles from '../StoreRegisterForm.styles';
import {FONTS} from '@constants/fonts';
import Logo from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';
import NextIcon from '@assets/images/arrow_right_white.svg';
import NextDisabledIcon from '@assets/images/arrow_right_black.svg';
import Photo from '@assets/images/Photo.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';

const StoreRegisterForm1 = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    img: {uri: ''},
    businessPhone: '',
    businessType: '',
  });
  const [detailAddress, setDetailAddress] = useState('');
  const detailAddressRef = useRef(null);
  const [agreements, setAgreements] = useState(hostStorRegisterAgrees);
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [addressSearchVisible, setAddressSearchVisible] = useState(false);
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
        item.id === id ? {...item, isAgree: !item.isAgree} : item,
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

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
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
        console.warn('[StoreRegisterForm1] business cert compress failed:', error);
      }

      setFormData(prev => ({
        ...prev,
        img: {
          uri: compressedUri,
          type: 'image/jpeg',
          name: selected.fileName ?? 'business_cert.jpg',
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
        address: `${formData.address} ${detailAddress}`.trim(),
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
                    <Text style={[FONTS.fs_14_medium, { color: COLORS.semantic_red, marginTop: 4 }]}>
                      사업자등록증에 있는 정보로 작성해주세요
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
                    <Text style={styles.inputLabel}>사업자 유형</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="사업장 유형을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.businessType}
                        onChangeText={text =>
                          handleInputChange('businessType', text)
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업장 전화번호</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        value={formData.businessPhone}
                        placeholder="-없이 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        onChangeText={text =>
                          handleInputChange(
                            'businessPhone',
                            text.replace(/[^0-9]/g, ''),
                          )
                        }
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업자 주소</Text>
                    <View style={[styles.inputBox, styles.inputRelative]}>
                      <TextInput
                        style={[styles.textInput, styles.flex]}
                        placeholder="주소를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.address}
                        editable={false}
                      />
                      <TouchableOpacity
                        style={[
                          styles.inputButtonAbsolute,
                          {backgroundColor: COLORS.primary_orange},
                        ]}
                        onPress={() => setAddressSearchVisible(true)}>
                        <Text
                          style={{
                            ...FONTS.fs_14_medium,
                            color: COLORS.grayscale_0,
                          }}>
                          주소 검색
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputBox}>
                      <TextInput
                        ref={detailAddressRef}
                        style={styles.textInput}
                        placeholder="상세 주소를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={detailAddress}
                        onChangeText={setDetailAddress}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업자 등록증 업로드</Text>
                    <View style={[styles.inputBox, styles.imageBox]}>
                      <TouchableOpacity
                        style={styles.photoBox}
                        onPress={pickImage}>
                        {formData?.img?.uri ? (
                          <Image
                            source={{uri: formData.img.uri}}
                            style={styles.photoBox}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.photoContainer}>
                            <Photo width={30} height={30} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
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

        <AddressSearchModal
          visible={addressSearchVisible}
          onClose={() => setAddressSearchVisible(false)}
          onSelected={data => {
            setFormData(prev => ({...prev, address: data.address}));
            setAddressSearchVisible(false);
            setTimeout(() => {
              detailAddressRef.current?.focus();
            }, 300);
          }}
        />

        <AlertModal
          visible={errorModal.visible}
          title={errorModal.title}
          buttonText={'확인'}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default StoreRegisterForm1;
