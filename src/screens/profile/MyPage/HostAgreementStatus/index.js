import React, { useCallback, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Share,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Buffer } from 'buffer';

import useUserStore from '@stores/userStore';
import Header from '@components/Header';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';
import ChevronDownIcon from '@assets/images/chevron_down_gray.svg';
import ChevronUpIcon from '@assets/images/chevron_up_gray.svg';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import hostDocumentApi from '@utils/api/hostDocumentApi';
import { formatLocalDateToDot } from '@utils/formatDate';
import { openWebLink } from '@utils/openWebLink';
import {
  HOST_DOCUMENT_LABELS,
  HOST_DOCUMENT_TYPES,
} from '@constants/documentTypes';
import { useGuesthouseProfiles } from '@hooks/useGuesthouseProfiles';
import { useNavigation } from '@react-navigation/native';
import styles from './HostAgreementStatus.styles';

const DEFAULT_DOCUMENTS = Object.values(HOST_DOCUMENT_TYPES).map(type => ({
  documentType: type,
  available: false,
}));

const HostAgreementStatus = () => {
  const navigation = useNavigation();
  const [documents, setDocuments] = useState(DEFAULT_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(true);

  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);
  const { guesthouseProfiles } = useGuesthouseProfiles();

  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedGuesthouseId = useUserStore(state => state.selectedGuesthouseId);
  const setSelectedGuesthouseId = useUserStore(state => state.setSelectedGuesthouseId);

  const selectedProfile = useMemo(() => {
    if (!hostProfile?.guesthouseProfiles) return null;
    return hostProfile.guesthouseProfiles.find(
      p => String(p.guesthouseId) === String(selectedGuesthouseId) || String(p.profileKey) === String(selectedGuesthouseId)
    ) || hostProfile.guesthouseProfiles[0];
  }, [hostProfile, selectedGuesthouseId]);

  const applicationId = selectedProfile?.applicationId;
  const businessName = selectedProfile?.guesthouseName || '게스트하우스';

  const handleSelectProfile = item => {
    setSelectedGuesthouseId(item.id);
    setIsGuesthouseListVisible(false);
  };

  const fetchDocuments = useCallback(async () => {
    if (!applicationId) {
      setDocuments(DEFAULT_DOCUMENTS);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await hostDocumentApi.getMyDocuments(applicationId);
      console.log('GET /host/my/documents/applications API Response:', response?.data);

      const fetchedItems = Array.isArray(response?.data?.items) ? response.data.items : [];
      
      const nextDocuments = DEFAULT_DOCUMENTS.map(defaultDoc => {
        const found = fetchedItems.find(
          item => item.documentType === defaultDoc.documentType
        );
        return found ? { ...defaultDoc, ...found } : defaultDoc;
      });

      setDocuments(nextDocuments);
    } catch (error) {
      console.warn('호스트 문서 목록 조회 실패:', error);
      setDocuments(DEFAULT_DOCUMENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [fetchDocuments, applicationId]),
  );

  const resolveDocumentLink = response => {
    const data = response?.data;

    if (typeof data === 'string') {
      return data;
    }

    return (
      data?.url ??
      data?.viewLink ??
      data?.downloadLink ??
      data?.downloadUrl ??
      data?.link ??
      null
    );
  };

  const handleOpenDocument = async (documentType, documentTitle) => {
    try {
      const response = await hostDocumentApi.getDocumentViewLink(documentType, applicationId);
      const link = resolveDocumentLink(response);

      if (!link) {
        throw new Error('document view link not found');
      }

      navigation.navigate('HostDocumentViewer', {
        title: documentTitle,
        url: link,
        expiresAt: response?.data?.expiresAt ?? null,
      });
    } catch (error) {
      console.warn('문서 보기 링크 조회 실패:', error);
      Toast.show({
        type: 'error',
        text1: '문서를 열지 못했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const handleDownloadDocument = async (documentType, documentTitle) => {
    try {
      const response = await hostDocumentApi.downloadDocument(documentType, applicationId);
      const contentType =
        response?.headers?.['content-type'] || 'application/octet-stream';
      const disposition = response?.headers?.['content-disposition'] || '';
      const matchedFilename = disposition.match(/filename="?([^"]+)"?/i);
      const filename = matchedFilename?.[1] || `${documentTitle}.pdf`;
      const binaryData = response?.data;

      if (!binaryData) {
        throw new Error('document binary not found');
      }

      const base64Data = Buffer.from(binaryData).toString('base64');
      const { dirs } = ReactNativeBlobUtil.fs;
      const tempFilePath = `${dirs.CacheDir}/${filename}`;

      // 임시 폴더에 파일 생성
      await ReactNativeBlobUtil.fs.writeFile(tempFilePath, base64Data, 'base64');

      if (Platform.OS === 'ios') {
        // iOS: 내장 문서 뷰어(QLPreviewController) 호출
        ReactNativeBlobUtil.ios.previewDocument(tempFilePath);
      } else {
        // Android: MediaStore를 사용하여 공용 Download 폴더로 복사 및 바로 열기 제공
        try {
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: filename,
              parentFolder: '',
              mimeType: contentType,
            },
            'Download',
            tempFilePath
          );
          Alert.alert(
            '다운로드 완료',
            '다운로드 폴더에 파일이 저장되었습니다.\n파일을 바로 여시겠습니까?',
            [
              { text: '닫기', style: 'cancel' },
              {
                text: '열기',
                onPress: () => {
                  ReactNativeBlobUtil.android.actionViewIntent(tempFilePath, contentType).catch(() => {
                    Alert.alert('알림', '문서 파일을 열 수 있는 앱이 설치되어 있지 않습니다.');
                  });
                }
              }
            ]
          );
        } catch (e) {
          console.warn('MediaStore copy error:', e);
          ReactNativeBlobUtil.android.actionViewIntent(tempFilePath, contentType).catch(() => {
            Alert.alert('다운로드 완료', '파일이 저장되었으나, 문서 뷰어 앱이 필요할 수 있습니다.');
          });
        }
      }
    } catch (error) {
      console.warn('문서 다운로드 실패:', error);
      Toast.show({
        type: 'error',
        text1: '문서를 다운로드하지 못했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const renderItem = ({ item, index }) => {
    const documentType = item?.documentType;
    const documentLabel =
      item?.title || HOST_DOCUMENT_LABELS[documentType] || documentType || '문서';
    const isAvailable = item?.available !== false;
    const updatedAt = item?.updatedAt ? formatLocalDateToDot(item.updatedAt) : '-';

    return (
      <View
        style={[
          styles.documentRow,
          index !== documents.length - 1 && styles.documentRowBorder,
        ]}>
        <Text style={[FONTS.fs_18_semibold, styles.documentTitle]}>
          {documentLabel}
        </Text>
        <Text style={[FONTS.fs_16_medium, styles.documentUpdatedAt]}>
          최종 업데이트: {updatedAt}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.actionButton,
              styles.viewButton,
              !isAvailable && styles.actionButtonDisabled,
            ]}
            disabled={!isAvailable}
            onPress={() => handleOpenDocument(documentType, documentLabel)}>
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.viewButtonText,
                !isAvailable && styles.actionButtonTextDisabled,
              ]}>
              보기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.actionButton,
              styles.downloadButton,
              !isAvailable && styles.actionButtonDisabled,
            ]}
            disabled={!isAvailable}
            onPress={() => handleDownloadDocument(documentType, documentLabel)}>
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.downloadButtonText,
                !isAvailable && styles.actionButtonTextDisabled,
              ]}>
              다운로드
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="계약 현황" />

      {/* Guesthouse Selector */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.grayscale_200 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          activeOpacity={0.8}
          onPress={() => setIsGuesthouseListVisible(prev => !prev)}>
          <Text style={[FONTS.fs_18_semibold, { color: COLORS.grayscale_900, marginRight: 4 }]} numberOfLines={1}>
            {businessName}
          </Text>
          {isGuesthouseListVisible ? (
            <ChevronUpIcon width={16} height={16} />
          ) : (
            <ChevronDownIcon width={16} height={16} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary_orange} />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item, index) =>
            String(item?.documentType ?? item?.type ?? `document-${index}`)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}

      <GuesthouseProfileList
        visible={isGuesthouseListVisible}
        onClose={() => setIsGuesthouseListVisible(false)}
        items={guesthouseProfiles}
        selectedId={selectedProfile?.profileKey || selectedProfile?.guesthouseId || selectedGuesthouseId}
        onSelect={handleSelectProfile}
        onAdd={() => {
          setIsGuesthouseListVisible(false);
          navigation.navigate('StoreRegisterList');
        }}
      />
    </View>
  );
};

export default HostAgreementStatus;
