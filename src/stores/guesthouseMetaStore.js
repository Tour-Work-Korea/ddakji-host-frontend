import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGuesthouseMetaStore = create(
  persist(
    set => ({
      guesthouseHashtags: [],
      guesthouseAmenities: [],
      hasLoadedGuesthouseMeta: false,

      setGuesthouseHashtags: guesthouseHashtags => set({guesthouseHashtags}),
      setGuesthouseAmenities: guesthouseAmenities => set({guesthouseAmenities}),
      setGuesthouseMeta: ({hashtags = [], amenities = []}) =>
        set({
          guesthouseHashtags: hashtags,
          guesthouseAmenities: amenities,
          hasLoadedGuesthouseMeta: true,
        }),
      resetGuesthouseMeta: () =>
        set({
          guesthouseHashtags: [],
          guesthouseAmenities: [],
          hasLoadedGuesthouseMeta: false,
        }),
    }),
    {
      name: 'guesthouse-meta-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useGuesthouseMetaStore;
