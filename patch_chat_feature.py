import re

filepath = 'app/[locale]/(landing)/components/chat-feature.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Fix `Unexpected any` around line 122
content = content.replace("export function ChatFeature({ t }: { t: any }) {", "export function ChatFeature({ t }: { t: (key: string) => string }) {")

with open(filepath, 'w') as f:
    f.write(content)
