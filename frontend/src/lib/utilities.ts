
export const getCSRFToken = () => {
  const token = document.querySelector('meta[name="csrf-token"]')
  if (!token) {
    throw new Error('CSRF token not found')
  }
  return token.getAttribute('content')
}