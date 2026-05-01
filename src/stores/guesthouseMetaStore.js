import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const extractArray = value => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  return [];
};

const normalizeHashtag = item => ({
  id: item?.id,
  hashtag: item?.hashtag ?? '',
  hashtagType: item?.hashtagType ?? '',
});

const normalizeAmenity = item => ({
  id: item?.id,
  name: item?.name ?? '',
  amenityType: item?.amenityType ?? '',
  category: item?.category ?? '',
});

const useGuesthouseMetaStore = create(
  persist(
    set => ({
      guesthouseHashtags: [],
      guesthouseAmenities: [],
      hasLoadedGuesthouseMeta: false,

      setGuesthouseHashtags: guesthouseHashtags =>
        set({
          guesthouseHashtags: extractArray(guesthouseHashtags).map(
            normalizeHashtag,
          ),
        }),
      setGuesthouseAmenities: guesthouseAmenities =>
        set({
          guesthouseAmenities: extractArray(guesthouseAmenities).map(
            normalizeAmenity,
          ),
        }),
      setGuesthouseMeta: ({hashtags = [], amenities = []}) =>
        set({
          guesthouseHashtags: extractArray(hashtags).map(normalizeHashtag),
          guesthouseAmenities: extractArray(amenities).map(normalizeAmenity),
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
