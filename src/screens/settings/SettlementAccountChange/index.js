import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Header from '@components/Header';
import ChevronDownGray from '@assets/images/chevron_right_gray.svg'; // Reuse a gray arrow
import InfoIconRed from '@assets/images/info_circle_red.svg';
import settlementApi from '@utils/api/settlementApi';
import { adaptiveCompressToJPEG, generateUniqueFilename } from '@utils/imageUploadHandler';

import styles from './SettlementAccountChange.styles';
import {COLORS} from '@constants/colors';

const SettlementAccountChange = () => {
  const route = useRoute();
  const guesthouseId = route.params?.guesthouseId;

  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankbookImg, setBankbookImg] = useState(null);
  const [isBankModalVisible, setBankModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bankList, setBankList] = useState([]);

  const handleSelectBank = (bankObj) => {
    setSelectedBank(bankObj);
    setBankModalVisible(false);
  };

  const fetchAccountData = async () => {
    if (!guesthouseId) {
      setLoading(false);
      return;
    }
    try {
      const [accountRes, banksRes] = await Promise.all([
        settlementApi.getSettlementAccount(guesthouseId),
        settlementApi.getSettlementBanks()
      ]);
      
      let accountResult = accountRes.data || accountRes;
      if (accountResult && accountResult.data && !accountResult.currentAccount) {
        accountResult = accountResult.data;
      }
      setAccountData(accountResult);

      let banksResult = banksRes.data || banksRes;
      if (banksResult && banksResult.data && Array.isArray(banksResult.data)) {
        banksResult = banksResult.data;
      }
      if (Array.isArray(banksResult)) {
        setBankList(banksResult);
      }
    } catch (err) {
      console.warn('Get Settlement Account/Banks Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
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
        console.warn('Bankbook image compress failed:', error);
      }

      setBankbookImg({
        uri: compressedUri,
        type: 'image/jpeg',
        name: selected.fileName || generateUniqueFilename('jpg')
      });
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, [guesthouseId]);



  const handleSubmit = async () => {
    if (!selectedBank) {
      Alert.alert('알림', '은행을 선택해주세요.');
      return;
    }
    if (!accountNumber) {
      Alert.alert('알림', '계좌번호를 입력해주세요.');
      return;
    }
    if (!accountHolder) {
      Alert.alert('알림', '예금주 성명을 입력해주세요.');
      return;
    }
    if (!bankbookImg) {
      Alert.alert('알림', '통장 사본 이미지를 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Presigned URL 발급
      const presignedRes = await settlementApi.getAccountPresignedUrl(
        guesthouseId,
        bankbookImg.name,
        bankbookImg.type
      );
      
      const presignedData = presignedRes.data || presignedRes;

      const presignedUrlStr = presignedData.presignedUrl || (presignedData.data && presignedData.data.presignedUrl);
      let objectKey = presignedData.uniqueFileName || (presignedData.data && presignedData.data.uniqueFileName);
      
      if (!presignedUrlStr) {
        throw new Error('Presigned URL 발급 실패');
      }

      // 2. S3 이미지 업로드 (PUT)
      const fileData = await fetch(bankbookImg.uri);
      const blob = await fileData.blob();

      const uploadRes = await fetch(presignedUrlStr, {
        method: 'PUT',
        headers: {
          'Content-Type': bankbookImg.type,
        },
        body: blob,
      });

      if (!uploadRes.ok) {
        throw new Error('S3 업로드 실패');
      }

      // 3. 최종 변경 신청 API
      const payload = {
        bankCode: selectedBank.officialCode,
        accountNumber: accountNumber,
        accountHolderName: accountHolder,
        bankbookCopyObjectKey: objectKey || 'unknown_obect_key'
      };
      
      await settlementApi.requestSettlementAccountChange(guesthouseId, payload);
      
      Alert.alert('신청 완료', '계좌 변경 신청이 완료되었습니다.\n서류 심사가 진행됩니다.', [
        { text: '확인', onPress: () => fetchAccountData() }
      ]);
      
      // 입력 초기화
      setSelectedBank(null);
      setAccountNumber('');
      setAccountHolder('');
      setBankbookImg(null);
      
    } catch (error) {
      console.warn('Account change submit error:', error);
      const backendError = error?.response?.data?.message || error?.message || '알 수 없는 오류';
      const failedUrl = error?.config?.url || '알 수 없는 URL';
      const failedMethod = error?.config?.method || 'METHOD';
      Alert.alert('오류 추적', `[${String(failedMethod).toUpperCase()}] ${failedUrl}\n상세:\n${backendError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary_blue} />
      </View>
    );
  }

  const currentAccount = accountData?.currentAccount || {};
  // 심사 중인 요청만 추려내기 (status가 'REQUESTED' 이거나 'PENDING' 인 경우에만 심사중으로 간주)
  const isRequesting = accountData?.pendingRequest && 
    (accountData.pendingRequest.status === 'REQUESTED' || accountData.pendingRequest.status === 'PENDING');
  
  const pendingRequest = isRequesting ? accountData.pendingRequest : null;

  return (
    <View style={styles.container}>
      <Header title="정산 계좌 변경" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* 현재 등록된 계좌 */}
        <Text style={[styles.sectionTitle, styles.sectionTitleTop]}>
          현재 등록된 계좌
        </Text>
        <View style={styles.currentAccountCard}>
          <View style={styles.currentAccountHeader}>
            <Text style={styles.bankNameText}>{currentAccount.bankName || '등록된 계좌 없음'}</Text>
            {currentAccount.accountMasked ? (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.accountNumberText}>{currentAccount.accountMasked || '-'}</Text>
          <Text style={styles.accountHolderLabel}>예금주</Text>
          <Text style={styles.accountHolderText}>{currentAccount.accountHolderName || '-'}</Text>
        </View>

        {pendingRequest ? (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>
              변경 서류 심사 중입니다.
            </Text>
            <Text style={styles.pendingDesc}>
              승인이 완료될 때까지 새로운 계좌 변경 신청을 할 수 없습니다.
            </Text>
            <View style={styles.pendingInfoBox}>
              <Text style={styles.pendingInfoLabel}>신청하신 계좌 정보</Text>
              <Text style={styles.pendingInfoText}>
                {pendingRequest.bankName} {pendingRequest.accountMasked}
              </Text>
              <Text style={styles.pendingInfoText}>
                예금주: {pendingRequest.accountHolderName}
              </Text>
            </View>
          </View>
        ) : (
          <>
        {/* 변경할 계좌 정보 */}
        <Text style={styles.sectionTitle}>변경할 계좌 정보</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>은행 선택</Text>
          <TouchableOpacity 
            style={styles.dropdownInput} 
            activeOpacity={0.8}
            onPress={() => setBankModalVisible(true)}
          >
            {selectedBank ? (
              <Text style={styles.dropdownTextSelected}>{selectedBank.displayName}</Text>
            ) : (
              <Text style={styles.dropdownPlaceholder}>은행을 선택해주세요</Text>
            )}
            <ChevronDownGray width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>계좌번호</Text>
          <TextInput
            style={styles.textInput}
            placeholder="'-' 없이 숫자만 입력해주세요"
            placeholderTextColor={COLORS.grayscale_400}
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>예금주 성명</Text>
          <TextInput
            style={styles.textInput}
            placeholder="실명 혹은 법인명을 입력해주세요"
            placeholderTextColor={COLORS.grayscale_400}
            value={accountHolder}
            onChangeText={setAccountHolder}
          />
        </View>

        {/* 통장 사본 업로드 */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleNoMargin}>통장 사본 업로드</Text>
          <Text style={styles.requiredBadgeText}>필수 제출</Text>
        </View>
        <TouchableOpacity 
          style={styles.uploadBox} 
          activeOpacity={0.8}
          onPress={pickImage}
        >
          {bankbookImg ? (
            <Image 
              source={{ uri: bankbookImg.uri }} 
              style={{ width: '100%', height: 120, borderRadius: 12 }} 
              resizeMode="cover"
            />
          ) : (
            <>
              <View style={styles.uploadIconCircle}>
                <Text style={styles.uploadIconEmoji}>☁️</Text>
              </View>
              <Text style={styles.uploadTitle}>파일 업로드</Text>
              <Text style={styles.uploadSub}>
                JPG, PNG, PDF (최대 10MB){'\n'}계좌번호와 예금주가 명확히 보여야 합니다.
              </Text>
            </>
          )}
        </TouchableOpacity>
          </>
        )}

        {/* 변경 안내 및 절차 */}
        <View style={styles.guideBox}>
          <View style={styles.guideHeader}>
            <InfoIconRed width={24} height={24} style={styles.guideHeaderIcon} />
            <Text style={styles.guideTitle}>변경 안내 및 절차</Text>
          </View>
          
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>STEP 01</Text>
            <Text style={styles.stepTitle}>변경 신청</Text>
            <Text style={styles.stepDesc}>온라인을 통해 새 계좌 정보와 증빙 서류를 제출합니다.</Text>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>STEP 02</Text>
            <Text style={styles.stepTitle}>서류 검토</Text>
            <Text style={styles.stepDesc}>담당 부서에서 계좌 진위 여부 및 예금주를 확인합니다.</Text>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>STEP 03</Text>
            <Text style={styles.stepTitle}>정보 업데이트</Text>
            <Text style={styles.stepDesc}>검토 완료 후 다음 정산 주기부터 새 계좌가 적용됩니다.</Text>
          </View>

          <View style={styles.guideFooter}>
            <Text style={styles.guideFooterLeft}>예상 소요 시간</Text>
            <Text style={styles.guideFooterRight}>영업일 기준 최대 3일</Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      {!pendingRequest && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.grayscale_0} />
            ) : (
              <Text style={styles.submitButtonText}>변경 신청하기</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* 은행 선택 모달 */}
      <Modal
        visible={isBankModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBankModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>은행 선택</Text>
              <TouchableOpacity
                onPress={() => setBankModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={bankList}
              keyExtractor={(item) => item.officialCode || item.displayName}
              contentContainerStyle={styles.bankList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => handleSelectBank(item)}
                >
                  <Text style={styles.bankItemText}>{item.displayName}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettlementAccountChange;
