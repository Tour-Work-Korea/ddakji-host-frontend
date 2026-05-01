import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
  },

  // 등록 폼
  bodyContainer: {
    gap: 16,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  sectionTitle: {
    flex: 1,
  },
  sectionTitlePending: {
    color: COLORS.grayscale_500,
  },
  sectionTitleDone: {
    color: COLORS.primary_orange,
  },
  sectionIconWrap: {
    marginLeft: 12,
  },

  // 설명 텍스트
  explainText: {
    color: COLORS.semantic_red,
    textAlign: 'center',
    marginTop: 18,
  },

  // 하단 버튼
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.grayscale_0,
  },
  previewButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  previewButtonText: {
    color: COLORS.grayscale_800,
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary_blue,
  },
  submitText: {
    color: COLORS.grayscale_0,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.grayscale_100,
  },
  submitTextDisabled: {
    color: COLORS.grayscale_800,
  },
});

export default styles;
