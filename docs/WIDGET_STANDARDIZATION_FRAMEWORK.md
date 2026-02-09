# Widget Standardization Framework Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Policy Engine SDK](#policy-engine-sdk)
4. [Risk Assessment](#risk-assessment)
5. [Implementation Guide](#implementation-guide)
6. [Testing](#testing)
7. [Migration](#migration)
8. [Reference](#reference)

---

## Overview

The Widget Standardization Framework provides a comprehensive, Risk-Metrics-inspired policy architecture for enforcing consistent risk management, security, and compliance across all widgets in the application.

### Key Features

- **Unified Policy Engine**: Centralized risk evaluation and decision-making
- **Comprehensive Risk Assessment**: Monte Carlo simulations, severity tiers, and control effectiveness
- **Schema Validation**: JSON Schema validation for all widget inputs/outputs
- **Error Handling**: Centralized error codes and remediation hints
- **Metrics Collection**: Prometheus-compatible metrics with SLO monitoring
- **Inter-Widget Communication**: Secure message bus with risk token validation
- **CI/CD Integration**: Automated compliance checking in GitHub Actions

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Widgets  │  WithRiskEvaluation HOC  │  Message Bus         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Policy Engine Layer                       │
├─────────────────────────────────────────────────────────────┤
│  PolicyEngine │ RiskCalculator │ DecisionEngine │ Mitigation│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Schema Validator │ Error Handler │ Metrics │ Audit Log     │
└─────────────────────────────────────────────────────────────┘
```

### Decision Flow

```
┌──────────────┐
│ Widget Action │
└──────┬───────┘
       ↓
┌──────────────────┐
│ Policy Evaluation │
└──────┬───────────┘
       ↓
┌──────────────────────┐
│ Risk Score < 40?     │──Yes──→ Green Path (Proceed)
└──────────┬───────────┘
           │ No
           ↓
┌──────────────────────┐
│ Risk Score < 80?     │──Yes──→ Amber Path (User Consent)
└──────────┬───────────┘
           │ No
           ↓
┌──────────────────────┐
│ Red Path (Block)     │
└──────────────────────┘
```

---

## Policy Engine SDK

### Installation

The policy engine is included in the application. Import the SDK:

```typescript
import { getPolicyEngine } from '@/lib/widget-policy-engine/policy-engine'
import { PolicyEvaluationContext, WidgetPolicyManifest } from '@/lib/widget-policy-engine/types'
```

### Basic Usage

```typescript
const policyEngine = getPolicyEngine()

const context: PolicyEvaluationContext = {
  widgetId: 'my-widget',
  action: 'export_data',
  inputs: { format: 'csv' },
  userContext: {
    userId: 'user-123',
    roles: ['user'],
    permissions: ['export'],
    trustLevel: 0.8,
  },
  environmentContext: {
    deploymentEnv: 'production',
    region: 'us-east-1',
    telemetryEnabled: true,
  },
}

const manifest: WidgetPolicyManifest = {
  schemaVersion: '1.0.0',
  widgetId: 'my-widget',
  widgetVersion: '1.0.0',
  policyVersion: '1.0.0',
  riskAssessment: {
    severityTier: 'Medium',
    probabilityScore: 0.4,
    impactWeight: 35,
    controlEffectiveness: 4,
    residualRiskScore: 30,
  },
  features: [...],
  dataHandling: {...},
  compliance: {...},
  slos: {...},
  lastUpdated: new Date(),
}

const result = await policyEngine.evaluateRisk(context, manifest)

if (result.decision === 'green') {
  // Proceed with action
} else if (result.decision === 'amber') {
  // Request user consent
} else {
  // Block action
}
```

### React Integration

```tsx
import { WithRiskEvaluation } from '@/components/widget-policy/with-risk-evaluation'

function MyWidget() {
  const handleExport = async () => {
    // Perform export action
  }

  return (
    <WithRiskEvaluation
      widgetId="my-widget"
      action="export_data"
      inputs={{ format: 'csv' }}
      onConsent={handleExport}
      onError={(error) => console.error(error)}
    >
      <button onClick={handleExport}>Export Data</button>
    </WithRiskEvaluation>
  )
}
```

### Hook Usage

```tsx
import { useRiskEvaluation } from '@/components/widget-policy/with-risk-evaluation'

function MyComponent() {
  const { result, loading, error } = useRiskEvaluation(
    'my-widget',
    'export_data',
    { format: 'csv' }
  )

  if (loading) return <div>Evaluating...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      Risk Level: {result?.riskLevel}
      Decision: {result?.decision}
    </div>
  )
}
```

---

## Risk Assessment

### Severity Tiers

| Tier | Risk Score Range | Description |
|------|-----------------|-------------|
| **Critical** | 75-100 | Immediate action required, potential security breach |
| **High** | 50-74 | Significant risk, requires mitigation |
| **Medium** | 25-49 | Moderate risk, monitor closely |
| **Low** | 0-24 | Acceptable risk, normal operations |

### Risk Score Calculation

```
Residual Risk = (Probability × Impact) × (1 - (ControlEffectiveness / 5) × 0.7)
```

### Monte Carlo Simulation

Run simulations to validate risk scores:

```typescript
import { RiskScoreCalculator } from '@/lib/widget-policy-engine/risk-calculator'

const calculator = new RiskScoreCalculator()

const simulation = calculator.runMonteCarloSimulation(
  context,
  manifest,
  10000 // iterations
)

console.log(`Mean Risk: ${simulation.meanRiskScore}`)
console.log(`95th Percentile: ${simulation.percentile95}`)
console.log(`99th Percentile: ${simulation.percentile99}`)
```

---

## Implementation Guide

### Step 1: Create Widget Manifest

Create `widgets/[widget-id]/manifest.json`:

```json
{
  "schemaVersion": "1.0.0",
  "widgetId": "my-widget",
  "widgetVersion": "1.0.0",
  "policyVersion": "1.0.0",
  "riskAssessment": {
    "severityTier": "Medium",
    "probabilityScore": 0.4,
    "impactWeight": 35,
    "controlEffectiveness": 4,
    "residualRiskScore": 30
  },
  "features": [
    {
      "id": "display-data",
      "name": "Display User Data",
      "threatVector": "Data exposure through UI",
      "residualRiskScore": 20,
      "compensatingControls": ["Input validation", "Output sanitization"],
      "riskTier": "Low"
    }
  ],
  "dataHandling": {
    "inputSchema": "widget-input.schema.json",
    "outputSchema": "widget-output.schema.json",
    "dataClassification": "internal",
    "encryptionRequired": false,
    "auditLogging": true,
    "retentionPeriod": "90d"
  },
  "compliance": {
    "frameworks": ["SOC2"],
    "auditHistory": [],
    "signoffs": []
  },
  "slos": {
    "p99LatencyMs": 200,
    "errorRate": 0.001,
    "riskScoreDrift": 0.05,
    "availability": 0.99
  },
  "lastUpdated": "2025-01-01T00:00:00Z"
}
```

### Step 2: Create Risk Register

Create `widgets/[widget-id]/risk-register.json`:

```json
{
  "widgetId": "my-widget",
  "widgetVersion": "1.0.0",
  "registerVersion": "1.0.0",
  "lastUpdated": "2025-01-01T00:00:00Z",
  "overallRiskScore": 30,
  "features": [...],
  "monteCarloResults": {
    "iterations": 10000,
    "meanRiskScore": 28.5,
    "percentile95": 35.2,
    "percentile99": 42.1,
    "standardDeviation": 5.3,
    "lastRun": "2025-01-01T00:00:00Z"
  },
  "compliance": {
    "policyCompliant": true,
    "driftPercentage": 2.5,
    "thresholdExceeded": false,
    "lastAuditDate": "2025-01-01T00:00:00Z",
    "nextAuditDate": "2025-04-01T00:00:00Z"
  }
}
```

### Step 3: Wrap Widget with HOC

```tsx
import { WithRiskEvaluation } from '@/components/widget-policy/with-risk-evaluation'

export default function MyWidget({ data }) {
  const handleUpdate = (newData) => {
    // Update logic
  }

  return (
    <WithRiskEvaluation
      widgetId="my-widget"
      action="update_data"
      inputs={{ newData }}
      onConsent={handleUpdate}
    >
      <div>{/* Widget content */}</div>
    </WithRiskEvaluation>
  )
}
```

### Step 4: Add Metrics Collection

```typescript
import { getMetricsCollector } from '@/lib/widget-policy-engine/metrics-collector'

const metrics = getMetricsCollector()

// Record widget load
metrics.recordWidgetLoad('my-widget', '1.0.0', 150, 'Medium')

// Record user interaction
metrics.recordUserInteraction('my-widget', '1.0.0', 'Medium')

// Record risk decision
metrics.recordRiskDecision('my-widget', '1.0.0', 'Medium', 30)
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { PolicyEngine } from '@/lib/widget-policy-engine/policy-engine'

describe('MyWidget Policy', () => {
  it('should allow view actions', async () => {
    const engine = new PolicyEngine()
    const result = await engine.evaluateRisk(context, manifest)
    expect(result.decision).toBe('green')
  })

  it('should require consent for delete actions', async () => {
    const engine = new PolicyEngine()
    const result = await engine.evaluateRisk(deleteContext, manifest)
    expect(result.decision).toBe('amber')
  })
})
```

### Integration Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { WithRiskEvaluation } from '@/components/widget-policy/with-risk-evaluation'

test('widget shows consent dialog for high-risk actions', async () => {
  render(
    <WithRiskEvaluation
      widgetId="test-widget"
      action="delete_data"
      onConsent={() => {}}
    >
      <button>Delete</button>
    </WithRiskEvaluation>
  )

  expect(await screen.findByText(/confirmation required/i)).toBeInTheDocument()
})
```

### Property-Based Tests

```typescript
import fc from 'fast-check'
import { PolicyEngine } from '@/lib/widget-policy-engine/policy-engine'

test('risk scores stay within bounds', () => {
  const engine = new PolicyEngine()
  
  fc.assert(
    fc.asyncProperty(
      fc.record({
        probability: fc.float({ min: 0, max: 1 }),
        impact: fc.integer({ min: 0, max: 100 }),
        controlEffectiveness: fc.integer({ min: 0, max: 5 }),
      }),
      async (assessment) => {
        const result = await engine.evaluateRisk(context, {
          ...manifest,
          riskAssessment: assessment,
        })
        
        return result.riskScore >= 0 && result.riskScore <= 100
      }
    )
  )
})
```

---

## Migration

### Codemods

Automated migration scripts are available in `.github/scripts/codemods/`:

```bash
# Add policy evaluation to all widgets
npm run codemod:add-policy-evaluation

# Wrap components with WithRiskEvaluation HOC
npm run codemod:wrap-risk-hoc

# Add error handling
npm run codemod:add-error-handling
```

### Manual Migration Steps

1. **Create manifest** - Define widget policy manifest
2. **Create risk register** - Document all features and risks
3. **Wrap with HOC** - Add `WithRiskEvaluation` wrapper
4. **Add metrics** - Instrument metrics collection
5. **Test** - Verify compliance with test suite
6. **Deploy** - Follow CI/CD validation

### Migration Waves by Risk Tier

| Wave | Risk Tier | Timeline |
|------|-----------|----------|
| 1 | Critical | Days 1-30 |
| 2 | High | Days 31-60 |
| 3 | Medium | Days 61-90 |
| 4 | Low | Days 91-120 |

---

## Reference

### Error Codes

| Code | Name | Description |
|------|------|-------------|
| WIDGET_001 | INPUT_VALIDATION | Input validation failed |
| WIDGET_002 | OUTPUT_VALIDATION | Output validation failed |
| WIDGET_003 | POLICY_VIOLATION | Policy violation detected |
| WIDGET_004 | RISK_THRESHOLD_EXCEEDED | Risk threshold exceeded |
| WIDGET_005 | DATA_FETCH_FAILED | Data fetch operation failed |
| WIDGET_006 | RENDER_ERROR | Widget render error |
| WIDGET_007 | CONFIGURATION_ERROR | Configuration error |
| WIDGET_008 | PERMISSION_DENIED | Permission denied |
| WIDGET_009 | RATE_LIMIT_EXCEEDED | Rate limit exceeded |
| WIDGET_010 | TIMEOUT | Operation timeout |

### SLO Thresholds

| Metric | Threshold | Unit |
|--------|-----------|------|
| P99 Latency | ≤ 300 | ms |
| Error Rate | ≤ 0.1 | % |
| Risk Score Drift | ≤ 5 | %/week |
| Availability | ≥ 99.0 | % |

### Message Bus Topics

```
widgets/{domain}/{widgetId}/{riskTier}/{action}
```

Example:
```
widgets/dashboard/trading-score-widget/High/export_data
```

---

## Appendix

### Quick Checklist

- [ ] Widget manifest created
- [ ] Risk register documented
- [ ] WithRiskEvaluation HOC added
- [ ] Metrics instrumentation added
- [ ] Unit tests passing (90% coverage)
- [ ] Integration tests passing
- [ ] CI/CD compliance check passing
- [ ] Documentation updated

### Support

For questions or issues:
- Documentation: `/docs/WIDGET_STANDARDIZATION_FRAMEWORK.md`
- Issues: GitHub Issues
- Email: security@example.com

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-01  
**Maintained By**: Security & Compliance Team
