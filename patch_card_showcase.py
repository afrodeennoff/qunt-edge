import re

filepath = 'app/[locale]/(landing)/components/card-showcase.tsx'

with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("import { LineChart, Search, CheckCircle2, DollarSign, TrendingUp, TrendingDown, Target, Brain, LineChart as ChartIcon, Eye, ExternalLink } from 'lucide-react'",
                          "import { LineChart, Search, DollarSign, TrendingUp, TrendingDown, Target, Brain, LineChart as ChartIcon, Eye, ExternalLink } from 'lucide-react'")

with open(filepath, 'w') as f:
    f.write(content)
