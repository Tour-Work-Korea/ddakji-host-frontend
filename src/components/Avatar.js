import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {COLORS} from '@constants/colors';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';

const Avatar = ({
  uri,
  size = 80,
  iconSize,
  iconScale = 0.4,
  borderRadius,
  style,
  imageStyle,
}) => {
  const defaultIconSize = Math.round(size * iconScale);
  const fallbackIconWidth =
    typeof iconSize === 'number'
      ? iconSize
      : iconSize?.width ?? defaultIconSize;
  const fallbackIconHeight =
    typeof iconSize === 'number'
      ? iconSize
      : iconSize?.height ?? fallbackIconWidth;
  const imageUri =
    typeof uri === 'string' && uri.trim() && uri !== '사진을 추가해주세요'
      ? uri
      : null;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius ?? size / 2,
        },
        style,
      ]}>
      {imageUri ? (
        <Image source={{uri: imageUri}} style={[styles.image, imageStyle]} />
      ) : (
        <EmptyImage width={fallbackIconWidth} height={fallbackIconHeight} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
