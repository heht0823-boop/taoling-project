const USER_STORE_KEY = 'taoling-user'

export function clearAuthState() {
  localStorage.removeItem(USER_STORE_KEY)
}
