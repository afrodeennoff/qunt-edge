import re

with open('app/[locale]/dashboard/components/tables/trade-table-review.tsx', 'r') as f:
    content = f.read()

pattern = r'''onScroll=\{\(event\) => \{
          const nextScrollTop = event.currentTarget.scrollTop;
          if \(scrollRafRef.current !== null\) return;
          scrollRafRef.current = requestAnimationFrame\(\(\) => \{
            if \(Math.abs\(nextScrollTop - lastScrollTopRef.current\) < 2\) \{
              scrollRafRef.current = null;
              return;
            \}'''

replacement = r'''onScroll={(event) => {
          const nextScrollTop = event.currentTarget.scrollTop;
          if (scrollRafRef.current !== null) return;
          scrollRafRef.current = requestAnimationFrame(() => {
            if (Math.abs(nextScrollTop - lastScrollTopRef.current) < 50) {
              scrollRafRef.current = null;
              return;
            }'''

new_content = content.replace(pattern.replace('\\', ''), replacement)
with open('app/[locale]/dashboard/components/tables/trade-table-review.tsx', 'w') as f:
    f.write(new_content)
