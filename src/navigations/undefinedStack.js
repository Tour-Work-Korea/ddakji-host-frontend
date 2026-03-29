import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStack } from '@screens';

const Stack = createNativeStackNavigator();

const undefinedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BottomTabs" component={MainStack} />
  </Stack.Navigator>
);

export default undefinedStack;
