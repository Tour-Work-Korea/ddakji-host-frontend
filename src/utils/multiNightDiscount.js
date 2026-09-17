// A missing policy is intentionally different from an explicit disable request.
export const validateMultiNightDiscount = policy => {
  if (!policy?.enabled) {
    return '';
  }
  if (
    !['ADDITIONAL_NIGHTS', 'ENTIRE_STAY'].includes(policy.basis) ||
    !['FIXED', 'PERCENT'].includes(policy.type)
  ) {
    return '할인 적용 기준과 방식을 선택해 주세요.';
  }
  const raw = String(policy.value ?? '');
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value)) {
    return '할인값을 정수로 입력해 주세요.';
  }
  if (policy.type === 'FIXED' && value < 100) {
    return '정액 할인은 100원 이상 입력해 주세요.';
  }
  if (policy.type === 'PERCENT' && (value < 1 || value > 99)) {
    return '정률 할인은 1~99%로 입력해 주세요.';
  }
  return '';
};

export const toMultiNightDiscountRequest = policy => {
  if (policy == null) {
    return undefined;
  }
  if (!policy.enabled) {
    return {enabled: false};
  }
  const error = validateMultiNightDiscount(policy);
  if (error) {
    throw new Error(error);
  }
  return {
    enabled: true,
    basis: policy.basis,
    type: policy.type,
    value: Number(policy.value),
  };
};

export const describeMultiNightDiscount = policy => {
  if (!policy?.enabled || validateMultiNightDiscount(policy)) {
    return '';
  }
  const basis =
    policy.basis === 'ADDITIONAL_NIGHTS' ? '추가 1박당' : '전체 객실 금액에서';
  const value = `${Number(policy.value).toLocaleString('ko-KR')}${
    policy.type === 'FIXED' ? '원' : '%'
  }`;
  return `2박 이상 예약할 경우 ${basis} ${value} 할인됩니다.`;
};

export const getMultiNightDiscountError = error => {
  const body = error?.response?.data;
  const detail = body?.code ? body : body?.data;
  return detail?.code === 'INVALID_MULTI_NIGHT_DISCOUNT'
    ? detail.message ||
        '연박할인 적용 후 객실료가 0원 이하입니다. 할인값 또는 객실 가격을 조정해 주세요.'
    : '';
};
