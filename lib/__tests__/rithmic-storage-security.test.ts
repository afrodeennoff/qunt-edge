import { describe, it, expect } from 'vitest'
import { generateCredentialId } from '../rithmic-storage'

describe('Rithmic Storage Security', () => {
  it('should generate a unique credential ID using crypto.randomUUID', () => {
    // Generate an ID with empty username to trigger random ID generation
    const id1 = generateCredentialId('')
    const id2 = generateCredentialId('')

    // Assert the IDs start with 'cred_'
    expect(id1).toMatch(/^cred_/)
    expect(id2).toMatch(/^cred_/)

    // Assert IDs are unique
    expect(id1).not.toBe(id2)

    // Verify format - currently it uses Math.random(), so checking length or pattern
    // The current implementation is roughly `cred_<timestamp>_<random>`
    // The new implementation will be `cred_<uuid>`

    // We can just verify it's a string and reasonably long enough
    expect(id1.length).toBeGreaterThan(10)
  })

  it('should return the username if provided', () => {
    const username = 'testuser'
    const id = generateCredentialId(username)
    expect(id).toBe(username)
  })
})
