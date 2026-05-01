const AMENITY_SECTION_ORDER = ['숙소 공용시설', '객실 내 시설', '기타 시설 및 서비스'];

export const normalizeMetaValue = value =>
  String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase();

const toKey = value => String(value ?? '').trim();

export const findHashtagMeta = (hashtags = [], value) => {
  const id = value?.id ?? value?.hashtagId ?? value;
  const hashtag = value?.hashtag ?? value?.name ?? value;
  const hashtagType = value?.hashtagType ?? value?.type;

  return hashtags.find(
    item =>
      String(item.id) === String(id) ||
      toKey(item.hashtag) === toKey(hashtag) ||
      toKey(item.hashtagType) === toKey(hashtagType),
  );
};

export const findAmenityMeta = (amenities = [], value) => {
  const isDetailAmenity = value && typeof value === 'object' && value.amenityName;
  const id = value?.amenityId ?? (isDetailAmenity ? undefined : value?.id) ?? value;
  const name = value?.name ?? value?.amenityName ?? value;
  const amenityType = value?.amenityType ?? value?.type ?? value?.code;
  const candidates = new Set(
    [name, amenityType, value?.amenityName, value?.type, value?.code]
      .map(toKey)
      .filter(Boolean),
  );

  return amenities.find(
    item =>
      String(item.id) === String(id) ||
      candidates.has(toKey(item.name)) ||
      candidates.has(toKey(item.amenityType)),
  );
};

export const resolveHashtagMetas = (values = [], hashtags = []) =>
  (values || [])
    .map(value => findHashtagMeta(hashtags, value))
    .filter(Boolean);

export const resolveAmenityMetas = (values = [], amenities = []) =>
  (values || [])
    .map(value => findAmenityMeta(amenities, value))
    .filter(Boolean);

export const resolveAmenityIds = (values = [], amenities = []) =>
  resolveAmenityMetas(values, amenities).map(amenity => amenity.id);

export const getAmenitySectionLabel = amenity => {
  const rawCategory = String(amenity?.category || '');
  const rawType = String(amenity?.amenityType || '');
  const normalized = `${normalizeMetaValue(rawCategory)} ${normalizeMetaValue(
    rawType,
  )}`.trim();

  if (normalized.includes('ACCOMMODATION')) {
    return '숙소 공용시설';
  }

  if (
    rawCategory.includes('공용') ||
    normalized.includes('PUBLIC') ||
    normalized.includes('COMMON')
  ) {
    return '숙소 공용시설';
  }

  if (rawCategory.includes('객실') || normalized.includes('ROOM')) {
    return '객실 내 시설';
  }

  if (
    rawCategory.includes('서비스') ||
    rawCategory.includes('기타') ||
    normalized.includes('SERVICE') ||
    normalized.includes('ETC') ||
    normalized.includes('OTHER')
  ) {
    return '기타 시설 및 서비스';
  }

  return '기타 시설 및 서비스';
};

export const groupAmenitiesBySection = amenities => {
  const grouped = new Map(
    AMENITY_SECTION_ORDER.map(section => [section, []]),
  );

  (amenities || []).forEach(amenity => {
    const section = getAmenitySectionLabel(amenity);
    grouped.get(section)?.push(amenity);
  });

  return AMENITY_SECTION_ORDER.map(title => ({
    title,
    items: grouped.get(title) || [],
  })).filter(section => section.items.length > 0);
};
