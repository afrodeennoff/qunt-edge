import re

with open('context/data-provider.tsx', 'r') as f:
    content = f.read()

pattern = r'''        if \(tradeAccount\?\.resetDate && tradeAccount\.shouldConsiderTradesBeforeReset === false\) \{
          const resetDate = startOfDay\(new Date\(tradeAccount\.resetDate\)\);
          if \(startOfDay\(entryDate\) < resetDate\) return false;
        \}'''

replacement = r'''        if (tradeAccount?.resetDate && tradeAccount.shouldConsiderTradesBeforeReset === false) {
          const resetTime = startOfDay(new Date(tradeAccount.resetDate)).getTime();
          if (startOfDay(entryDate).getTime() < resetTime) return false;
        }'''

content = re.sub(pattern, replacement, content)

with open('context/data-provider.tsx', 'w') as f:
    f.write(content)
