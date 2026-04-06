const AMENITY_SECTION_ORDER = ['숙소 공용시설', '객실 내 시설', '기타 시설 및 서비스'];

const normalizeMetaValue = value =>
  String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase();

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
