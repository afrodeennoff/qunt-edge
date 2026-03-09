import { SeverityTier } from './types'

export interface WidgetMessage {
  id: string
  topic: string
  sourceWidgetId: string
  targetWidgetId?: string
  riskTier: SeverityTier
  action: string
  payload: unknown
  riskToken: RiskToken
  timestamp: Date
  ttl?: number
  metadata?: Record<string, unknown>
}

export interface RiskToken {
  signature: string
  expiry: number
  riskLevel: SeverityTier
  payloadHash: string
}

export interface MessageSubscription {
  topic: string
  callback: (message: WidgetMessage) => void | Promise<void>
  filter?: MessageFilter
  subscriberId: string
}

export interface MessageFilter {
  sourceWidgetId?: string
  riskTier?: SeverityTier[]
  action?: string[]
  minRiskLevel?: SeverityTier
}

export class WidgetMessageBus {
  private subscriptions: Map<string, MessageSubscription[]> = new Map()
  private messageHistory: WidgetMessage[] = []
  private maxHistorySize: number = 1000
  private secretKey: string

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.WIDGET_MESSAGE_BUS_SECRET || 'default-secret-key-change-in-production'
  }

  async publish(message: Omit<WidgetMessage, 'id' | 'riskToken' | 'timestamp'>): Promise<string> {
    const messageId = this.generateMessageId()
    const riskToken = await this.generateRiskToken(message)

    const completeMessage: WidgetMessage = {
      ...message,
      id: messageId,
      riskToken,
      timestamp: new Date(),
    }

    const isValid = await this.validateRiskToken(completeMessage)
    if (!isValid) {
      throw new Error('Invalid risk token generated')
    }

    const topic = this.constructTopic(message)
    const subscribers = this.subscriptions.get(topic) || []

    const deliveryPromises = subscribers
      .filter(sub => this.matchesFilter(completeMessage, sub.filter))
      .map(async (sub) => {
        try {
          await sub.callback(completeMessage)
        } catch (error) {
          console.error(`[WidgetMessageBus] Error in subscriber ${sub.subscriberId}:`, error)
        }
      })

    await Promise.allSettled(deliveryPromises)

    this.addToHistory(completeMessage)

    return messageId
  }

  subscribe(subscription: Omit<MessageSubscription, 'subscriberId'>): string {
    const subscriberId = this.generateSubscriberId()
    const fullSubscription: MessageSubscription = {
      ...subscription,
      subscriberId,
    }

    const topic = subscription.topic
    const existing = this.subscriptions.get(topic) || []
    existing.push(fullSubscription)
    this.subscriptions.set(topic, existing)

    return subscriberId
  }

  unsubscribe(subscriberId: string): boolean {
    for (const [topic, subscribers] of this.subscriptions.entries()) {
      const index = subscribers.findIndex(sub => sub.subscriberId === subscriberId)
      if (index !== -1) {
        subscribers.splice(index, 1)
        if (subscribers.length === 0) {
          this.subscriptions.delete(topic)
        }
        return true
      }
    }
    return false
  }

  async subscribeWithValidation(
    subscription: Omit<MessageSubscription, 'subscriberId'>,
    validationFn: (message: WidgetMessage) => boolean | Promise<boolean>
  ): Promise<string> {
    const wrappedCallback = async (message: WidgetMessage) => {
      const isValid = await validationFn(message)
      if (isValid) {
        await subscription.callback(message)
      } else {
        console.warn(`[WidgetMessageBus] Message validation failed for ${subscription.topic}`)
      }
    }

    return this.subscribe({
      ...subscription,
      callback: wrappedCallback,
    })
  }

  getMessageHistory(filters?: MessageHistoryFilter): WidgetMessage[] {
    let history = [...this.messageHistory]

    if (filters) {
      if (filters.topic) {
        history = history.filter(msg => msg.topic.includes(filters.topic!))
      }
      if (filters.sourceWidgetId) {
        history = history.filter(msg => msg.sourceWidgetId === filters.sourceWidgetId)
      }
      if (filters.startDate) {
        history = history.filter(msg => msg.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        history = history.filter(msg => msg.timestamp <= filters.endDate!)
      }
      if (filters.minRiskTier) {
        const tierOrder: SeverityTier[] = ['Low', 'Medium', 'High', 'Critical']
        const minIndex = tierOrder.indexOf(filters.minRiskTier)
        history = history.filter(msg => tierOrder.indexOf(msg.riskTier) >= minIndex)
      }
    }

    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  clearHistory(): void {
    this.messageHistory = []
  }

  private constructTopic(message: Omit<WidgetMessage, 'id' | 'riskToken' | 'timestamp' | 'topic'>): string {
    const parts = [
      'widgets',
      message.sourceWidgetId.split('-')[0],
      message.sourceWidgetId,
      message.riskTier,
      message.action,
    ]
    return parts.join('/')
  }

  private async generateRiskToken(message: Omit<WidgetMessage, 'id' | 'riskToken' | 'timestamp'>): Promise<RiskToken> {
    const payloadStr = JSON.stringify(message.payload)
    const payloadHash = this.simpleHash(payloadStr)
    const signature = this.simpleHash(`${payloadHash}:${Date.now()}:${this.secretKey}`)
    const expiry = Date.now() + (message.ttl || 300000)

    return {
      signature,
      expiry,
      riskLevel: message.riskTier,
      payloadHash,
    }
  }

  private async validateRiskToken(message: WidgetMessage): Promise<boolean> {
    const { riskToken, payload } = message

    if (Date.now() > riskToken.expiry) {
      console.warn('[WidgetMessageBus] Risk token expired')
      return false
    }

    const payloadStr = JSON.stringify(payload)
    const payloadHash = this.simpleHash(payloadStr)

    if (payloadHash !== riskToken.payloadHash) {
      console.warn('[WidgetMessageBus] Payload hash mismatch')
      return false
    }

    return true
  }

  private matchesFilter(message: WidgetMessage, filter?: MessageFilter): boolean {
    if (!filter) return true

    if (filter.sourceWidgetId && message.sourceWidgetId !== filter.sourceWidgetId) {
      return false
    }

    if (filter.riskTier && !filter.riskTier.includes(message.riskTier)) {
      return false
    }

    if (filter.action && !filter.action.includes(message.action)) {
      return false
    }

    if (filter.minRiskLevel) {
      const tierOrder: SeverityTier[] = ['Low', 'Medium', 'High', 'Critical']
      const msgIndex = tierOrder.indexOf(message.riskTier)
      const minIndex = tierOrder.indexOf(filter.minRiskLevel)
      if (msgIndex < minIndex) {
        return false
      }
    }

    return true
  }

  private addToHistory(message: WidgetMessage): void {
    this.messageHistory.push(message)

    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-Math.floor(this.maxHistorySize / 2))
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSubscriberId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }
}

export interface MessageHistoryFilter {
  topic?: string
  sourceWidgetId?: string
  startDate?: Date
  endDate?: Date
  minRiskTier?: SeverityTier
}

const singletonInstance = new WidgetMessageBus()

export function getWidgetMessageBus(): WidgetMessageBus {
  return singletonInstance
}
