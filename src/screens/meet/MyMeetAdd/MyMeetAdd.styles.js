import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flex: 1,
  },

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
  titleCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    flexShrink: 1,
  },
  sectionTitlePending: {
    color: COLORS.grayscale_500,
  },
  sectionTitleDone: {
    color: COLORS.grayscale_900,
  },
  sectionDescription: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
  titleValue: {
    color: COLORS.grayscale_900,
    marginTop: 4,
  },
  sectionIconWrap: {
    marginLeft: 12,
  },

  explainText: {
    color: COLORS.semantic_red,
    textAlign: 'center',
    marginTop: 18,
  },
  requiredText: {
    color: COLORS.semantic_red,
  },

  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.grayscale_0,
  },
  saveButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  saveText: {
    color: COLORS.grayscale_800,
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary_orange,
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

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  inlinePanel: {
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    width: '100%',
    backgroundColor: COLORS.grayscale_100,
  },
  titleInput: {
    color: COLORS.grayscale_900,
    padding: 0,
  },
});

export default styles;
