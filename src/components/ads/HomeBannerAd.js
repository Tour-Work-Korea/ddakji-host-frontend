import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';

const HOME_BANNER_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-6098454400067335/9281314980',
  ios: 'ca-app-pub-6098454400067335/6301843172',
});

const HomeBannerAd = () => {
  if (!HOME_BANNER_AD_UNIT_ID) {
    return null;
  }

  const {
    BannerAd,
    BannerAdSize,
    TestIds,
  } = require('react-native-google-mobile-ads');
  const adUnitId = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : HOME_BANNER_AD_UNIT_ID;

  return (
    <View style={styles.adBannerWrap}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={error =>
          console.warn('[HomeBannerAd] failed to load:', error)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  adBannerWrap: {
    alignItems: 'center',
  },
});

export default HomeBannerAd;
