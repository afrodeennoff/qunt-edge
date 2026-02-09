# Widget Policy Implementation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev ajv ajv-formats fast-check vitest
```

### 2. Create Widget Manifest

```bash
# Create manifest in widgets/your-widget-name/manifest.json
mkdir -p widgets/your-widget-name
cat > widgets/your-widget-name/manifest.json << 'EOF'
{
  "schemaVersion": "1.0.0",
  "widgetId": "your-widget-name",
  "widgetVersion": "1.0.0",
  "policyVersion": "1.0.0",
  "riskAssessment": {
    "severityTier": "Medium",
    "probabilityScore": 0.4,
    "impactWeight": 35,
    "controlEffectiveness": 4,
    "residualRiskScore": 30
  },
  "features": [],
  "dataHandling": {
    "inputSchema": "widget-input.schema.json",
    "outputSchema": "widget-output.schema.json",
    "dataClassification": "internal",
    "encryptionRequired": false,
    "auditLogging": true,
    "retentionPeriod": "90d"
  },
  "compliance": {
    "frameworks": [],
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
EOF
```

### 3. Create Risk Register

```bash
cat > widgets/your-widget-name/risk-register.json << 'EOF'
{
  "widgetId": "your-widget-name",
  "widgetVersion": "1.0.0",
  "registerVersion": "1.0.0",
  "lastUpdated": "2025-01-01T00:00:00Z",
  "lastCalculated": "2025-01-01T00:00:00Z",
  "overallRiskScore": 30,
  "features": [],
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
EOF
```

### 4. Wrap Component with HOC

```tsx
'use client'

import { WithRiskEvaluation } from '@/components/widget-policy/with-risk-evaluation'

export default function YourWidget({ data, onAction }) {
  return (
    <WithRiskEvaluation
      widgetId="your-widget-name"
      action="update_data"
      inputs={{ data }}
      onConsent={onAction}
      onError={(error) => console.error(error)}
    >
      {/* Your widget content */}
    </WithRiskEvaluation>
  )
}
```

### 5. Add Metrics Collection

```typescript
import { getMetricsCollector } from '@/lib/widget-policy-engine/metrics-collector'

const metrics = getMetricsCollector()

// In your widget load handler
const startTime = Date.now()
// ... load widget
metrics.recordWidgetLoad('your-widget-name', '1.0.0', Date.now() - startTime, 'Medium')

// In your interaction handlers
metrics.recordUserInteraction('your-widget-name', '1.0.0', 'Medium')

// After policy evaluation
metrics.recordRiskDecision('your-widget-name', '1.0.0', 'Medium', riskScore)
```

### 6. Run Tests

```bash
# Run policy compliance checks
npm run validate:manifests

# Run unit tests
npm run test:policy

# Run integration tests
npm run test:integration

# Run property-based tests
npm run test:property

# Check test coverage
npm run test:coverage
```

## Risk Assessment Guide

### Determining Risk Scores

| Factor | Weight | Example |
|--------|--------|---------|
| Data Sensitivity | 0-40 | Public=0, Internal=10, Confidential=25, Restricted=40 |
| Action Criticality | 0-30 | View=0, Create=10, Update=20, Delete=30 |
| User Impact | 0-20 | Low=0, Medium=10, High=20 |
| Compliance Requirements | 0-10 | None=0, SOC2=5, GDPR+SOC2=10 |

### Example Risk Score Calculation

```
Widget: Export Trading Data
- Data Sensitivity: Internal (10)
- Action Criticality: Export (20)
- User Impact: Medium (10)
- Compliance Requirements: SOC2 (5)
Total Impact Weight: 45

Probability Score: 0.6 (historical data shows ~60% of exports have issues)
Control Effectiveness: 3/5 (validation + logging + monitoring)

Residual Risk = 0.6 × 45 × (1 - (3/5) × 0.7) = 27 × 0.58 = 15.66
```

## Common Patterns

### Read-Only Widgets

```json
{
  "riskAssessment": {
    "severityTier": "Low",
    "probabilityScore": 0.1,
    "impactWeight": 10,
    "controlEffectiveness": 5,
    "residualRiskScore": 5
  },
  "dataHandling": {
    "dataClassification": "public",
    "encryptionRequired": false,
    "auditLogging": false
  }
}
```

### Data Modification Widgets

```json
{
  "riskAssessment": {
    "severityTier": "Medium",
    "probabilityScore": 0.4,
    "impactWeight": 35,
    "controlEffectiveness": 4,
    "residualRiskScore": 30
  },
  "dataHandling": {
    "dataClassification": "internal",
    "encryptionRequired": true,
    "auditLogging": true
  }
}
```

### Data Deletion Widgets

```json
{
  "riskAssessment": {
    "severityTier": "High",
    "probabilityScore": 0.3,
    "impactWeight": 70,
    "controlEffectiveness": 4,
    "residualRiskScore": 42
  },
  "dataHandling": {
    "dataClassification": "confidential",
    "encryptionRequired": true,
    "auditLogging": true,
    "retentionPeriod": "365d"
  },
  "features": [
    {
      "id": "soft-delete",
      "name": "Soft Delete",
      "threatVector": "Accidental data loss",
      "residualRiskScore": 20,
      "compensatingControls": [
        "Confirmation dialog",
        "Undo functionality",
        "Backup before delete"
      ],
      "riskTier": "Medium"
    }
  ]
}
```

## Troubleshooting

### Issue: CI/CD Fails with "Manifest Not Found"

**Solution**: Ensure manifest.json exists in `widgets/widget-name/manifest.json`

### Issue: Risk Score Drift Exceeds 5%

**Solution**: 
1. Run Monte Carlo simulation: `npm run run:monte-carlo`
2. Update risk assessment in manifest
3. Document justification in risk register

### Issue: Decision is Always Red

**Solution**: Check:
- Control effectiveness rating (should be ≥ 3 for production)
- Probability score is accurate
- Impact weight is not inflated
- User trust level is set correctly

### Issue: Tests Fail with "Policy Evaluation Timeout"

**Solution**: 
- Increase cache TTL in policy engine config
- Check for infinite loops in decision logic
- Verify manifest JSON is valid

## Checklist

Before submitting a widget for review:

- [ ] Manifest created with all required fields
- [ ] Risk register documented with all features
- [ ] WithRiskEvaluation HOC wraps widget
- [ ] Metrics collection implemented
- [ ] Unit tests pass (90% coverage minimum)
- [ ] Integration tests pass
- [ ] Property-based tests pass
- [ ] CI/CD compliance check passes
- [ ] SLOs are within thresholds
- [ ] Documentation updated

## Resources

- [Full Framework Documentation](./WIDGET_STANDARDIZATION_FRAMEWORK.md)
- [API Reference](./API_REFERENCE.md)
- [Best Practices](./BEST_PRACTICES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Support

- GitHub Issues: [github.com/yourorg/yourrepo/issues]
- Slack: #widget-policy-framework
- Email: security@yourorg.com
