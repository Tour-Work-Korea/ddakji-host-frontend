export const formatPhoneNumber = value => {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('02')) {
    if (digits.length === 9) {
      return digits.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  return String(value ?? '');
};
