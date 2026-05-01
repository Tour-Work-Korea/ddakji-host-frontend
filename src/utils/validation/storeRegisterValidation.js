export const isValidName = name => name.trim().length > 0;

export const isValidImageUri = uri => typeof uri === 'string' && uri.length > 0;

export const validateStoreForm1 = form => {
  const errors = [];

  if (!isValidName(form.name)) {
    errors.push('상호명 또는 법인명을 입력해주세요.');
  }
  if (!isValidImageUri(form.img?.uri)) {
    errors.push('사업자 등록증 이미지를 첨부해주세요.');
  }
  if (!isValidImageUri(form.bankbookImg?.uri)) {
    errors.push('통장 사본 이미지를 첨부해주세요.');
  }
  if (!isValidImageUri(form.licenseImg?.uri)) {
    errors.push('영업 신고증 이미지를 첨부해주세요.');
  }

  return errors;
};

export const validateStoreForm2 = form => {
  const errors = [];

  if (!isValidName(form.guesthouseName)) {
    errors.push('게스트하우스 이름을 입력해주세요.');
  }
  if (!isValidImageUri(form.profileImg)) {
    errors.push('게스트하우스 프로필 이미지를 첨부해주세요.');
  }

  return errors;
};

// 전체 폼 유효성 검사
export const validateStoreForm = form => {
  const errors = [];

  if (!isValidName(form.name)) {
    errors.push('상호명 또는 법인명을 입력해주세요.');
  }
  if (!isValidImageUri(form.img?.uri)) {
    errors.push('사업자 등록증 이미지를 첨부해주세요.');
  }
  if (!isValidImageUri(form.bankbookImg?.uri)) {
    errors.push('통장 사본 이미지를 첨부해주세요.');
  }
  if (!isValidImageUri(form.licenseImg?.uri)) {
    errors.push('영업 신고증 이미지를 첨부해주세요.');
  }
  if (!isValidName(form.guesthouseName)) {
    errors.push('게스트하우스 이름을 입력해주세요.');
  }
  if (!isValidImageUri(form.profileImg)) {
    errors.push('게스트하우스 프로필 이미지를 첨부해주세요.');
  }

  return errors;
};
