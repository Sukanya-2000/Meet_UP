export const getApiError = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
