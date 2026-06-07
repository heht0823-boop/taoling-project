import { requestData } from '@/utils/request'
import type { AuthResult, LoginParams, MeResult, RegisterParams } from '@/types/auth'

/** 注册普通用户账号。 */
export function registerApi(params: RegisterParams) {
  return requestData<AuthResult>({
    url: '/auth/register',
    method: 'POST',
    data: params,
  })
}

/** 使用用户名或邮箱登录，管理员与普通用户共用入口。 */
export function loginApi(params: LoginParams) {
  return requestData<AuthResult>({
    url: '/auth/login',
    method: 'POST',
    data: params,
  })
}

/** 通过 HttpOnly Cookie 恢复当前用户信息。 */
export function getMeApi() {
  return requestData<MeResult>({
    url: '/auth/me',
    method: 'GET',
    showError: false,
  })
}

/** 清除后端 HttpOnly 登录 Cookie。 */
export function logoutApi() {
  return requestData<Record<string, never>>({
    url: '/auth/logout',
    method: 'POST',
  })
}
