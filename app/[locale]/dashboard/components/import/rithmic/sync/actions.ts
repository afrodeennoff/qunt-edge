'use server'

import {
  getRithmicSynchronizations as getRithmicSynchronizationsInternal,
  removeRithmicSynchronization as removeRithmicSynchronizationInternal,
  setRithmicSynchronization as setRithmicSynchronizationInternal,
} from '@/server/imports/rithmic-sync-actions'

export async function getRithmicSynchronizations() {
  return getRithmicSynchronizationsInternal()
}

export async function setRithmicSynchronization(...args: Parameters<typeof setRithmicSynchronizationInternal>) {
  return setRithmicSynchronizationInternal(...args)
}

export async function removeRithmicSynchronization(accountId: string) {
  return removeRithmicSynchronizationInternal(accountId)
}
