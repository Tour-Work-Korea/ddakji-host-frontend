import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Email} from '@components/Certificate/Email';

const EmailCertificate = ({route}) => {
  const {agreements = []} = route.params;
  const navigation = useNavigation();

  const handleEmailVerifiedSuccess = email => {
    navigation.navigate('PhoneCertificate', {
      user: 'HOST',
      agreements,
      email,
    });
  };

  return <Email user="HOST" onPress={handleEmailVerifiedSuccess} />;
};

export default EmailCertificate;
