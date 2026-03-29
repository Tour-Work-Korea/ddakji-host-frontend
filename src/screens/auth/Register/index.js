import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  RegisterAgree,
  RegisterIntro,
  EmailCertificate,
  PhoneCertificate,
  HostRegisterInfo,
  AgreeDetail,
  Result,
} from '@screens';

const Stack = createNativeStackNavigator();

export default function Register() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="RegisterIntro" component={RegisterIntro} />
      <Stack.Screen name="RegisterAgree" component={RegisterAgree} />
      <Stack.Screen name="AgreeDetail" component={AgreeDetail} />
      <Stack.Screen name="PhoneCertificate" component={PhoneCertificate} />
      <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
      <Stack.Screen name="HostRegisterInfo" component={HostRegisterInfo} />
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  );
}
