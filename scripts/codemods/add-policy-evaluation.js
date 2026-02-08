const fs = require('fs')
const path = require('path')

function addPolicyEvaluationToWidget(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  
  if (content.includes('getPolicyEngine')) {
    console.log(`  Skipped ${filePath} - already has policy engine imports`)
    return
  }

  const importStatement = `import { getPolicyEngine } from '@/lib/widget-policy-engine/policy-engine'
import { PolicyEvaluationContext } from '@/lib/widget-policy-engine/types'
`

  if (!content.includes('import')) {
    content = importStatement + '\n' + content
  } else {
    const lastImportIndex = content.lastIndexOf('import ')
    const newlineIndex = content.indexOf('\n', lastImportIndex)
    content = content.slice(0, newlineIndex + 1) + importStatement + content.slice(newlineIndex + 1)
  }

  fs.writeFileSync(filePath, content)
  console.log(`  ✓ Added policy evaluation imports to ${filePath}`)
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      processDirectory(fullPath)
    } else if (file.match(/.*-widget\.(tsx|ts|jsx|js)$/)) {
      addPolicyEvaluationToWidget(fullPath)
    }
  }
}

const widgetsDir = path.join(process.cwd(), 'app/[locale]/dashboard/components/widgets')

if (fs.existsSync(widgetsDir)) {
  console.log('Adding policy evaluation to widgets...')
  processDirectory(widgetsDir)
  console.log('\n✅ Policy evaluation imports added')
} else {
  console.error('Widgets directory not found')
  process.exit(1)
}
