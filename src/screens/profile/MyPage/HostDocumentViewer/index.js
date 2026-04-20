import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import styles from './HostDocumentViewer.styles';

const HostDocumentViewer = () => {
  const route = useRoute();
  const {title, url} = route.params ?? {};
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
        source={{uri: url}}
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
