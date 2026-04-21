import React from 'react';
import {
  Keyboard,
  Modal,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';

/**
 * visible, buttonText, onPress 필수
 * buttonText2, onPress2는 버튼이 두 개 필요한 경우 사용
 * buttonText2가 있는 경우 buttonText, onPress는 회색 버튼에 적용됨 (취소, 확인)을 위함
 */

const AlertModal = ({
  visible,
  title, // 제목
  message, // 내용
  highlightText, // message에서 강조할 부분 (color의 색으로 강조됨)
  buttonText, // 버튼 1개일 때 or 버튼 2개일 때 오른쪽
  buttonText2 = null, // 버튼 2개일 때 왼쪽 (회색 바탕에 검은 글씨)
  onPress, // 버튼 1개일 때 or 버튼 2개일 때 오른쪽
  onPress2 = null, // 버튼 2개일 때 왼쪽
  color = COLORS.primary_orange, // buttonText의 배경색 (기본 주황색)
  imageUri,
  imageSource,   // png/jpg 같은 이미지
  iconElement,   // SVG
  buttonDisabled = false,
  selectionLabel,
  selectionPlaceholder = '',
  selectionOptions = [],
  selectionOpen = false,
  selectedOption = '',
  onToggleSelection,
  onSelectOption,
  customOptionLabel = '직접 입력',
  customInputValue = '',
  customInputPlaceholder = '',
  onChangeCustomInput,
  customContent = null,
}) => {
  // 강조 텍스트 여부
  const renderMessage = () => {
    if (!message) return null;

    // 강조할 텍스트가 없으면 그냥 출력
    if (!highlightText || !message.includes(highlightText)) {
      return (
        <Text style={[FONTS.fs_14_medium, styles.message]}>
          {message}
        </Text>
      );
    }

    const parts = message.split(highlightText);

    return (
      <Text style={[FONTS.fs_14_medium, styles.message]}>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            <Text>{part}</Text>
            {idx !== parts.length - 1 && (
              <Text
                style={[
                  {color},
                ]}
              >
                {highlightText}
              </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.container}>
                {/* 이미지 주소 or 로컬 이미지 */}
                {iconElement ? (
                  <View>{iconElement}</View>
                ) : imageSource ? (
                  <Image source={imageSource} style={styles.image} />
                ) : imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.image} />
                ) : null}
                {/* 제목 */}
                {title ? (
                  <Text style={[FONTS.fs_18_semibold, styles.title]}>{title}</Text>
                ) : null}
                {/* 내용 */}
                {message ? <View style={styles.messageWrap}>{renderMessage()}</View> : null}

                {selectionOptions.length ? (
                  <View style={styles.selectionSection}>
                    {selectionLabel ? (
                      <Text style={[FONTS.fs_14_medium, styles.selectionLabel]}>{selectionLabel}</Text>
                    ) : null}

                    <View style={styles.dropdownWrapper}>
                      <TouchableOpacity style={styles.dropdown} onPress={onToggleSelection}>
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            styles.dropdownText,
                            !selectedOption && styles.dropdownPlaceholder,
                          ]}>
                          {selectedOption || selectionPlaceholder}
                        </Text>
                        {selectionOpen ? <ChevronUp width={24} height={24} /> : <ChevronDown width={24} height={24} />}
                      </TouchableOpacity>

                      {selectionOpen ? (
                        <View style={styles.dropdownList}>
                          {selectionOptions.map((option, index) => (
                            <View key={option}>
                              <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => onSelectOption?.(option)}>
                                <Text
                                  style={[
                                    FONTS.fs_14_medium,
                                    selectedOption === option && FONTS.fs_14_semibold,
                                    {
                                      color:
                                        selectedOption === option
                                          ? COLORS.primary_orange
                                          : COLORS.grayscale_900,
                                    },
                                  ]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                              {index < selectionOptions.length - 1 ? <View style={styles.divider} /> : null}
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>

                    {selectedOption === customOptionLabel ? (
                      <TextInput
                        value={customInputValue}
                        onChangeText={onChangeCustomInput}
                        placeholder={customInputPlaceholder}
                        placeholderTextColor={COLORS.grayscale_400}
                        style={[FONTS.fs_12_medium, styles.reasonInput]}
                      />
                    ) : null}
                  </View>
                ) : null}

                {customContent}

                {buttonText2 ? (
                  <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
                    <ButtonWhite
                      title={buttonText2}
                      onPress={onPress2}
                      style={{flex: 1}}
                    />
                    <ButtonWhite
                      title={buttonText}
                      backgroundColor={color}
                      textColor={COLORS.grayscale_0}
                      onPress={onPress}
                      disabled={buttonDisabled}
                      style={{flex: 1}}
                    />
                  </View>
                ) : (
                  <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
                    <ButtonWhite
                      title={buttonText}
                      backgroundColor={color}
                      textColor={COLORS.grayscale_0}
                      onPress={onPress}
                      disabled={buttonDisabled}
                      style={{flex: 1}}
                    />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
    alignSelf: 'center',
  },
  messageWrap: {
    marginTop: 8,
  },
  message: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  selectionSection: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 20,
  },
  selectionLabel: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 100,
    width: '100%',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dropdownText: {
    color: COLORS.grayscale_900,
  },
  dropdownPlaceholder: {
    color: COLORS.grayscale_400,
  },
  dropdownList: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 8,
    backgroundColor: COLORS.grayscale_0,
    zIndex: 101,
    elevation: 6,
  },
  dropdownItem: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },
  reasonInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.grayscale_900,
    width: '100%',
  },
});

export default AlertModal;
