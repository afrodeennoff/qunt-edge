import re

filepath = 'app/[locale]/(landing)/components/hero.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Replace unused onStart
content = content.replace("onStart,", "")

with open(filepath, 'w') as f:
    f.write(content)
