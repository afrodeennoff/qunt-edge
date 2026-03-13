import { describe, expect, it } from "vitest"
import { removeAccountFromGroups } from "@/context/data-provider-utils"

type TestAccount = { id: string }
type TestGroup = {
  id: string
  name: string
  accounts: TestAccount[]
}

const makeAccount = (id: string): TestAccount => ({ id })

const makeGroup = (groupId: string, accounts: TestAccount[]): TestGroup => ({
  id: groupId,
  name: `${groupId}-group`,
  accounts,
})

describe("removeAccountFromGroups", () => {
  it("removes the specified account from every group", () => {
    const accountA = makeAccount("account-A")
    const accountB = makeAccount("account-B")
    const groups = [
      makeGroup("group-1", [accountA, accountB]),
      makeGroup("group-2", [accountA]),
    ]

    const result = removeAccountFromGroups(groups, accountA.id)

    expect(result[0].accounts).toEqual([accountB])
    expect(result[1].accounts).toEqual([])
    expect(result[0].accounts).not.toContain(accountA)
    expect(result[1].accounts).not.toContain(accountA)
  })

  it("returns new group objects even when the account is missing", () => {
    const accountC = makeAccount("account-C")
    const groups = [
      makeGroup("group-1", [accountC]),
    ]

    const result = removeAccountFromGroups(groups, "missing-account")

    expect(result[0].accounts).toEqual(groups[0].accounts)
    expect(result[0]).not.toBe(groups[0])
    expect(result[0].accounts).not.toBe(groups[0].accounts)
  })
})
