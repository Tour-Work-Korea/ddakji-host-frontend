import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HostHome from '@screens/home/Home';
import HostHomeMenu from '@screens/home/Menu';
import {HostMyPage} from '@screens';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="홈"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="홈" component={HostHome} />
      <Stack.Screen name="마이" component={HostHomeMenu} />
      <Stack.Screen name="HostMyPage" component={HostMyPage} />
    </Stack.Navigator>
  );
};

export default MainStack;
