with open('app/[locale]/dashboard/components/tables/trade-table-review.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for idx, line in enumerate(lines):
    if line.strip() == 'h) {':
        new_lines.append('        onScroll={(event) => {\n')
        new_lines.append('          const nextScrollTop = event.currentTarget.scrollTop;\n')
        new_lines.append('          if (scrollRafRef.current !== null) return;\n')
        new_lines.append('          scrollRafRef.current = requestAnimationFrame(() => {\n')
        new_lines.append('            if (Math.abs(nextScrollTop - lastScrollTopRef.current) < 50) {\n')
    else:
        new_lines.append(line)

with open('app/[locale]/dashboard/components/tables/trade-table-review.tsx', 'w') as f:
    f.writelines(new_lines)
