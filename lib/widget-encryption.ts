import { DashboardLayoutWithWidgets, Widget } from '@/store/user-store'

export interface EncryptionResult {
  success: boolean
  data?: string
  error?: string
}

export interface DecryptionResult {
  success: boolean
  data?: DashboardLayoutWithWidgets
  error?: string
}

class WidgetEncryptionService {
  private algorithm = 'AES-GCM'
  private keyLength = 256
  private ivLength = 12
  private saltLength = 16
  private tagLength = 128
  private constantSalt = 'widget-encryption-salt-v1'

  private async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    )
  }

  private async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  private async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('jwk', key)
    return btoa(JSON.stringify(exported))
  }

  private async importKey(keyString: string): Promise<CryptoKey> {
    const exported = JSON.parse(atob(keyString))
    return crypto.subtle.importKey(
      'jwk',
      exported,
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    )
  }

  private async getEncryptionKey(userId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    // Pad or slice salt to ensure consistent length/format if needed,
    // but deriveKey accepts any length salt for PBKDF2 usually.
    // However, keeping it simple.
    const salt = encoder.encode(this.constantSalt)
    return this.deriveKey(userId, salt)
  }

  async encryptLayout(
    layout: DashboardLayoutWithWidgets,
    encryptionKey?: CryptoKey
  ): Promise<EncryptionResult> {
    try {
      const key = encryptionKey || await this.generateKey()
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength))
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(layout))

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      )

      const combined = new Uint8Array(
        this.ivLength + encryptedData.byteLength
      )
      combined.set(iv)
      combined.set(new Uint8Array(encryptedData), this.ivLength)

      const result = btoa(String.fromCharCode(...combined))

      if (!encryptionKey) {
        const exportedKey = await this.exportKey(key)
        return {
          success: true,
          data: `${result}:${exportedKey}`
        }
      }

      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed'
      }
    }
  }

  async decryptLayout(
    encryptedData: string,
    keyString?: string
  ): Promise<DecryptionResult> {
    try {
      let actualData = encryptedData
      let key: CryptoKey

      if (keyString) {
        key = await this.importKey(keyString)
      } else if (encryptedData.includes(':')) {
        const [data, keyData] = encryptedData.split(':')
        actualData = data
        key = await this.importKey(keyData)
      } else {
        return {
          success: false,
          error: 'Decryption key not provided'
        }
      }

      const combined = Uint8Array.from(atob(actualData), c => c.charCodeAt(0))
      const iv = combined.slice(0, this.ivLength)
      const data = combined.slice(this.ivLength)

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      )

      const decoder = new TextDecoder()
      const layout = JSON.parse(decoder.decode(decryptedData))

      return {
        success: true,
        data: layout
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      }
    }
  }

  async encryptSensitiveFields(widget: Widget, key: CryptoKey): Promise<Widget> {
    const sensitiveFields: (keyof Widget)[] = ['i']
    const encrypted = { ...widget }
    const encoder = new TextEncoder()

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        try {
          const value = String(encrypted[field])
          const encodedValue = encoder.encode(value)
          const iv = crypto.getRandomValues(new Uint8Array(this.ivLength))

          const ciphertext = await crypto.subtle.encrypt(
            { name: this.algorithm, iv },
            key,
            encodedValue
          )

          const combined = new Uint8Array(iv.length + ciphertext.byteLength)
          combined.set(iv)
          combined.set(new Uint8Array(ciphertext), iv.length)

          // Use btoa for storage
          const base64 = btoa(String.fromCharCode(...combined))
          ;(encrypted as any)[field] = base64
        } catch (error) {
          console.error('Field encryption failed', error)
          // Keep original value on error to avoid data loss
        }
      }
    }

    return encrypted
  }

  async decryptSensitiveFields(widget: Widget, key: CryptoKey): Promise<Widget> {
    const sensitiveFields: (keyof Widget)[] = ['i']
    const decrypted = { ...widget }
    const decoder = new TextDecoder()

    for (const field of sensitiveFields) {
      if (decrypted[field]) {
        const value = String(decrypted[field])
        try {
          // Try AES-GCM decryption
          const combined = Uint8Array.from(atob(value), c => c.charCodeAt(0))

          if (combined.length < this.ivLength) {
            throw new Error('Invalid encrypted data length')
          }

          const iv = combined.slice(0, this.ivLength)
          const data = combined.slice(this.ivLength)

          const decryptedData = await crypto.subtle.decrypt(
            { name: this.algorithm, iv },
            key,
            data
          )

          ;(decrypted as any)[field] = decoder.decode(decryptedData)
        } catch (e) {
          // Fallback to legacy base64 decoding
          try {
            const decoded = decodeURIComponent(atob(value))
            ;(decrypted as any)[field] = decoded
          } catch {
            // If both fail, keep original
            continue
          }
        }
      }
    }

    return decrypted
  }

  async encryptLayoutData(layout: DashboardLayoutWithWidgets): Promise<DashboardLayoutWithWidgets> {
    const key = await this.getEncryptionKey(layout.userId)
    const desktop = await Promise.all(layout.desktop.map(w => this.encryptSensitiveFields(w, key)))
    const mobile = await Promise.all(layout.mobile.map(w => this.encryptSensitiveFields(w, key)))

    return {
      ...layout,
      desktop,
      mobile
    }
  }

  async decryptLayoutData(layout: DashboardLayoutWithWidgets): Promise<DashboardLayoutWithWidgets> {
    const key = await this.getEncryptionKey(layout.userId)
    const desktop = await Promise.all(layout.desktop.map(w => this.decryptSensitiveFields(w, key)))
    const mobile = await Promise.all(layout.mobile.map(w => this.decryptSensitiveFields(w, key)))

    return {
      ...layout,
      desktop,
      mobile
    }
  }

  hashLayout(layout: DashboardLayoutWithWidgets): string {
    const str = JSON.stringify({ desktop: layout.desktop, mobile: layout.mobile })
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  async verifyIntegrity(
    layout: DashboardLayoutWithWidgets,
    expectedChecksum: string
  ): Promise<boolean> {
    const calculatedHash = this.hashLayout(layout)
    return calculatedHash === expectedChecksum
  }
}

export const widgetEncryptionService = new WidgetEncryptionService()
