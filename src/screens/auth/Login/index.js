import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  LoginByEmail,
  FindIntro,
  VerifyPhone,
  FindId,
  FindPassword,
} from '@screens';

const Stack = createNativeStackNavigator();

export default function Login() {
  return (
    <Stack.Navigator
      initialRouteName="LoginByEmail"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="LoginByEmail"
        component={LoginByEmail}
        initialParams={{userRole: 'HOST'}}
      />
      <Stack.Screen name="FindIntro" component={FindIntro} />
      <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
      <Stack.Screen name="FindId" component={FindId} />
      <Stack.Screen name="FindPassword" component={FindPassword} />
    </Stack.Navigator>
  );
}
