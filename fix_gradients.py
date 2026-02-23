import os
import re

files_to_fix = [
    "app/[locale]/dashboard/trader-profile/page.tsx",
    "app/[locale]/dashboard/trader-profile/page-client.tsx",
    "app/[locale]/dashboard/behavior/page.tsx",
    "app/[locale]/dashboard/reports/page.tsx",
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

# Patterns for gradients
glow_pattern = re.compile(r'<div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0-9]+">.*?</div>(?=\s*<div)', re.DOTALL)
text_grad_1 = re.compile(r'bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent')
text_grad_2 = re.compile(r'text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/40')
text_grad_3 = re.compile(r'text-transparent bg-clip-text bg-gradient-to-r from-[a-zA-Z0-9-/[\]]+ to-[a-zA-Z0-9-/[\]]+')
bg_grad_1 = re.compile(r'bg-gradient-to-[a-z]+\s+from-[a-zA-Z0-9-/[\]]+(\s+via-[a-zA-Z0-9-/[\]]+)?(\s+to-[a-zA-Z0-9-/[\]]+)?')
bg_grad_2 = re.compile(r'bg-gradient-[a-z]+')


for f in files_to_fix:
    if not os.path.exists(f):
        print(f"File not found: {f}")
        continue

    with open(f, 'r') as file:
        content = file.read()
    
    orig_content = content

    # 1. Remove glowing blur backgrounds
    content = glow_pattern.sub('', content)

    # Remove specific blur div patterns if still there
    content = re.sub(r'<div[^>]+blur-\[1[0-9]{2}px[^>]*></div>', '', content)
    
    # 2. Replace text gradients with standard text color
    content = text_grad_1.sub('text-white', content)
    content = text_grad_2.sub('text-white', content)
    content = text_grad_3.sub('text-white', content)

    # 3. Replace background gradients with standard border/bg classes depending on if it's dashboard
    if 'dashboard/' in f:
        # For dashboard pages (behavior, etc), use the settings-like background instead
        # behavior specifically has `bg-gradient-to-r from-white/10 via-white/10 to-white/5`
        content = bg_grad_1.sub('bg-card/75', content)
        content = bg_grad_2.sub('bg-card/75', content)
    else:
        # For landing pages
        content = bg_grad_1.sub('bg-zinc-900/40', content)
        content = bg_grad_2.sub('bg-zinc-900/40', content)
    
    if orig_content != content:
        with open(f, 'w') as file:
            file.write(content)
        print(f"Updated: {f}")

print("Done replacing gradients")
