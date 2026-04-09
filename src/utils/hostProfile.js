const normalizeProfileImageUrl = value => {
  if (!value || value === '사진을 추가해주세요') {
    return null;
  }

  return value;
};

const normalizeGuesthouseProfiles = data => {
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
        guesthouseName: guesthouse?.guesthouseName ?? '',
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
      guesthouseName: application?.businessName ?? '게스트하우스',
      profileImageUrl: normalizeProfileImageUrl(application?.profileImageUrl),
      guesthouseStatus: application?.guesthouseStatus ?? null,
      applicationStatus: application?.applicationStatus ?? null,
      isDraftExists: Boolean(application?.isDraftExists),
      isCompleted: Boolean(application?.isCompleted),
    }));
  }

  return [];
};

export const normalizeHostProfile = data => ({
  hostId: data?.hostId ?? null,
  name: data?.name ?? '',
  photoUrl: normalizeProfileImageUrl(data?.photoUrl),
  phone: data?.phone ?? '',
  email: data?.email ?? '',
  businessNum: data?.businessNum ?? '',
  guesthouseProfiles: normalizeGuesthouseProfiles(data),
});
