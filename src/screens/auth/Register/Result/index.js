import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import ButtonWhite from '@components/ButtonWhite';
import styles from '../RegisterIntro/Intro.styles';
import LogoBlue from '@assets/images/logo_blue_smile.svg';
import CloseIcon from '@assets/images/x_gray.svg';
import { COLORS } from '@constants/colors';

const Result = ({ route }) => {
  const {
    to = null,
    onPress = null,
    onClose = null,
    buttonTitle = '게스트하우스 등록 시작하기',
    nickname,
    role,
  } = route.params || {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.grayscale_0 }}>
      {onClose && (
        <TouchableOpacity 
          onPress={onClose} 
          style={{ position: 'absolute', top: 10, right: 20, zIndex: 10, padding: 8 }}
        >
          <CloseIcon width={24} height={24} />
        </TouchableOpacity>
      )}
      <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoBlue width={168} />
          <View>
            <Text style={styles.titleText}>반가워요, {nickname}님!</Text>
            <Text style={styles.titleText}>
              내 게스트하우스 등록을 시작해볼까요?
            </Text>
          </View>
        </View>
        <ButtonWhite
          title={buttonTitle}
          to={to}
          onPress={onPress}
          backgroundColor={COLORS.primary_blue}
          textColor={COLORS.grayscale_0}
        />
      </View>
      </View>
    </SafeAreaView>
  );
};
export default Result;
