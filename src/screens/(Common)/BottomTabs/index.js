import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View, Text, Platform, Modal, Pressable} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import MyIcon from '@assets/images/person_black.svg';
import MyIconFilled from '@assets/images/person_black_filled.svg';
import Avatar from '@components/Avatar';
import {My} from '@screens';
import useUserStore from '@stores/userStore';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const userRole = useUserStore(state => state.userRole);
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedProfileId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const setSelectedProfileId = useUserStore(
    state => state.setSelectedHostGuesthouseId,
  );
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(hostProfile.guesthouseProfiles) &&
      hostProfile.guesthouseProfiles.length > 0
        ? hostProfile.guesthouseProfiles.map((item, index) => ({
            id: String(item.guesthouseId ?? `guesthouse-${index}`),
            name: item.guesthouseName || '이름 없음',
            photoUrl: item.profileImageUrl || null,
            noticeCount: 0,
          }))
        : [],
    [hostProfile.guesthouseProfiles],
  );
  const selectedGuesthouse = useMemo(
    () =>
      guesthouseProfiles.find(item => item.id === selectedProfileId) ||
      guesthouseProfiles[0] ||
      null,
    [guesthouseProfiles, selectedProfileId],
  );
  const selectedGuesthousePhotoUrl = selectedGuesthouse?.photoUrl ?? null;

  useEffect(() => {
    if (!guesthouseProfiles.length) {
      setSelectedProfileId(null);
      return;
    }

    const hasSelected = guesthouseProfiles.some(
      profile => profile.id === selectedProfileId,
    );
    if (!hasSelected) {
      setSelectedProfileId(guesthouseProfiles[0].id);
    }
  }, [guesthouseProfiles, selectedProfileId, setSelectedProfileId]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="마이"
        backBehavior="initialRoute"
        screenOptions={({route}) => ({
          tabBarIcon: ({focused}) => {
            const iconProps = {width: 24, height: 24};
            const hasHostProfileImage = Boolean(
              typeof selectedGuesthousePhotoUrl === 'string' &&
                selectedGuesthousePhotoUrl.trim() &&
                selectedGuesthousePhotoUrl !== '사진을 추가해주세요',
            );

            if (route.name === '마이' && userRole === 'HOST') {
              return (
                <Avatar
                  uri={selectedGuesthousePhotoUrl}
                  size={28}
                  iconSize={16}
                  style={[
                    styles.hostProfileImage,
                    !hasHostProfileImage && styles.hostProfilePlaceholder,
                    focused && styles.hostProfileImageFocused,
                  ]}
                />
              );
            }

            const Icon = focused ? MyIconFilled : MyIcon;
            return <Icon {...iconProps} />;
          },
          tabBarShowLabel: true,
          tabBarLabel: ({focused}) => (
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.label,
                focused && styles.labelFocused,
              ]}
              numberOfLines={1}
              allowFontScaling={false}>
              {route.name === '마이' && userRole === 'HOST'
                ? '나의 게하'
                : route.name}
            </Text>
          ),
          tabBarStyle: [
            Platform.OS === 'android' ? styles.tabBarAndroid : styles.tabBarIOS,
          ],
          tabBarItemStyle: styles.tabBarItem,
          tabBarSafeAreaInset: {bottom: 0},
          headerShown: false,
        })}>
        <Tab.Screen
          name="마이"
          component={My}
          listeners={({navigation}) => ({
            tabPress: e => {
              const {accessToken: token, userRole: role} = useUserStore.getState();
              if (!token || role !== 'HOST') {
                e.preventDefault();
                navigation.navigate('Login');
              }
            },
            tabLongPress: () => {
              const role = useUserStore.getState().userRole;
              if (role === 'HOST') {
                setIsProfileModalVisible(true);
              }
            },
          })}
        />
      </Tab.Navigator>

      <Modal
        visible={isProfileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsProfileModalVisible(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={event => event.stopPropagation()}>
            <GuesthouseProfileList
              items={guesthouseProfiles}
              selectedId={selectedProfileId}
              onSelect={item => {
                setSelectedProfileId(item.id);
                setIsProfileModalVisible(false);
              }}
              onAdd={() => {
                setIsProfileModalVisible(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarAndroid: {
    position: 'relative',
    backgroundColor: COLORS.grayscale_0,
    height: 64, // 고정 높이
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.grayscale_200,
  },
  tabBarIOS: {
    position: 'relative',
    height: 92,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  tabBarItem: {
    paddingVertical: 0, // 아이템 자체 여백 제거
  },
  label: {
    marginTop: 2,
    includeFontPadding: false, // Android 폰트 여백 제거
    color: COLORS.grayscale_700,
  },
  labelFocused: {
    color: COLORS.grayscale_900,
  },
  hostProfileImage: {
    width: 28,
    height: 28,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
  },
  hostProfileImageFocused: {
    borderColor: COLORS.primary_orange,
  },
  hostProfilePlaceholder: {
    backgroundColor: COLORS.grayscale_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalContent: {
    width: '100%',
  },
});

export default BottomTabs;
