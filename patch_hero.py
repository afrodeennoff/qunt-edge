import re

filepath = 'app/[locale]/(landing)/components/hero.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Replace unused onStart
content = content.replace("export default function Hero({ onStart }: HeroProps) {", "export default function Hero({  }: HeroProps) {")

with open(filepath, 'w') as f:
    f.write(content)
