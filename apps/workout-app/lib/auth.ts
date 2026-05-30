import Cookies from 'js-cookie'

export const setTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1/96 }) // 15 phút
  localStorage.setItem('refreshToken', refreshToken)
}

export const getAccessToken = () => Cookies.get('accessToken')
export const getRefreshToken = () => localStorage.getItem('refreshToken')

export const clearTokens = () => {
  Cookies.remove('accessToken')
  localStorage.removeItem('refreshToken')
}