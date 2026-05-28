import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import useGuesthouseMetaStore from '@stores/guesthouseMetaStore';
import {
  findAmenityMeta,
  getAmenitySectionLabel,
  groupAmenitiesBySection,
} from '@utils/guesthouseMeta';

const normalizeAmenity = (amenity, index, guesthouseAmenities) => {
  const name =
    typeof amenity === 'string'
      ? amenity
      : amenity?.name ?? amenity?.amenityName ?? amenity?.amenityType ?? '';
  const meta = findAmenityMeta(guesthouseAmenities, amenity);

  return {
    id:
      meta?.id ??
      (typeof amenity === 'object' ? amenity?.amenityId ?? amenity?.id : null) ??
      index,
    name: meta?.name ?? name,
    amenityName: meta?.name ?? name,
    amenityType:
      meta?.amenityType ??
      (typeof amenity === 'string'
        ? amenity
        : amenity?.amenityType ?? amenity?.amenityName ?? amenity?.name ?? ''),
    category:
      meta?.category ??
      (typeof amenity === 'object' ? amenity?.category : null) ??
      getAmenitySectionLabel(amenity),
  };
};

const getSelectedKeys = selectedAmenities =>
  new Set(
    selectedAmenities
      .map(amenity => {
        if (typeof amenity === 'string') {
          return [amenity];
        }

        const isDetailAmenity = amenity?.amenityName;

        return [
          amenity?.amenityId,
          isDetailAmenity ? null : amenity?.id,
          amenity?.name,
          amenity?.amenityName,
          amenity?.amenityType,
          amenity?.type,
          amenity?.code,
        ];
      })
      .flat()
      .filter(value => value !== undefined && value !== null)
      .map(String),
  );

const ServiceInfoContent = ({selectedAmenities = []}) => {
  const guesthouseAmenities = useGuesthouseMetaStore(
    state => state.guesthouseAmenities,
  );

  const amenitySections = useMemo(() => {
    const source =
      guesthouseAmenities.length > 0
        ? guesthouseAmenities
        : selectedAmenities.map((amenity, index) =>
            normalizeAmenity(amenity, index, guesthouseAmenities),
          );

    return groupAmenitiesBySection(source);
  }, [guesthouseAmenities, selectedAmenities]);

  const selectedKeys = useMemo(
    () => getSelectedKeys(selectedAmenities),
    [selectedAmenities],
  );

  const renderSection = (title, items) => (
    <View key={title} style={styles.section}>
      <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>{title}</Text>
      <View style={styles.tagWrapper}>
        {items.map((item, index) => {
          const itemKey = String(item.id ?? item.name ?? index);
          const isSelected =
            selectedKeys.has(String(item.id)) ||
            selectedKeys.has(String(item.name)) ||
            selectedKeys.has(String(item.amenityName)) ||
            selectedKeys.has(String(item.amenityType));

          return (
            <View key={itemKey} style={styles.tag}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tagText,
                  isSelected && styles.selectedTagText,
                  isSelected && FONTS.fs_14_semibold,
                ]}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {amenitySections.map(section => renderSection(section.title, section.items))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 28,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
  },
  tagWrapper: {
    marginTop: 12,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 4,
  },
  tag: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: 10,
    width: '48%',
    marginBottom: 4,
  },
  tagText: {
    color: COLORS.grayscale_400,
  },
  selectedTagText: {
    color: COLORS.primary_orange,
  },
});

export default ServiceInfoContent;
