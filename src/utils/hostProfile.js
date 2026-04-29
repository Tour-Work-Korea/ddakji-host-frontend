const normalizeProfileImageUrl = value => {
  if (!value || value === '사진을 추가해주세요') {
    return null;
  }

  return value;
};

const normalizeGuesthouseProfiles = (data, applicationsData) => {
  if (Array.isArray(applicationsData)) {
    return applicationsData.map((application, index) => ({
      profileKey: String(
        application?.guesthouseId ??
        application?.applicationId ??
        application?.id ??
        `application-${index}`,
      ),
      applicationId: application?.applicationId ?? application?.id ?? null,
      guesthouseId: application?.guesthouseId ?? null,
      guesthouseName: application?.guesthouseName || '게스트하우스',
      profileImageUrl: normalizeProfileImageUrl(
        application?.guesthouseProfileImageUrl ??
        application?.profileImageUrl,
      ),
      guesthouseStatus: application?.guesthouseStatus ?? application?.status ?? null,
      applicationStatus: application?.applicationStatus ?? application?.status ?? null,
      isDraftExists: Boolean(application?.isDraftExists),
      isCompleted: Boolean(application?.isCompleted),
    }));
  }

  if (Array.isArray(data?.guesthouseProfiles)) {
    return data.guesthouseProfiles
      .map((guesthouse, index) => ({
        profileKey: String(
          guesthouse?.guesthouseId ??
          guesthouse?.applicationId ??
          `guesthouse-${index}`,
        ),
        applicationId: guesthouse?.applicationId ?? null,
        guesthouseId: guesthouse?.guesthouseId ?? null,
        guesthouseName: guesthouse?.guesthouseName || '게스트하우스',
        profileImageUrl: normalizeProfileImageUrl(guesthouse?.profileImageUrl),
      }))
      .filter(guesthouse => Boolean(guesthouse.guesthouseName));
  }

  if (Array.isArray(data?.applications)) {
    return data.applications.map((application, index) => ({
      profileKey: String(
        application?.guesthouseId ??
        application?.applicationId ??
        `application-${index}`,
      ),
      applicationId: application?.applicationId ?? null,
      guesthouseId: application?.guesthouseId ?? null,
      guesthouseName: application?.guesthouseName || '게스트하우스',
      profileImageUrl: normalizeProfileImageUrl(
        application?.guesthouseProfileImageUrl ??
        application?.profileImageUrl,
      ),
      guesthouseStatus: application?.guesthouseStatus ?? null,
      applicationStatus: application?.applicationStatus ?? null,
      isDraftExists: Boolean(application?.isDraftExists),
      isCompleted: Boolean(application?.isCompleted),
    }));
  }

  return [];
};

export const normalizeHostProfile = (data, applicationsData = null) => ({
  hostId: data?.hostId ?? null,
  name: data?.name ?? '',
  photoUrl: normalizeProfileImageUrl(data?.photoUrl),
  phone: data?.phone ?? '',
  email: data?.email ?? '',
  businessNum: data?.businessNum ?? '',
  guesthouseProfiles: normalizeGuesthouseProfiles(data, applicationsData),
});
