import { SeverityTier } from './types'

export interface MitigationStrategy {
  id: string
  name: string
  description: string
  priority: number
  category: 'preventive' | 'detective' | 'corrective' | 'compensating'
  effort: 'low' | 'medium' | 'high'
}

export class MitigationProvider {
  private mitigationLibrary: Map<SeverityTier, MitigationStrategy[]>

  constructor() {
    this.mitigationLibrary = new Map()
    this.initializeMitigationLibrary()
  }

  getMitigations(severity: SeverityTier, action: string): string[] {
    const strategies = this.mitigationLibrary.get(severity) || []
    const actionSpecific = this.getActionSpecificMitigations(action)

    const allStrategies = [...strategies, ...actionSpecific]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)

    return allStrategies.map(s => s.description)
  }

  getMitigationStrategies(severity: SeverityTier): MitigationStrategy[] {
    return this.mitigationLibrary.get(severity) || []
  }

  addMitigationStrategy(severity: SeverityTier, strategy: MitigationStrategy): void {
    const strategies = this.mitigationLibrary.get(severity) || []
    strategies.push(strategy)
    this.mitigationLibrary.set(severity, strategies)
  }

  private initializeMitigationLibrary(): void {
    this.mitigationLibrary.set('Critical', [
      {
        id: 'crit-001',
        name: 'Immediate Action Block',
        description: 'Block the action immediately and escalate to security team',
        priority: 100,
        category: 'preventive',
        effort: 'low',
      },
      {
        id: 'crit-002',
        name: 'Multi-Factor Authentication',
        description: 'Require additional authentication factors from multiple administrators',
        priority: 95,
        category: 'preventive',
        effort: 'medium',
      },
      {
        id: 'crit-003',
        name: 'Real-time Monitoring',
        description: 'Enable real-time monitoring and alerting for all related activities',
        priority: 90,
        category: 'detective',
        effort: 'medium',
      },
      {
        id: 'crit-004',
        name: 'Formal Risk Assessment',
        description: 'Conduct comprehensive risk assessment with documented mitigation plan',
        priority: 85,
        category: 'corrective',
        effort: 'high',
      },
      {
        id: 'crit-005',
        name: 'Audit Trail Enhancement',
        description: 'Implement comprehensive audit logging with tamper-evident storage',
        priority: 80,
        category: 'detective',
        effort: 'medium',
      },
    ])

    this.mitigationLibrary.set('High', [
      {
        id: 'high-001',
        name: 'User Consent Required',
        description: 'Require explicit user authorization before proceeding with the action',
        priority: 90,
        category: 'preventive',
        effort: 'low',
      },
      {
        id: 'high-002',
        name: 'Enhanced Logging',
        description: 'Log all relevant details including user intent and context',
        priority: 85,
        category: 'detective',
        effort: 'low',
      },
      {
        id: 'high-003',
        name: 'Control Effectiveness Review',
        description: 'Review and strengthen existing control mechanisms',
        priority: 80,
        category: 'corrective',
        effort: 'medium',
      },
      {
        id: 'high-004',
        name: 'Conditional Access',
        description: 'Implement context-aware access controls based on risk factors',
        priority: 75,
        category: 'preventive',
        effort: 'medium',
      },
      {
        id: 'high-005',
        name: 'Transaction Limits',
        description: 'Apply appropriate limits to prevent excessive impact',
        priority: 70,
        category: 'compensating',
        effort: 'low',
      },
    ])

    this.mitigationLibrary.set('Medium', [
      {
        id: 'med-001',
        name: 'Standard Logging',
        description: 'Ensure standard audit logging is enabled and functioning',
        priority: 70,
        category: 'detective',
        effort: 'low',
      },
      {
        id: 'med-002',
        name: 'Periodic Review',
        description: 'Schedule regular review of action patterns and outcomes',
        priority: 65,
        category: 'detective',
        effort: 'medium',
      },
      {
        id: 'med-003',
        name: 'User Notification',
        description: 'Notify users of important actions for transparency',
        priority: 60,
        category: 'preventive',
        effort: 'low',
      },
      {
        id: 'med-004',
        name: 'Automated Validation',
        description: 'Implement automated validation of input data and parameters',
        priority: 55,
        category: 'preventive',
        effort: 'medium',
      },
      {
        id: 'med-005',
        name: 'Fallback Controls',
        description: 'Ensure fallback mechanisms are in place if primary controls fail',
        priority: 50,
        category: 'compensating',
        effort: 'medium',
      },
    ])

    this.mitigationLibrary.set('Low', [
      {
        id: 'low-001',
        name: 'Basic Monitoring',
        description: 'Maintain basic monitoring of system health and usage',
        priority: 40,
        category: 'detective',
        effort: 'low',
      },
      {
        id: 'low-002',
        name: 'Documentation',
        description: 'Keep documentation up to date with current processes',
        priority: 35,
        category: 'corrective',
        effort: 'low',
      },
      {
        id: 'low-003',
        name: 'Standard Procedures',
        description: 'Follow established standard operating procedures',
        priority: 30,
        category: 'preventive',
        effort: 'low',
      },
    ])
  }

  private getActionSpecificMitigations(action: string): MitigationStrategy[] {
    const actionLower = action.toLowerCase()

    if (actionLower.includes('delete')) {
      return [
        {
          id: 'act-del-001',
          name: 'Soft Delete',
          description: 'Implement soft delete with recovery period before permanent deletion',
          priority: 95,
          category: 'preventive',
          effort: 'medium',
        },
        {
          id: 'act-del-002',
          name: 'Confirmation Dialog',
          description: 'Require explicit confirmation with impact disclosure',
          priority: 90,
          category: 'preventive',
          effort: 'low',
        },
      ]
    }

    if (actionLower.includes('export') || actionLower.includes('transfer')) {
      return [
        {
          id: 'act-exp-001',
          name: 'Data Sanitization',
          description: 'Apply data masking or sanitization based on sensitivity',
          priority: 85,
          category: 'preventive',
          effort: 'medium',
        },
        {
          id: 'act-exp-002',
          name: 'Transfer Logging',
          description: 'Log all data transfers with destination details',
          priority: 80,
          category: 'detective',
          effort: 'low',
        },
      ]
    }

    if (actionLower.includes('update') || actionLower.includes('modify')) {
      return [
        {
          id: 'act-mod-001',
          name: 'Change History',
          description: 'Maintain version history with ability to rollback',
          priority: 75,
          category: 'corrective',
          effort: 'medium',
        },
        {
          id: 'act-mod-002',
          name: 'Input Validation',
          description: 'Validate all inputs against schema and business rules',
          priority: 85,
          category: 'preventive',
          effort: 'medium',
        },
      ]
    }

    return []
  }
}
