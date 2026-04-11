export const formatMobileForWhatsApp = (mobile) => {
  // Remove all non-digit characters
  mobile = mobile.replace(/\D/g, "");

  // If number is 10 digits, assume India and prepend 91
  if (mobile.length === 10) {
    return "91" + mobile;
  }

  // If number already starts with 91 and is 12 digits, return as is
  if (mobile.length === 12 && mobile.startsWith("91")) {
    return mobile;
  }

  // Otherwise return as is (or handle error if needed)
  return mobile;
};
