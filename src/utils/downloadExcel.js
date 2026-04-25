import ReactNativeBlobUtil from 'react-native-blob-util';
import useUserStore from '@stores/userStore';
import { Platform, Alert } from 'react-native';

/**
 * 정산 내역 엑셀 다운로드
 * @param {string|number} guesthouseId 
 * @param {string} yearMonth 'YYYY-MM' 등
 */
export const downloadSettlementExcel = async (guesthouseId, yearMonth) => {
  const API_BASE_URL = process.env.API_BASE_URL ?? '';
  const token = useUserStore.getState().accessToken;

  let url = `${API_BASE_URL}/settlement/host/export?guesthouseId=${guesthouseId}`;
  if (yearMonth) {
    url += `&yearMonth=${yearMonth}`;
  }

  const { dirs } = ReactNativeBlobUtil.fs;
  // 파일명에서 - 등의 특수문자를 보기 좋게 처리
  const safeMonth = yearMonth ? yearMonth.replace('-', '') : '전체';
  const fileName = `정산내역_${safeMonth}.xlsx`;
  
  const path = Platform.OS === 'ios'
    ? `${dirs.DocumentDir}/${fileName}`
    : `${dirs.DownloadDir}/${fileName}`;

  try {
    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path: path,
      appendExt: 'xlsx',
      addAndroidDownloads: Platform.OS === 'android' ? {
        useDownloadManager: true,
        notification: true,
        path: path,
        description: '정산 내역 엑셀 다운로드 중',
        title: fileName,
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      } : undefined,
    }).fetch('GET', url, {
      Authorization: `Bearer ${token}`
    });

    const status = res.info().status;
    if (status !== 200) {
      const errorText = await res.text();
      console.warn('Excel Download API Error:', status, errorText);
      ReactNativeBlobUtil.fs.unlink(res.path()); // 잘못 다운로드된 파일 삭제
      
      let errMsg = '알 수 없는 오류가 발생했습니다.';
      try {
        const errJson = JSON.parse(errorText);
        errMsg = errJson.message || errMsg;
      } catch (e) {}

      Alert.alert('다운로드 실패', errMsg);
      return;
    }

    if (Platform.OS === 'ios') {
      // iOS에서는 Preview 화면을 띄워서 모달로 공유/저장이 가능하게 함
      ReactNativeBlobUtil.ios.previewDocument(res.path());
    } else {
       // Android는 알림바에서 처리되거나 바로 다운로드 폴더에 보임
      Alert.alert('다운로드 완료', `다운로드 폴더에 파일이 저장되었습니다.`);
    }

  } catch (error) {
    console.error('Excel Download Error:', error);
    Alert.alert('다운로드 실패', '파일을 다운로드하는 도중 오류가 발생했습니다.');
  }
};
