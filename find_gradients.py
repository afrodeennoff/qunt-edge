import os
import re

files_to_check = [
    "app/[locale]/dashboard/settings/page.tsx",
    "app/[locale]/dashboard/trader-profile/page.tsx",
    "app/[locale]/dashboard/trader-profile/page-client.tsx",
    "app/[locale]/dashboard/reports/page.tsx",
    "app/[locale]/dashboard/behavior/page.tsx",
    "app/[locale]/dashboard/data/page.tsx",
    "app/[locale]/dashboard/billing/page.tsx",
    "app/[locale]/(landing)/pricing/page.tsx",
    "app/[locale]/teams/(landing)/page.tsx",
    "app/[locale]/(landing)/support/page.tsx",
    "app/[locale]/(landing)/updates/page.tsx",
    "app/[locale]/(landing)/community/page.tsx",
    "app/[locale]/(landing)/faq/page.tsx",
    "app/[locale]/(landing)/about/page.tsx",
    "app/[locale]/(landing)/privacy/page.tsx",
    "app/[locale]/(landing)/terms/page.tsx",
    "app/[locale]/(landing)/disclaimers/page.tsx",
]

gradient_pattern = re.compile(r'bg-gradient-[a-zA-Z0-9-]+|from-[a-zA-Z0-9-/[\]]+|via-[a-zA-Z0-9-/[\]]+|to-[a-zA-Z0-9-/[\]]+|bg-clip-text|text-transparent')

for f in files_to_check:
    if not os.path.exists(f):
        print(f"NOT FOUND: {f}")
        continue
    with open(f, 'r') as file:
        lines = file.readlines()
        for i, line in enumerate(lines):
            if gradient_pattern.search(line):
                print(f"File: {f} | Line: {i+1} | {line.strip()}")
