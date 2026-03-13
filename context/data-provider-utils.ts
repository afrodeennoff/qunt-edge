type GroupWithAccounts = {
  accounts: Array<{ id: string }>
}

export function removeAccountFromGroups<GroupType extends GroupWithAccounts>(
  groups: GroupType[],
  accountId: string,
): GroupType[] {
  return groups.map((group) => ({
    ...group,
    accounts: group.accounts.filter((acc) => acc.id !== accountId),
  }))
}
