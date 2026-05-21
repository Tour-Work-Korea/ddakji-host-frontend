import React from 'react';
import {ActivityIndicator, View, Platform} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import styles from './HostDocumentViewer.styles';

const HostDocumentViewer = () => {
  const route = useRoute();
  const {title, url} = route.params ?? {};
  
  // 안드로이드 웹뷰는 PDF 렌더러를 내장하고 있지 않아 다운로드로 처리됩니다.
  // 이를 해결하기 위해 안드로이드 기기에서는 Google Docs Viewer 서비스를 우회 사용하여 PDF를 인앱 웹뷰에서 렌더링합니다.
  const isPdf = typeof url === 'string' && url.toLowerCase().includes('.pdf');
  const targetUrl =
    Platform.OS === 'android' && isPdf
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
      : url;

  const injectedViewportScript = `
    (function() {
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.head.appendChild(meta);
      }
      meta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
      );
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <Header title={title || '문서 보기'} />

      <WebView
        source={{uri: targetUrl}}
        startInLoadingState
        injectedJavaScriptBeforeContentLoaded={injectedViewportScript}
        scalesPageToFit={false}
        setBuiltInZoomControls={true}
        setDisplayZoomControls={false}
        scrollEnabled={true}
        bounces={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary_orange} />
          </View>
        )}
        style={styles.webview}
      />
    </View>
  );
};

export default HostDocumentViewer;
