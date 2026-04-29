import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  validateStoreForm,
  validateStoreForm2,
} from '@utils/validation/storeRegisterValidation';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import hostMyApi from '@utils/api/hostMyApi';
import { normalizeHostProfile } from '@utils/hostProfile';
import AlertModal from '@components/modals/AlertModal';
import { uploadSingleImage } from '@utils/imageUploadHandler';
import useUserStore from '@stores/userStore';

import styles from '../StoreRegisterForm.styles';
import Photo from '@assets/images/Photo.svg';
import NextIcon from '@assets/images/arrow_right_white.svg';
import NextDisabledIcon from '@assets/images/arrow_right_black.svg';
import Logo from '@assets/images/logo_orange.svg';
import { COLORS } from '@constants/colors';

const StoreRegisterForm2 = ({ route }) => {
  const navigation = useNavigation();
  const { prevData } = route.params;
  const hostProfile = useUserStore(state => state.hostProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const [formData, setFormData] = useState({
    ...prevData,
    guesthouseName: '',
    profileImg: '',
  });
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '확인',
  });

  const isNextEnabled = useMemo(() => {
    const errors = validateStoreForm2(formData);
    return errors.length === 0;
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    const uploadedUrl = await uploadSingleImage();
    if (!uploadedUrl) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      profileImg: uploadedUrl,
    }));
  };

  const resolveApplicationId = response => {
    const applicationId = response?.data?.applicationId;

    if (Number.isFinite(Number(applicationId)) && Number(applicationId) > 0) {
      return Number(applicationId);
    }

    return null;
  };

  const syncHostProfile = async () => {
    const { updateProfile } = require('@utils/auth/login');
    await updateProfile('HOST');
  };

  const handleSubmit = async () => {
    const validationErrors = validateStoreForm(formData);

    if (validationErrors.length > 0) {
      setErrorModal({
        visible: true,
        title: validationErrors[0],
      });
      return;
    }

    const form = new FormData();
    const dto = {
      name: formData.name,
      employeeCount: 0,
      address: formData.address,
      managerName: hostProfile?.name ?? '',
      managerEmail: hostProfile?.email ?? '',
      businessPhone: formData.businessPhone,
      businessType: formData.businessType,
    };

    form.append('dto', {
      string: JSON.stringify(dto),
      type: 'application/json',
    });

    if (formData.img?.uri) {
      form.append('img', {
        uri: formData.img.uri,
        name: formData.img.name,
        type: formData.img.type,
      });
    }

    try {
      const applicationResponse = await hostGuesthouseApi.postHostApplication(
        form,
      );
      const applicationId = resolveApplicationId(applicationResponse);

      if (!applicationId) {
        throw new Error('applicationId not found');
      }

      await hostGuesthouseApi.tempCreateGuesthouse({
        applicationId,
        guesthouseName: formData.guesthouseName.trim(),
        guesthouseProfileImage: formData.profileImg,
      });

      await syncHostProfile();

      navigation.replace('StoreRegisterComplete', {
        businessName: formData.name,
      });
    } catch (error) {
      console.warn('입점신청서 등록 실패:', error);
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          '입점신청서 등록 중 오류가 발생했습니다',
      });
    }
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
                    <Text style={styles.inputLabel}>게스트하우스 명</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="게스트하우스 이름을 작성해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.guesthouseName}
                        onChangeText={text =>
                          handleInputChange('guesthouseName', text)
                        }
                        maxLength={30}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      게스트하우스 프로필 사진 업로드
                    </Text>
                    <Text style={styles.imageUploadHint}>
                      게스트하우스 대표할 프로필 사진을 업로드해주세요
                    </Text>
                    <View
                      style={[
                        styles.inputBox,
                        styles.imageBox,
                        styles.profileImageUploadBox,
                      ]}>
                      <TouchableOpacity
                        style={styles.photoBox}
                        onPress={pickImage}>
                        {formData.profileImg ? (
                          <Image
                            source={{ uri: formData.profileImg }}
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
                </View>
              </View>

              <View style={styles.buttonLayout}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    styles.addButtonLocation,
                    !isNextEnabled && styles.addButtonDisable,
                  ]}
                  onPress={handleSubmit}>
                  <Text
                    style={[
                      styles.addButtonText,
                      !isNextEnabled && styles.addButtonTextDisable,
                    ]}>
                    등록하기
                  </Text>
                  {isNextEnabled ? (
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

export default StoreRegisterForm2;
