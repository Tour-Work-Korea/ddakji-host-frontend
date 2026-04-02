export const isValidName = name => name.trim().length > 0;

export const isValidBusinessType = type => type.trim().length > 0;

export const isValidEmployeeCount = count =>
  !isNaN(count) && parseInt(count, 10) >= 0;

export const isValidPhone = phone => /^0\d{8,}$/.test(phone);

export const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidAddress = address => address.trim().length > 0;

export const isValidBusinessNumber = number => /^\d{10}$/.test(number); // 숫자 10자리

export const isValidImageUri = uri => typeof uri === 'string' && uri.length > 0;

export const validateStoreForm1 = form => {
  const errors = [];

  if (!isValidName(form.name)) {
    errors.push('상호명 또는 법인명을 입력해주세요.');
  }
  if (!isValidBusinessType(form.businessType)) {
    errors.push('사업장 유형을 입력해주세요.');
  }
  if (!isValidPhone(form.businessPhone)) {
    errors.push('전화번호 형식을 확인해주세요.');
  }
  if (!isValidAddress(form.address)) {
    errors.push('주소를 입력해주세요.');
  }
  if (!isValidImageUri(form.img?.uri)) {
    errors.push('사업자 등록증 이미지를 첨부해주세요.');
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
  if (!isValidBusinessType(form.businessType)) {
    errors.push('사업장 유형을 입력해주세요.');
  }
  if (!isValidPhone(form.businessPhone)) {
    errors.push('전화번호 형식을 확인해주세요.');
  }
  if (!isValidAddress(form.address)) {
    errors.push('주소를 입력해주세요.');
  }
  if (!isValidImageUri(form.img?.uri)) {
    errors.push('사업자 등록증 이미지를 첨부해주세요.');
  }
  if (!isValidName(form.guesthouseName)) {
    errors.push('게스트하우스 이름을 입력해주세요.');
  }
  if (!isValidImageUri(form.profileImg)) {
    errors.push('게스트하우스 프로필 이미지를 첨부해주세요.');
  }

  return errors;
};
