import React, {useEffect, useMemo} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import useUserStore from '@stores/userStore';

import HostHome from '@screens/home/Home';
import HostHomeMenu from '@screens/home/Menu';
import {HostMyPage} from '@screens';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedProfileId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const setSelectedProfileId = useUserStore(
    state => state.setSelectedHostGuesthouseId,
  );

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(hostProfile?.guesthouseProfiles)
        ? hostProfile.guesthouseProfiles
        : [],
    [hostProfile?.guesthouseProfiles],
  );

  useEffect(() => {
    if (!guesthouseProfiles.length) {
      setSelectedProfileId(null);
      return;
    }

    const hasSelected = guesthouseProfiles.some(
      profile => String(profile.guesthouseId) === selectedProfileId,
    );

    if (!hasSelected) {
      setSelectedProfileId(String(guesthouseProfiles[0].guesthouseId));
    }
  }, [guesthouseProfiles, selectedProfileId, setSelectedProfileId]);

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
