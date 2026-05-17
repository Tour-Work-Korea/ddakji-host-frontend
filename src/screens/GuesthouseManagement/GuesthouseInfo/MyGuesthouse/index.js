import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import EditIcon from '@assets/images/edit_gray.svg';
import DeleteIcon from '@assets/images/delete_gray.svg';
import styles from './MyGuesthouse.styles';

const MyGuesthouse = ({
  guesthouseDetail,
  thumbnailImage,
  businessName,
  guesthouseAddress,
  routeGuesthouseId,
  effectiveGuesthouseId,
  onDelete,
}) => {
  const navigation = useNavigation();

  if (!guesthouseDetail || guesthouseDetail.status === 'INACTIVE') {
    return (
      <View style={styles.emptyState}>
        <Text style={[FONTS.fs_20_semibold, styles.emptyTitle]}>
          {`${businessName}에 대한 등록 심사가\n완료 되었습니다.\n게스트하우스 정보를\n작성해보세요!`}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('MyGuesthouseAdd', {
              guesthouseId: routeGuesthouseId ?? effectiveGuesthouseId ?? null,
            })
          }>
          <Text style={[FONTS.fs_14_medium, styles.primaryButtonText]}>
            게스트하우스 정보 작성
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.contentContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('MyGuesthousePreview', {
            id: guesthouseDetail.id,
            previewData: guesthouseDetail,
          })
        }>
        <View style={styles.guesthouseCard}>
        {thumbnailImage ? (
          <Image
            source={{ uri: thumbnailImage }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
        )}

        <View style={styles.cardTextWrap}>
          <Text style={[FONTS.fs_16_semibold, styles.cardTitle]} numberOfLines={1}>
            {guesthouseDetail.guesthouseName || businessName}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.cardAddress]} numberOfLines={2}>
            {guesthouseAddress}
          </Text>
        </View>
      </View>
      </TouchableOpacity>

      <View style={styles.actionButtonRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('MyGuesthouseEdit', {
              guesthouseId: guesthouseDetail.id,
              initialGuesthouse: guesthouseDetail,
            })
          }>
          <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>수정하기</Text>
          <EditIcon width={20} height={20} />
        </TouchableOpacity>

        <View style={styles.actionButtonSpacer} />

        <TouchableOpacity activeOpacity={0.8} style={styles.actionButton} onPress={onDelete}>
          <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>삭제하기</Text>
          <DeleteIcon width={20} height={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyGuesthouse;
