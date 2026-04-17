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
import {useEffect, useMemo, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import AlertModal from '@components/modals/AlertModal';
import {uploadSingleImage} from '@utils/imageUploadHandler';
import useUserStore from '@stores/userStore';

import styles from '../StoreRegisterForm.styles';
import Photo from '@assets/images/Photo.svg';
import CheckWhiteIcon from '@assets/images/check_white.svg';
import BackIcon from '@assets/images/chevron_left_black.svg';
import Logo from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';

const StoreRegisterEditForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {guesthouseId} = route.params ?? {};
  const hostProfile = useUserStore(state => state.hostProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const [formData, setFormData] = useState({
    guesthouseName: '',
    profileImg: '',
  });
  const [savedFormData, setSavedFormData] = useState({
    guesthouseName: '',
    profileImg: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '확인',
  });
  const currentGuesthouseProfile = useMemo(() => {
    const profiles = Array.isArray(hostProfile?.guesthouseProfiles)
      ? hostProfile.guesthouseProfiles
      : [];

    return (
      profiles.find(
        profile => String(profile?.guesthouseId) === String(guesthouseId),
      ) || null
    );
  }, [guesthouseId, hostProfile?.guesthouseProfiles]);

  useEffect(() => {
    if (!guesthouseId || !currentGuesthouseProfile) {
      setErrorModal({
        visible: true,
        title: '게스트하우스 정보를 불러오지 못했습니다.',
        buttonText: '확인',
      });
      setIsLoading(false);
      return;
    }

    const nextFormData = {
      guesthouseName: currentGuesthouseProfile?.guesthouseName ?? '',
      profileImg: currentGuesthouseProfile?.profileImageUrl ?? '',
    };

    setFormData(nextFormData);
    setSavedFormData(nextFormData);
    setIsLoading(false);
  }, [currentGuesthouseProfile, guesthouseId]);

  const isSubmitEnabled = useMemo(() => {
    const trimmedName = formData.guesthouseName.trim();

    if (!trimmedName || isLoading || isSubmitting) {
      return false;
    }

    return (
      trimmedName !== savedFormData.guesthouseName ||
      formData.profileImg !== savedFormData.profileImg
    );
  }, [formData, isLoading, isSubmitting, savedFormData]);

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

  const handleSubmit = async () => {
    if (!isSubmitEnabled) {
      return;
    }

    const trimmedName = formData.guesthouseName.trim();
    const payload = {};

    if (trimmedName !== savedFormData.guesthouseName) {
      payload.guesthouseName = trimmedName;
    }

    if (formData.profileImg !== savedFormData.profileImg) {
      payload.profileImageUrl = formData.profileImg || null;
    }

    try {
      setIsSubmitting(true);
      await hostGuesthouseApi.updateGuesthouseProfile(guesthouseId, payload);
      const nextGuesthouseProfiles = Array.isArray(hostProfile?.guesthouseProfiles)
        ? hostProfile.guesthouseProfiles.map(profile =>
            String(profile?.guesthouseId) === String(guesthouseId)
              ? {
                  ...profile,
                  guesthouseName:
                    payload.guesthouseName ?? profile?.guesthouseName ?? '',
                  profileImageUrl:
                    payload.profileImageUrl !== undefined
                      ? payload.profileImageUrl
                      : profile?.profileImageUrl ?? null,
                }
              : profile,
          )
        : [];

      setHostProfile({
        ...hostProfile,
        guesthouseProfiles: nextGuesthouseProfiles,
      });
      setSavedFormData({
        guesthouseName: trimmedName,
        profileImg: formData.profileImg,
      });
      Toast.show({
        type: 'success',
        text1: '수정되었어요!',
        position: 'top',
        visibilityTime: 2000,
      });
      navigation.goBack();
    } catch (error) {
      console.warn('게스트하우스 프로필 수정 실패:', error);
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          '게스트하우스 수정 중 오류가 발생했습니다.',
        buttonText: '확인',
      });
    } finally {
      setIsSubmitting(false);
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
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.goBack()}
                  style={{alignSelf: 'flex-start', marginBottom: 20}}>
                  <BackIcon width={24} height={24} />
                </TouchableOpacity>

                <View style={styles.groupParent}>
                  <Logo width={60} height={29} />
                  <View>
                    <Text style={styles.titleText}>
                      게스트하우스 정보 수정
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
                            source={{uri: formData.profileImg}}
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
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={!isSubmitEnabled}>
                  <Text style={styles.addButtonText}>수정하기</Text>
                  <CheckWhiteIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <AlertModal
          visible={errorModal.visible}
          title={errorModal.title}
          buttonText={errorModal.buttonText}
          onPress={() => {
            setErrorModal(prev => ({...prev, visible: false}));
            if (!guesthouseId || !savedFormData.guesthouseName) {
              navigation.goBack();
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default StoreRegisterEditForm;
