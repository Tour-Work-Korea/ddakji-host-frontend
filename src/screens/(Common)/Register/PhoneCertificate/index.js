import React from 'react';
import {useNavigation} from '@react-navigation/native';
import HostPhone from '@components/Certificate/HostPhone';

const PhoneCertificate = ({route}) => {
  const {agreements, email} = route.params ?? {};
  const navigation = useNavigation();

  const handleHostPhoneVerifiedSuccess = phoneNumber => {
    navigation.navigate('HostRegisterInfo', {
      agreements,
      email,
      phoneNumber,
    });
  };

  return <HostPhone user="HOST" onPress={handleHostPhoneVerifiedSuccess} />;
};

export default PhoneCertificate;
