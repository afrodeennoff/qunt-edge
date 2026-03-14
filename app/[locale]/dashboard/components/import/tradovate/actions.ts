'use server'

import {
  getTradovateAccounts as getTradovateAccountsInternal,
  getTradovateSynchronizations as getTradovateSynchronizationsInternal,
  getTradovateTrades as getTradovateTradesInternal,
  handleTradovateCallback as handleTradovateCallbackInternal,
  initiateTradovateOAuth as initiateTradovateOAuthInternal,
  removeTradovateToken as removeTradovateTokenInternal,
  setCustomTradovateToken as setCustomTradovateTokenInternal,
  storeTradovateToken as storeTradovateTokenInternal,
  testCustomTradovateToken as testCustomTradovateTokenInternal,
  updateDailySyncTimeAction as updateDailySyncTimeActionInternal,
} from '@/server/imports/tradovate-actions'

export async function getTradovateAccounts(accessToken: string) {
  return getTradovateAccountsInternal(accessToken)
}

export async function getTradovateSynchronizations() {
  return getTradovateSynchronizationsInternal()
}

export async function getTradovateTrades(accessToken: string, options?: { userId?: string }) {
  return getTradovateTradesInternal(accessToken, options)
}

export async function handleTradovateCallback(code: string, state: string) {
  return handleTradovateCallbackInternal(code, state)
}

export async function initiateTradovateOAuth(accountId: string = 'default') {
  return initiateTradovateOAuthInternal(accountId)
}

export async function removeTradovateToken(accountId?: string) {
  return removeTradovateTokenInternal(accountId)
}

export async function setCustomTradovateToken(accessToken: string, accountId: string = 'default') {
  return setCustomTradovateTokenInternal(accessToken, accountId)
}

export async function storeTradovateToken(token: string, accountId: string = 'default') {
  return storeTradovateTokenInternal(token, accountId)
}

export async function testCustomTradovateToken(accessToken: string) {
  return testCustomTradovateTokenInternal(accessToken)
}

export async function updateDailySyncTimeAction(accountId: string, syncTime: string | null) {
  return updateDailySyncTimeActionInternal(accountId, syncTime)
}
