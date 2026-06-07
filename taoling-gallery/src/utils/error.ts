export function getErrorMessage(error: unknown, fallback = '请求失败，请稍后再试') {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
