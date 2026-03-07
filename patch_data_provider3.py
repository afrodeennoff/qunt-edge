import re

with open('context/data-provider.tsx', 'r') as f:
    content = f.read()

pattern = r'''    // Extract times to avoid redundant object parsing inside the filter loop
    const fromTime = fromDate\?\.getTime\(\) \?\? null;
    const toTime = toDate\?\.getTime\(\) \?\? null;

    const tickFilterValue = tickFilter\?\.value'''

replacement = r'''    // Extract times to avoid redundant object parsing inside the filter loop
    const fromTime = fromDate?.getTime() ?? null;
    const toTime = toDate?.getTime() ?? null;

    // Pre-calculate account reset times
    const accountResetTimes = new Map<string, number>();
    for (const account of accounts) {
        if (account.resetDate && account.shouldConsiderTradesBeforeReset === false) {
            accountResetTimes.set(account.number, startOfDay(new Date(account.resetDate)).getTime());
        }
    }

    const tickFilterValue = tickFilter?.value'''

content = re.sub(pattern, replacement, content)

pattern2 = r'''        if \(tradeAccount\?\.resetDate && tradeAccount\.shouldConsiderTradesBeforeReset === false\) \{
          const resetTime = startOfDay\(new Date\(tradeAccount\.resetDate\)\)\.getTime\(\);
          if \(startOfDay\(entryDate\)\.getTime\(\) < resetTime\) return false;
        \}'''

replacement2 = r'''        const resetTime = accountResetTimes.get(trade.accountNumber);
        if (resetTime !== undefined && startOfDay(entryDate).getTime() < resetTime) {
            return false;
        }'''

content = re.sub(pattern2, replacement2, content)

with open('context/data-provider.tsx', 'w') as f:
    f.write(content)
