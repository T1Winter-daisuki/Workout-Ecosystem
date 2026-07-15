import Cookies from 'js-cookie'

export const clearTokens = () => {
  Cookies.remove('role')
  Cookies.remove('emailVerified')
}
