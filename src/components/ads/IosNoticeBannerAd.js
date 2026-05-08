import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';

const IOS_NOTICE_BANNER_AD_UNIT_ID = 'ca-app-pub-6098454400067335/6301843172';

const IosNoticeBannerAd = () => {
  if (Platform.OS !== 'ios') {
    return null;
  }

  const {BannerAd, BannerAdSize} = require('react-native-google-mobile-ads');

  return (
    <View style={styles.adBannerWrap}>
      <BannerAd
        unitId={IOS_NOTICE_BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  adBannerWrap: {
    alignItems: 'center',
  },
});

export default IosNoticeBannerAd;
