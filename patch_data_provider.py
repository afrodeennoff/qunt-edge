import re

with open('context/data-provider.tsx', 'r') as f:
    content = f.read()

# Replace the inner loop date checks with variables extracted outside the filter loop
pattern = r'''    const fromDate = dateRange\?\.from \? startOfDay\(dateRange\.from\) : null;
    const toDate = dateRange\?\.to \? endOfDay\(dateRange\.to\) : null;
    const singleDayTimestamp =
      fromDate && toDate && fromDate\.getTime\(\) === startOfDay\(toDate\)\.getTime\(\)
        \? fromDate\.getTime\(\)
        : null;'''

replacement = r'''    const fromDate = dateRange?.from ? startOfDay(dateRange.from) : null;
    const toDate = dateRange?.to ? endOfDay(dateRange.to) : null;
    const singleDayTimestamp =
      fromDate && toDate && fromDate.getTime() === startOfDay(toDate).getTime()
        ? fromDate.getTime()
        : null;

    // Extract times to avoid redundant object parsing inside the filter loop
    const fromTime = fromDate?.getTime() ?? null;
    const toTime = toDate?.getTime() ?? null;'''

content = re.sub(pattern, replacement, content)

pattern2 = r'''        if \(fromDate && entryDate < fromDate\) return false;
        if \(toDate && entryDate > toDate\) return false;'''

replacement2 = r'''        const entryTime = entryDate.getTime();
        if (fromTime !== null && entryTime < fromTime) return false;
        if (toTime !== null && entryTime > toTime) return false;'''

content = re.sub(pattern2, replacement2, content)


with open('context/data-provider.tsx', 'w') as f:
    f.write(content)
