import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useDisplaySettingsStore = create(
  persist(
    set => ({
      largeText: false,
      setLargeText: largeText => set({largeText}),
    }),
    {
      name: 'host-display-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
export default useDisplaySettingsStore;
