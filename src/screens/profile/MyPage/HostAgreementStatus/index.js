import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {Buffer} from 'buffer';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import hostDocumentApi from '@utils/api/hostDocumentApi';
import {formatLocalDateToDot} from '@utils/formatDate';
import {openWebLink} from '@utils/openWebLink';
import {
  HOST_DOCUMENT_LABELS,
  HOST_DOCUMENT_TYPES,
} from '@constants/documentTypes';
import {useNavigation} from '@react-navigation/native';
import styles from './HostAgreementStatus.styles';

const DEFAULT_DOCUMENTS = Object.values(HOST_DOCUMENT_TYPES).map(type => ({
  documentType: type,
}));

const HostAgreementStatus = () => {
  const navigation = useNavigation();
  const [documents, setDocuments] = useState(DEFAULT_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await hostDocumentApi.getMyDocuments();
      const nextDocuments =
        Array.isArray(response?.data?.items) && response.data.items.length > 0
        ? response.data.items
        : DEFAULT_DOCUMENTS;

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
    }, [fetchDocuments]),
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
      const response = await hostDocumentApi.getDocumentViewLink(documentType);
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
      const response = await hostDocumentApi.downloadDocument(documentType);
      const contentType =
        response?.headers?.['content-type'] || 'application/octet-stream';
      const disposition = response?.headers?.['content-disposition'] || '';
      const matchedFilename = disposition.match(/filename="?([^"]+)"?/i);
      const filename = matchedFilename?.[1] || `${documentTitle}`;
      const binaryData = response?.data;

      if (!binaryData) {
        throw new Error('document binary not found');
      }

      const base64Data = Buffer.from(binaryData).toString('base64');
      const dataUrl = `data:${contentType};base64,${base64Data}`;

      await Share.share({
        title: filename,
        url: dataUrl,
      });
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

  const renderItem = ({item, index}) => {
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
      <Header title="계약서 및 개인정보 동의 현황" />

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
        />
      )}
    </View>
  );
};

export default HostAgreementStatus;
