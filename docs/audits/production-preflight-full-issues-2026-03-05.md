# Production Preflight Full Issues (2026-03-05)

## Gate Results
- `typecheck`: PASS
- `build`: PASS
- `check:route-budgets`: PASS
- `analyze:bundle`: PASS
- `perf:headers` (strict): PASS
- `perf:baseline`: PASS
- `perf:lighthouse`: FAIL (threshold failures on `/en` and `/en/pricing`)

## Release Blockers
- Lighthouse thresholds failing: mobile/desktop score + TBT + mobile LCP on `/en` and `/en/pricing`.
- Unreferenced duplicate page implementations: `app/[locale]/dashboard/behavior/page-client.tsx`, `app/[locale]/dashboard/trader-profile/page-client.tsx`.

## Lint Inventory
- Total errors: 0
- Total warnings: 1546
- Files with findings: 361

## Complete Finding List (All ESLint Findings)
### server/webhook-service.ts (51)
- warning [@typescript-eslint/no-unused-vars] 183:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 273:21 Unexpected any. Specify a different type.
- warning [complexity] 313:3 Async method 'handleEventByType' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 315:5 '_prisma' is defined but never used.
- warning [complexity] 363:3 Async method 'handleMembershipActivated' has a complexity of 21. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 364:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 365:5 '_prisma' is defined but never used.
- warning [complexity] 434:3 Async method 'handleTeamMembershipActivated' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 435:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 439:15 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 440:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 527:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 531:15 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 532:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 614:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 615:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 679:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 681:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 706:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 708:5 '_prisma' is defined but never used.
- warning [complexity] 732:3 Async method 'handleMembershipUpdated' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 733:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 734:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 814:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 815:5 '_prisma' is defined but never used.
- warning [complexity] 877:3 Async method 'handlePaymentSucceeded' has a complexity of 13. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 878:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 879:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 895:47 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 904:63 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 905:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 907:41 Unexpected any. Specify a different type.
- warning [complexity] 950:3 Async method 'handlePaymentFailed' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 951:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 952:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 968:47 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 977:63 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 978:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 979:41 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 1020:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 1021:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 1055:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 1056:5 '_prisma' is defined but never used.
- warning [complexity] 1061:3 Async method 'handleInvoiceCreated' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 1062:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 1063:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 1110:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 1111:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 1144:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 1145:5 '_prisma' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 1190:25 'options' is defined but never used.

### context/data-provider.tsx (42)
- warning [@typescript-eslint/no-unused-vars] 12:12 'PrismaGroup' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 13:14 'PrismaAccount' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:3 'Tag' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:11 'PrismaUser' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 19:3 'FinancialEvent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 20:3 'Mood' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 21:3 'TickDetails' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 44:3 'calculateAccountBalanceAction' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 56:18 'SupabaseUser' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 64:10 'deleteTagAction' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 77:51 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 77:55 'groupBy' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 77:64 'calculateTradingDays' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 92:3 'AccountDecimalFields' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 94:3 'AccountBase' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 99:3 'TradeInput' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 100:3 'normalizeTradeForClient' is defined but never used.
- warning [complexity] 246:61 Arrow function has a complexity of 25. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 248:9 'router' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 253:9 'user' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 266:9 'subscription' is assigned a value but never used.
- warning [complexity] 372:41 Async arrow function has a complexity of 40. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 627:6 React Hook useCallback has missing dependencies: 'adminView', 'dashboardLayout', 'sanitizeTradesForState', 'setAccounts', 'setDashboardLayout', 'setEvents', 'setGroups', 'setMoods', 'setSubscription', 'setSupabaseUser', 'setTags', 'setTickDetails', 'setTrades', and 'setUser'. Either include them or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 666:6 React Hook useEffect has missing dependencies: 'loadData', 'setSubscriptionData', 'setSubscriptionError', and 'setSubscriptionLoading'. Either include them or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 695:6 React Hook useCallback has missing dependencies: 'setSubscriptionData', 'setSubscriptionError', and 'setSubscriptionLoading'. Either include them or remove the dependency array.
- warning [complexity] 698:66 Async arrow function has a complexity of 19. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 737:5 React Hook useCallback has missing dependencies: 'sanitizeTradesForState' and 'setIsLoading'. Either include them or remove the dependency array.
- warning [complexity] 743:7 Async arrow function has a complexity of 15. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 787:5 React Hook useCallback has a missing dependency: 'setIsLoading'. Either include it or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 822:5 React Hook useCallback has a missing dependency: 'setIsLoading'. Either include it or remove the dependency array.
- warning [complexity] 841:38 Arrow function has a complexity of 19. Maximum allowed is 10.
- warning [complexity] 878:23 Arrow function has a complexity of 41. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 1004:9 The 'isPlusUser' function makes the dependencies of useMemo Hook (at line 1818) change on every render. Move it inside the useMemo callback. Alternatively, wrap the definition of 'isPlusUser' in its own useCallback() Hook.
- warning [complexity] 1004:25 Arrow function has a complexity of 11. Maximum allowed is 10.
- warning [complexity] 1023:33 Async arrow function has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 1035:27 '_trades' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 1074:25 '_trades2' is assigned a value but never used.
- warning [react-hooks/exhaustive-deps] 1232:5 React Hook useCallback has an unnecessary dependency: 'accounts'. Either exclude it or remove the dependency array.
- warning [@typescript-eslint/no-explicit-any] 1445:69 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 1492:42 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 1602:75 Unexpected any. Specify a different type.
- warning [complexity] 1908:1 Function 'getTimeRangeKey' has a complexity of 16. Maximum allowed is 10.

### components/sidebar/__tests__/sidebar.test.tsx (26)
- warning [@typescript-eslint/no-unused-vars] 2:27 'waitFor' is defined but never used.
- warning [@typescript-eslint/no-require-imports] 20:16 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 21:16 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 34:16 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 46:16 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 49:16 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 61:16 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 62:16 A `require()` style import is forbidden.
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 252:15 Do not use an `<a>` element to navigate to `/dashboard/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 257:15 Do not use an `<a>` element to navigate to `/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@typescript-eslint/no-unused-vars] 320:11 'items' is assigned a value but never used.
- warning [react-hooks/immutability] 328:7 Error: This value cannot be modified Modifying a variable defined outside a component or hook is not allowed. Consider using an effect. /Users/timon/Downloads/final-qunt-edge-main/components/sidebar/__tests__/sidebar.test.tsx:328:7 326 | 327 | const TestComponent = () => { > 328 | renderCount.count++ | ^^^^^^^^^^^ value cannot be modified 329 | return <div>Sidebar Test</div> 330 | } 331 |

### app/[locale]/dashboard/components/import/components/format-preview.tsx (24)
- warning [@typescript-eslint/no-unused-vars] 17:10 'ArrowDownToLine' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:27 'ChevronDown' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 31:10 'Badge' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 50:10 'transformHeaders' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 78:64 '_' is defined but never used.
- warning [complexity] 92:8 Function 'FormatPreview' has a complexity of 23. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 96:3 'setIsLoading' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 97:3 'isLoading' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 118:10 'processedBatches' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 118:28 'setProcessedBatches' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 119:29 'setProcessingBatches' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 376:9 'batchToProcess' is assigned a value but never used.
- warning [react-hooks/exhaustive-deps] 406:6 React Hook useEffect has a missing dependency: 'setProcessedTrades'. Either include it or remove the dependency array. If 'setProcessedTrades' changes too often, find the parent component that defines it and wrap that definition in useCallback.
- warning [react-hooks/exhaustive-deps] 431:6 React Hook useEffect has a missing dependency: 'setProcessedTrades'. Either include it or remove the dependency array. If 'setProcessedTrades' changes too often, find the parent component that defines it and wrap that definition in useCallback.
- warning [@typescript-eslint/no-unused-vars] 436:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 461:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 485:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 509:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 533:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 557:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 581:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 625:18 'column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 650:18 'column' is defined but never used.
- warning [react-hooks/incompatible-library] 674:17 Compilation Skipped: Use of incompatible library This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/components/format-preview.tsx:674:17 672 | ], [t, validTrades, headers, mappings]); 673 | > 674 | const table = useReactTable({ | ^^^^^^^^^^^^^ TanStack Table's `useReactTable()` API returns functions that cannot be memoized safely 675 | data: processedTrades, 676 | columns, 677 | getCoreRowModel: getCoreRowModel(),

### app/[locale]/dashboard/components/charts/equity-chart.tsx (23)
- warning [@typescript-eslint/no-unused-vars] 18:3 'startOfDay' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 19:3 'endOfDay' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 23:10 'ChevronDown' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 23:23 'ChevronUp' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 26:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 26:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 26:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 26:41 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 51:20 'PrismaPayout' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 134:27 Unexpected any. Specify a different type.
- warning [complexity] 134:32 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 229:5 'size' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 237:15 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 242:8 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 244:17 Unexpected any. Specify a different type.
- warning [complexity] 246:6 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 426:8 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 427:17 Unexpected any. Specify a different type.
- warning [complexity] 437:18 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 563:16 Function 'EquityChart' has a complexity of 22. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 601:35 React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead.
- warning [@typescript-eslint/no-explicit-any] 611:33 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 779:6 React Hook React.useEffect has missing dependencies: 'formattedTrades' and 'isTeamView'. Either include them or remove the dependency array.

### app/[locale]/dashboard/components/chat/chat.tsx (23)
- warning [@typescript-eslint/no-unused-vars] 4:10 'useRef' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 21:10 'loadChat' is defined but never used.
- warning [react-hooks/set-state-in-effect] 53:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/chat/chat.tsx:53:7 51 | useEffect(() => { 52 | if (messages.length <= MESSAGE_BATCH_SIZE) { > 53 | setShouldShowAll(true); | ^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 54 | setVisibleRange({ start: 0, end: messages.length }); 55 | } else if (!shouldShowAll) { 56 | setVisibleRange({
- warning [@typescript-eslint/no-unused-vars] 138:3 'output' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 141:9 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 143:12 Unexpected any. Specify a different type.
- warning [complexity] 172:16 Function 'ChatWidget' has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 189:18 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 189:38 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 192:40 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 199:19 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 200:16 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 203:25 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 225:25 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 251:6 React Hook useEffect has missing dependencies: 'setStoredMessages' and 'storedMessages.length'. Either include them or remove the dependency array.
- warning [@typescript-eslint/no-explicit-any] 309:21 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 310:18 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 428:54 Unexpected any. Specify a different type.
- warning [@next/next/no-img-element] 445:35 Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element
- warning [@typescript-eslint/no-explicit-any] 460:55 Unexpected any. Specify a different type.
- warning [complexity] 460:75 Arrow function has a complexity of 25. Maximum allowed is 10.
- warning [@next/next/no-img-element] 488:37 Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element
- warning [@typescript-eslint/no-explicit-any] 662:26 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/accounts/accounts-overview.tsx (21)
- warning [@typescript-eslint/no-unused-vars] 5:10 'Progress' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 8:79 'DialogFooter' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 8:93 'DialogTrigger' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 44:14 'calculateTradingDays' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 70:10 'savePayoutAction' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 81:3 'DragStartEvent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 82:3 'DragMoveEvent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 98:11 'DailyMetric' is defined but never used.
- warning [complexity] 143:1 Function 'getAccountSortValue' has a complexity of 29. Maximum allowed is 10.
- warning [complexity] 324:1 Function 'PayoutDialog' has a complexity of 22. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 347:10 'dateInputValue' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 362:9 'handleDateInputChange' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 532:31 'currentMonth' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 554:31 'currentMonth' is assigned a value but never used.
- warning [complexity] 710:8 Function 'AccountsOverview' has a complexity of 40. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 722:27 'setAccountNumbers' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 723:25 'deleteAccount' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 727:9 'locale' is assigned a value but never used.
- warning [complexity] 1046:31 Async arrow function has a complexity of 55. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 1336:59 'index' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 1364:67 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/import/tradovate/actions.ts (21)
- warning [@typescript-eslint/no-explicit-any] 134:12 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 294:79 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 302:18 Unexpected any. Specify a different type.
- warning [no-unreachable] 348:27 Unreachable code.
- warning [@typescript-eslint/no-explicit-any] 372:74 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 396:81 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 404:19 Unexpected any. Specify a different type.
- warning [no-unreachable] 434:29 Unreachable code.
- warning [@typescript-eslint/no-explicit-any] 474:76 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 548:46 'accountId' is assigned a value but never used.
- warning [complexity] 618:8 Async function 'handleTradovateCallback' has a complexity of 22. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 681:14 'parseError' is defined but never used.
- warning [complexity] 793:8 Async function 'refreshTradovateToken' has a complexity of 15. Maximum allowed is 10.
- warning [complexity] 959:1 Async function 'buildTradesFromFillPairs' has a complexity of 32. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 963:27 Unexpected any. Specify a different type.
- warning [complexity] 1147:8 Async function 'storeTradovateToken' has a complexity of 25. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 1150:3 'environment' is assigned a value but never used.
- warning [complexity] 1208:8 Async function 'getTradovateToken' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 1266:24 Unexpected any. Specify a different type.
- warning [complexity] 1444:8 Async function 'getTradovateTrades' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 1561:40 Unexpected any. Specify a different type.

### hooks/use-subscription.tsx (21)
- warning [@typescript-eslint/no-explicit-any] 41:18 Unexpected any. Specify a different type.
- warning [complexity] 43:5 Async function 'fetchSubscription' has a complexity of 24. Maximum allowed is 10.
- warning [react-hooks/set-state-in-effect] 174:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-subscription.tsx:174:7 172 | if (!loading && subscription) { 173 | const canAccess = subscription.canAccessFeature(feature) > 174 | setShowGuard(!canAccess && subscription.isActive) | ^^^^^^^^^^^^ Avoid calling setState() directly within an effect 175 | } 176 | }, [subscription, loading, feature]) 177 |
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 199:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [@next/next/no-html-link-for-pages] 213:11 Do not use an `<a>` element to navigate to `/pricing/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages
- warning [complexity] 230:8 Function 'useTrialStatus' has a complexity of 11. Maximum allowed is 10.
- warning [react-hooks/purity] 237:57 Error: Cannot call impure function during render `Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-subscription.tsx:237:57 235 | 0, 236 | Math.ceil( > 237 | (new Date(subscription.trialEndsAt).getTime() - Date.now()) / | ^^^^^^^^^^ Cannot call impure function 238 | (1000 * 60 * 60 * 24) 239 | ) 240 | )

### app/[locale]/dashboard/components/tables/trade-table-review.tsx (20)
- warning [@typescript-eslint/no-unused-vars] 13:3 'sortingFns' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 29:10 'Switch' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 72:3 'calculateTicksAndPointsForTrades' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 264:7 'supabase' is assigned a value but never used.
- warning [complexity] 283:8 Function 'TradeTableReview' has a complexity of 49. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 402:51 Unexpected any. Specify a different type.
- warning [complexity] 495:28 Arrow function has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 555:74 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 556:95 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 557:89 Unexpected any. Specify a different type.
- warning [complexity] 842:9 Method 'sortingFn' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 842:33 'columnId' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 905:33 'columnId' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 1082:20 'column' is defined but never used.
- warning [react-hooks/exhaustive-deps] 1187:5 React Hook useMemo has unnecessary dependencies: 'expanded' and 'tags'. Either exclude them or remove the dependency array.
- warning [@typescript-eslint/no-explicit-any] 1196:42 Unexpected any. Specify a different type.
- warning [react-hooks/incompatible-library] 1204:17 Compilation Skipped: Use of incompatible library This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/tables/trade-table-review.tsx:1204:17 1202 | const effectiveColumnVisibility = config?.disableColumnConfig ? {} : columnVisibility; 1203 | > 1204 | const table = useReactTable({ | ^^^^^^^^^^^^^ TanStack Table's `useReactTable()` API returns functions that cannot be memoized safely 1205 | data: groupedTrades, 1206 | columns, 1207 | state: {
- warning [complexity] 1549:53 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 1550:60 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 1555:52 Unexpected any. Specify a different type.

### components/consent-banner.tsx (20)
- warning [@typescript-eslint/no-unused-vars] 6:3 'DrawerClose' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 20:10 'Switch' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 21:10 'Label' is defined but never used.
- warning [react-hooks/set-state-in-effect] 56:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/components/consent-banner.tsx:56:7 54 | const hasConsent = localStorage.getItem("cookieConsent") 55 | if (!hasConsent) { > 56 | setIsVisible(true) | ^^^^^^^^^^^^ Avoid calling setState() directly within an effect 57 | } 58 | 59 | // Add keyboard shortcut for dev mode (Cmd/Ctrl + Shift + K)
- warning [@typescript-eslint/ban-ts-comment] 137:20 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 144:22 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 160:20 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 168:20 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 183:22 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 187:22 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 189:75 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 204:28 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 208:28 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 223:28 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 227:28 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 242:28 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 246:28 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 258:24 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 275:22 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 277:75 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.

### lib/performance/memory-leak-detector.ts (20)
- warning [@typescript-eslint/no-unused-vars] 67:11 'mountCount' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 68:11 'unmountCount' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 95:38 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 118:16 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 135:48 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 217:16 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 229:16 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 293:40 'componentName' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 296:81 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 307:17 The ref value 'timersRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'timersRef.current' to a variable inside the effect, and use that variable in the cleanup function.
- warning [react-hooks/exhaustive-deps] 313:20 The ref value 'listenersRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'listenersRef.current' to a variable inside the effect, and use that variable in the cleanup function.
- warning [@typescript-eslint/no-explicit-any] 331:14 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 354:19 The ref value 'timeoutsRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'timeoutsRef.current' to a variable inside the effect, and use that variable in the cleanup function.
- warning [react-hooks/exhaustive-deps] 385:20 The ref value 'intervalsRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'intervalsRef.current' to a variable inside the effect, and use that variable in the cleanup function.
- warning [@typescript-eslint/no-explicit-any] 407:81 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 407:96 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 414:20 The ref value 'listenersRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'listenersRef.current' to a variable inside the effect, and use that variable in the cleanup function.
- warning [@typescript-eslint/no-explicit-any] 421:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 431:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 435:45 'index' is defined but never used.

### app/[locale]/dashboard/components/import/quantower/quantower-processor.tsx (18)
- warning [complexity] 309:1 Function 'parseDateTime' has a complexity of 13. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 315:12 '_' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 336:12 '_' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 387:60 'headers' is defined but never used.
- warning [complexity] 424:33 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 425:41 'description' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:54 'symbolType' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:66 'expirationDate' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:82 'strikePrice' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:101 'orderType' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:129 'grossPnL' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:144 'netPnL' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:152 'tradeValue' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:164 'tradeId' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 425:182 'positionId' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 433:27 'contractCode' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 536:45 'symbol' is defined but never used.
- warning [react-hooks/set-state-in-effect] 553:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/quantower/quantower-processor.tsx:553:5 551 | 552 | useEffect(() => { > 553 | processOrders() | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 554 | }, [processOrders]) 555 | 556 | const uniqueSymbols = useMemo(() => Array.from(new Set(processedTrades.map(trade => trade.instrument).filter(Boolean))), [processedTrades])

### server/auth.ts (18)
- warning [complexity] 23:8 Async function 'getWebsiteURL' has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 41:1 Function 'handleAuthError' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 41:33 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 143:17 'error' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 160:17 'error' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 216:19 Unexpected any. Specify a different type.
- warning [complexity] 232:8 Async function 'signInWithPasswordAction' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 276:19 Unexpected any. Specify a different type.
- warning [complexity] 291:8 Async function 'signUpWithPasswordAction' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 330:19 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 348:13 'data' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 353:19 Unexpected any. Specify a different type.
- warning [complexity] 389:8 Async function 'ensureUserInDatabase' has a complexity of 30. Maximum allowed is 10.
- warning [complexity] 525:8 Async function 'verifyOtp' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 561:19 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 594:19 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 709:48 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 735:19 Unexpected any. Specify a different type.

### hooks/use-auto-save.ts (17)
- warning [react-hooks/refs] 31:7 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:31:7 29 | const isInitializedRef = useRef(false) 30 | > 31 | if (!serviceRef.current && enabled) { | ^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 32 | serviceRef.current = createAutoSaveService(saveFunction, { 33 | debounceMs, 34 | maxRetries,
- warning [react-hooks/refs] 31:7 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:31:7 29 | const isInitializedRef = useRef(false) 30 | > 31 | if (!serviceRef.current && enabled) { | ^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 32 | serviceRef.current = createAutoSaveService(saveFunction, { 33 | debounceMs, 34 | maxRetries,
- warning [react-hooks/refs] 31:7 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:31:7 29 | const isInitializedRef = useRef(false) 30 | > 31 | if (!serviceRef.current && enabled) { | ^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 32 | serviceRef.current = createAutoSaveService(saveFunction, { 33 | debounceMs, 34 | maxRetries,
- warning [react-hooks/refs] 31:8 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:31:8 29 | const isInitializedRef = useRef(false) 30 | > 31 | if (!serviceRef.current && enabled) { | ^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 32 | serviceRef.current = createAutoSaveService(saveFunction, { 33 | debounceMs, 34 | maxRetries, To initialize a ref only once, check that the ref is null with the pattern `if (ref.current == null) { ref.current = ... }`
- warning [react-hooks/refs] 38:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:38:5 36 | }) 37 | > 38 | serviceRef.current.on('onStart', () => { | ^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 39 | logger.debug('[useAutoSave] Save started') 40 | onSaveStart?.() 41 | })
- warning [react-hooks/refs] 38:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:38:5 36 | }) 37 | > 38 | serviceRef.current.on('onStart', () => { | ^^^^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 39 | logger.debug('[useAutoSave] Save started') 40 | onSaveStart?.() 41 | })
- warning [react-hooks/refs] 43:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:43:5 41 | }) 42 | > 43 | serviceRef.current.on('onSuccess', (_request, duration) => { | ^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 44 | logger.info('[useAutoSave] Save successful', { duration }) 45 | onSaved?.(duration) 46 | })
- warning [react-hooks/refs] 43:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:43:5 41 | }) 42 | > 43 | serviceRef.current.on('onSuccess', (_request, duration) => { | ^^^^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 44 | logger.info('[useAutoSave] Save successful', { duration }) 45 | onSaved?.(duration) 46 | })
- warning [react-hooks/refs] 48:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:48:5 46 | }) 47 | > 48 | serviceRef.current.on('onError', (_request, error) => { | ^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 49 | logger.error('[useAutoSave] Save failed', { error: error.message }) 50 | onError?.(error) 51 | })
- warning [react-hooks/refs] 48:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:48:5 46 | }) 47 | > 48 | serviceRef.current.on('onError', (_request, error) => { | ^^^^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 49 | logger.error('[useAutoSave] Save failed', { error: error.message }) 50 | onError?.(error) 51 | })
- warning [react-hooks/refs] 53:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:53:5 51 | }) 52 | > 53 | serviceRef.current.on('onOffline', () => { | ^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 54 | logger.warn('[useAutoSave] Offline detected') 55 | }) 56 |
- warning [react-hooks/refs] 53:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:53:5 51 | }) 52 | > 53 | serviceRef.current.on('onOffline', () => { | ^^^^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 54 | logger.warn('[useAutoSave] Offline detected') 55 | }) 56 |
- warning [react-hooks/refs] 57:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:57:5 55 | }) 56 | > 57 | serviceRef.current.on('onOnline', () => { | ^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 58 | logger.info('[useAutoSave] Online detected, processing queue') 59 | }) 60 |
- warning [react-hooks/refs] 57:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:57:5 55 | }) 56 | > 57 | serviceRef.current.on('onOnline', () => { | ^^^^^^^^^^^^^^^^^^^^^ Passing a ref to a function may read its value during render 58 | logger.info('[useAutoSave] Online detected, processing queue') 59 | }) 60 |
- warning [react-hooks/refs] 61:5 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:61:5 59 | }) 60 | > 61 | isInitializedRef.current = true | ^^^^^^^^^^^^^^^^^^^^^^^^ Cannot update ref during render 62 | } 63 | 64 | const triggerSave = useCallback(
- warning [react-hooks/refs] 121:20 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:121:20 119 | hasPendingSave, 120 | getSaveHistory, > 121 | isInitialized: isInitializedRef.current, | ^^^^^^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 122 | } 123 | } 124 |
- warning [react-hooks/refs] 121:20 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-auto-save.ts:121:20 119 | hasPendingSave, 120 | getSaveHistory, > 121 | isInitialized: isInitializedRef.current, | ^^^^^^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 122 | } 123 | } 124 |

### app/[locale]/dashboard/components/import/atas/atas-processor.tsx (16)
- warning [@typescript-eslint/no-explicit-any] 43:35 Unexpected any. Specify a different type.
- warning [complexity] 43:78 Arrow function has a complexity of 30. Maximum allowed is 10.
- warning [complexity] 165:16 Function 'AtasProcessor' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 180:10 'showCommissionPrompt' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 262:9 'allInstruments' is assigned a value but never used.
- warning [react-hooks/preserve-manual-memoization] 272:37 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `timezone`, but the source dependencies were [csvData, headers, accountNumbers, existingTrades, existingCommissions, setProcessedTrades, t]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/atas/atas-processor.tsx:272:37 270 | }, [allProcessedTrades]); 271 | > 272 | const processTrades = useCallback(() => { | ^^^^^^^ > 273 | const newTrades: Trade[] = []; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 274 | const missingCommissionsTemp: { [key: string]: boolean } = {}; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 437 | } | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 438 | }, [ | ^^^^ Could not preserve existing manual memoization 439 | csvData, 440 | headers, 441 | accountNumbers,
- warning [complexity] 276:27 Arrow function has a complexity of 23. Maximum allowed is 10.
- warning [complexity] 280:39 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 319:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 321:26 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 438:6 React Hook useCallback has a missing dependency: 'timezone'. Either include it or remove the dependency array.
- warning [react-hooks/set-state-in-effect] 482:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/atas/atas-processor.tsx:482:7 480 | useEffect(() => { 481 | if (csvData.length > 0) { > 482 | processTrades(); | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 483 | } 484 | }, [csvData, processTrades]); 485 |
- warning [react-hooks/set-state-in-effect] 488:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/atas/atas-processor.tsx:488:5 486 | // Apply user-set commissions when missingCommissions changes 487 | useEffect(() => { > 488 | setAllProcessedTrades((prevTrades) => { | ^^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 489 | if (prevTrades.length === 0) { 490 | return prevTrades; 491 | }
- warning [react-hooks/set-state-in-effect] 555:9 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/atas/atas-processor.tsx:555:9 553 | 554 | if (hasChanges) { > 555 | setAllProcessedTrades(mergedTrades as Trade[]); | ^^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 556 | } else if (allProcessedTrades.length === 0) { 557 | // If allProcessedTrades is empty but processedTrades has data, initialize it 558 | setAllProcessedTrades(processedTrades as Trade[]);
- warning [react-hooks/exhaustive-deps] 561:6 React Hook useEffect has a missing dependency: 'allProcessedTrades'. Either include it or remove the dependency array.
- warning [@typescript-eslint/no-explicit-any] 729:22 Unexpected any. Specify a different type.

### server/subscription-manager.ts (15)
- warning [@typescript-eslint/no-unused-vars] 4:10 'getSubscriptionDetails' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 50:31 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 53:13 '_existingSubscription' is assigned a value but never used.
- warning [complexity] 118:3 Async method 'updateSubscription' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 124:31 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 135:25 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 136:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 178:39 Unexpected any. Specify a different type.
- warning [complexity] 344:3 Async method 'handlePaymentSuccess' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 354:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 538:31 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 546:40 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 560:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 561:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 629:31 Unexpected any. Specify a different type.

### server/trades.ts (15)
- warning [complexity] 84:1 Function 'serializeTrade' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 84:32 Unexpected any. Specify a different type.
- warning [complexity] 134:1 Function 'generateTradeUUID' has a complexity of 21. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 134:58 Unexpected any. Specify a different type.
- warning [complexity] 155:8 Async function 'saveTradesAction' has a complexity of 17. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 156:9 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 169:31 Unexpected any. Specify a different type.
- warning [complexity] 385:8 Async function 'updateTradesAction' has a complexity of 18. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 403:21 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 432:7 'entryDateOffset' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 432:24 'closeDateOffset' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 432:41 'instrumentTrim' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 432:57 'instrumentPrefix' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 432:75 'instrumentSuffix' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 437:19 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/import/ibkr-pdf/pdf-processing.tsx (14)
- warning [@typescript-eslint/no-unused-vars] 5:10 'Button' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:18 'isValid' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 19:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 25:3 'getExpandedRowModel' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 39:10 'ChevronDown' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 39:23 'ChevronRight' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 42:10 'generateDeterministicTradeId' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 50:48 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 59:3 'setStep' is defined but never used.
- warning [react-hooks/exhaustive-deps] 165:6 React Hook useEffect has a missing dependency: 'userId'. Either include it or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 197:6 React Hook useEffect has a missing dependency: 'submitTrades'. Either include it or remove the dependency array.
- warning [@typescript-eslint/no-unused-vars] 330:31 'columnId' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 355:32 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 364:49 Unexpected any. Specify a different type.

### app/[locale]/teams/components/team-management.tsx (14)
- warning [@typescript-eslint/no-unused-vars] 3:31 'useCallback' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 76:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 77:14 Unexpected any. Specify a different type.
- warning [complexity] 92:8 Function 'TeamManagement' has a complexity of 23. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 93:3 'onTeamClick' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 94:3 'onManageClick' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 95:3 'onViewClick' is defined but never used.
- warning [complexity] 108:38 Async arrow function has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 155:10 'joinDialogOpen' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 167:64 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 172:6 React Hook useEffect has a missing dependency: 'loadTeamData'. Either include it or remove the dependency array.
- warning [@typescript-eslint/no-unused-vars] 224:9 'handleJoinTeam' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 628:29 Unexpected any. Specify a different type.
- warning [complexity] 683:35 Arrow function has a complexity of 15. Maximum allowed is 10.

### server/teams.ts (14)
- warning [complexity] 326:8 Async function 'updateTeamAnalytics' has a complexity of 17. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 381:11 '_totalRr' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 382:11 '_rrCount' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 399:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 399:75 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 400:72 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 401:60 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 403:68 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 404:60 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 424:88 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 425:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 434:88 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 435:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 485:25 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/calendar/daily-modal.tsx (13)
- warning [@typescript-eslint/no-unused-vars] 14:3 'Table' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 15:3 'TableBody' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 16:3 'TableCell' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:3 'TableHead' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:3 'TableHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 19:3 'TableRow' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 21:10 'ScrollArea' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 23:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 23:14 'parsePositionTime' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 46:10 'groupTradesByAccount' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 62:3 'isLoading' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 66:9 'timezone' is assigned a value but never used.
- warning [react-hooks/exhaustive-deps] 77:6 React Hook React.useEffect has a missing dependency: 'dateLocale'. Either include it or remove the dependency array.

### app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx (13)
- warning [@typescript-eslint/no-unused-vars] 20:107 'getDate' is defined but never used.
- warning [complexity] 34:8 Function 'DateRangeSection' has a complexity of 60. Maximum allowed is 10.
- warning [react-hooks/set-state-in-effect] 95:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:95:7 93 | useEffect(() => { 94 | if (dateRange?.from) { > 95 | setFromInputs({ | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 96 | year: getYear(dateRange.from).toString(), 97 | month: (getMonth(dateRange.from) + 1).toString().padStart(2, '0'), 98 | day: "", // Day is selected from calendar
- warning [react-hooks/set-state-in-effect] 111:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:111:7 109 | useEffect(() => { 110 | if (dateRange?.to) { > 111 | setToInputs({ | ^^^^^^^^^^^ Avoid calling setState() directly within an effect 112 | year: getYear(dateRange.to).toString(), 113 | month: (getMonth(dateRange.to) + 1).toString().padStart(2, '0'), 114 | day: "", // Day is selected from calendar
- warning [react-hooks/set-state-in-effect] 127:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:127:7 125 | useEffect(() => { 126 | if (dateRange?.from && dateRange?.to && dateRange.from.getTime() === dateRange.to.getTime()) { > 127 | setUniqueDayInputs({ | ^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 128 | year: getYear(dateRange.from).toString(), 129 | month: (getMonth(dateRange.from) + 1).toString().padStart(2, '0'), 130 | day: "", // Day is selected from calendar
- warning [complexity] 141:71 Arrow function has a complexity of 13. Maximum allowed is 10.
- warning [complexity] 171:79 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 192:77 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 213:84 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 278:5 'prefix' is assigned a value but never used.
- warning [react-hooks/static-components] 448:16 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:448:16 446 | <PopoverContent className="w-auto p-0" align="start"> 447 | <div className="p-4"> > 448 | <DateInputs inputs={fromInputs} onChange={handleFromInputChange} prefix="from-" /> | ^^^^^^^^^^ This component is created during render 449 | <Calendar 450 | initialFocus 451 | mode="single" /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:275:22 273 | 274 | // Date Inputs Component > 275 | const DateInputs = ({ | ^^^ > 276 | inputs, | ^^^^^^^^^^^^ > 277 | onChange, … | ^^^^^^^^^^^^ > 329 | ) | ^^^^^^^^^^^^ > 330 | } | ^^^^ The component is created during render here 331 | 332 | const quickSelectors = [ 333 | { label: t('filters.thisWeek'), getRange: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
- warning [react-hooks/static-components] 505:16 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:505:16 503 | <PopoverContent className="w-auto p-0" align="start"> 504 | <div className="p-4"> > 505 | <DateInputs inputs={toInputs} onChange={handleToInputChange} prefix="to-" /> | ^^^^^^^^^^ This component is created during render 506 | <Calendar 507 | initialFocus 508 | mode="single" /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:275:22 273 | 274 | // Date Inputs Component > 275 | const DateInputs = ({ | ^^^ > 276 | inputs, | ^^^^^^^^^^^^ > 277 | onChange, … | ^^^^^^^^^^^^ > 329 | ) | ^^^^^^^^^^^^ > 330 | } | ^^^^ The component is created during render here 331 | 332 | const quickSelectors = [ 333 | { label: t('filters.thisWeek'), getRange: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
- warning [react-hooks/static-components] 562:16 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:562:16 560 | <PopoverContent className="w-auto p-0" align="start"> 561 | <div className="p-4"> > 562 | <DateInputs inputs={uniqueDayInputs} onChange={handleUniqueDayInputChange} prefix="unique-" /> | ^^^^^^^^^^ This component is created during render 563 | <Calendar 564 | initialFocus 565 | mode="single" /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx:275:22 273 | 274 | // Date Inputs Component > 275 | const DateInputs = ({ | ^^^ > 276 | inputs, | ^^^^^^^^^^^^ > 277 | onChange, … | ^^^^^^^^^^^^ > 329 | ) | ^^^^^^^^^^^^ > 330 | } | ^^^^ The component is created during render here 331 | 332 | const quickSelectors = [ 333 | { label: t('filters.thisWeek'), getRange: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },

### app/[locale]/dashboard/components/tables/trade-image-editor.tsx (13)
- warning [@typescript-eslint/no-unused-vars] 9:3 'DialogTrigger' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 78:10 Unexpected any. Specify a different type.
- warning [complexity] 82:8 Function 'TradeImageEditor' has a complexity of 26. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 91:10 'imageToDelete' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 107:9 'hasImages' is assigned a value but never used.
- warning [react-hooks/exhaustive-deps] 206:6 React Hook useCallback has missing dependencies: 'handleUpdateImages', 't', and 'uploadProps'. Either include them or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 211:6 React Hook useEffect has a missing dependency: 'uploadCallback'. Either include it or remove the dependency array.
- warning [complexity] 213:56 Async arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 229:21 Unexpected any. Specify a different type.
- warning [complexity] 261:42 Async arrow function has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 264:21 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 312:19 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 335:6 React Hook useEffect has a missing dependency: 'uploadProps'. Either include it or remove the dependency array.

### components/emails/weekly-recap.tsx (13)
- warning [@typescript-eslint/no-unused-vars] 4:3 'Button' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 12:3 'Row' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 13:3 'Column' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:3 'Container' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 140:10 'countTradingDays' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 145:10 'findMostActiveDay' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 176:10 'parseDate' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 268:9 'currentStreak' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 269:9 'longestStreak' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 389:12 '_' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 398:9 'currentStreak' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 399:9 'longestStreak' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 403:30 'dayLabels' is assigned a value but never used.

### lib/widget-validator.ts (13)
- warning [@typescript-eslint/no-explicit-any] 67:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 94:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 96:5 'warnings' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 158:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 184:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 219:13 Unexpected any. Specify a different type.
- warning [complexity] 269:3 Method 'validateWidgetConfiguration' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 270:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 272:5 'warnings' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 338:30 'index' is defined but never used.
- warning [complexity] 371:3 Method 'sanitizeWidget' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 371:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 395:27 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/statistics/statistics-widget.tsx (12)
- warning [@typescript-eslint/no-unused-vars] 4:29 'CardDescription' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:10 'Clock' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:17 'PiggyBank' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:28 'Award' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 19:10 'debounce' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 19:39 Unexpected any. Specify a different type.
- warning [complexity] 27:16 Function 'StatisticsWidget' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 29:10 'activeTooltip' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 30:10 'isTouch' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 32:9 'lastTouchTime' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 142:9 'performanceData' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 149:9 'sideData' is assigned a value but never used.

### components/widget-policy/with-risk-evaluation.tsx (12)
- warning [@typescript-eslint/no-unused-vars] 5:57 'DecisionPath' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:33 'WIDGET_ERROR_CODE' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 7:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 40:30 'onRetry' is defined but never used.
- warning [complexity] 123:8 Function 'WithRiskEvaluation' has a complexity of 14. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 183:6 React Hook useCallback has a missing dependency: 'inputs'. Either include it or remove the dependency array.
- warning [react-hooks/use-memo] 183:25 Error: Expected the dependency list to be an array of simple expressions (e.g. `x`, `x.y.z`, `x?.y?.z`) Expected the dependency list to be an array of simple expressions (e.g. `x`, `x.y.z`, `x?.y?.z`). /Users/timon/Downloads/final-qunt-edge-main/components/widget-policy/with-risk-evaluation.tsx:183:25 181 | onError?.(widgetError instanceof Error ? widgetError : new Error(String(widgetError))) 182 | } > 183 | }, [widgetId, action, JSON.stringify(inputs), policyEngine, errorHandler, onError]) | ^^^^^^^^^^^^^^^^^^^^^^ Expected the dependency list to be an array of simple expressions (e.g. `x`, `x.y.z`, `x?.y?.z`) 184 | 185 | useEffect(() => { 186 | evaluatePolicy()
- warning [react-hooks/exhaustive-deps] 183:25 React Hook useCallback has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked.
- warning [@typescript-eslint/no-explicit-any] 243:62 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 250:12 'error' is defined but never used.
- warning [react-hooks/exhaustive-deps] 336:6 React Hook useEffect has a missing dependency: 'inputs'. Either include it or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 336:25 React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked.

### app/[locale]/dashboard/components/accounts/account-configurator.tsx (11)
- warning [@typescript-eslint/no-unused-vars] 8:94 'DialogFooter' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:27 'Trash2' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:42 'ChevronsUpDown' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 23:16 'CardDescription' is defined but never used.
- warning [complexity] 48:8 Function 'AccountConfigurator' has a complexity of 124. Maximum allowed is 10.
- warning [complexity] 78:67 Arrow function has a complexity of 19. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 118:59 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 166:9 'isSaveDisabled' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 176:64 'firmKey' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 183:77 'sizeKey' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 198:55 'sizeKey' is defined but never used.

### lib/performance/optimized-components.tsx (11)
- warning [@typescript-eslint/no-explicit-any] 16:16 Unexpected any. Specify a different type.
- warning [react-hooks/rules-of-hooks] 21:38 React Hook "usePerformanceOptimization" is called conditionally. React Hooks must be called in the exact same order in every component render.
- warning [@typescript-eslint/no-explicit-any] 53:58 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 53:68 Unexpected any. Specify a different type.
- warning [react-hooks/use-memo] 57:34 Error: Expected the dependency list for useMemo to be an array literal Expected the dependency list for useMemo to be an array literal. /Users/timon/Downloads/final-qunt-edge-main/lib/performance/optimized-components.tsx:57:34 55 | deps: React.DependencyList 56 | ): T { > 57 | return useMemo(() => callback, deps) as T | ^^^^ Expected the dependency list for useMemo to be an array literal 58 | } 59 | 60 | export function useOptimizedMemo<T>(factory: () => T, deps: React.DependencyList): T {
- warning [react-hooks/exhaustive-deps] 57:34 React Hook useMemo was passed a dependency list that is not an array literal. This means we can't statically verify whether you've passed the correct dependencies.
- warning [react-hooks/exhaustive-deps] 57:34 React Hook useMemo has a missing dependency: 'callback'. Either include it or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 61:10 React Hook useMemo received a function whose dependencies are unknown. Pass an inline function instead.
- warning [react-hooks/use-memo] 61:18 Error: Expected the first argument to be an inline function expression Expected the first argument to be an inline function expression. /Users/timon/Downloads/final-qunt-edge-main/lib/performance/optimized-components.tsx:61:18 59 | 60 | export function useOptimizedMemo<T>(factory: () => T, deps: React.DependencyList): T { > 61 | return useMemo(factory, deps) | ^^^^^^^ Expected the first argument to be an inline function expression 62 | } 63 | 64 | interface OptimizedListProps<T> {
- warning [react-hooks/use-memo] 61:27 Error: Expected the dependency list for useMemo to be an array literal Expected the dependency list for useMemo to be an array literal. /Users/timon/Downloads/final-qunt-edge-main/lib/performance/optimized-components.tsx:61:27 59 | 60 | export function useOptimizedMemo<T>(factory: () => T, deps: React.DependencyList): T { > 61 | return useMemo(factory, deps) | ^^^^ Expected the dependency list for useMemo to be an array literal 62 | } 63 | 64 | interface OptimizedListProps<T> {
- warning [@typescript-eslint/no-unused-vars] 174:38 'arrayIndex' is defined but never used.

### mdx-components.tsx (11)
- warning [@typescript-eslint/no-unused-vars] 2:17 'ImageProps' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:32 'ComponentProps' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 77:12 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 83:12 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 89:12 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 95:11 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 101:12 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 104:12 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 107:12 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 110:20 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 119:13 'className' is defined but never used.

### server/accounts.ts (11)
- warning [@typescript-eslint/no-unused-vars] 6:45 'TradeInput' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 212:5 'id' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 213:13 '_' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 214:16 '_createdAt' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 215:5 'payouts' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 217:5 'balanceToDate' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 218:5 'group' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 219:5 'metrics' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 220:5 'dailyMetrics' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 221:5 'aboveBuffer' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 223:5 'trades' is assigned a value but never used.

### app/[locale]/dashboard/billing/components/billing-management.tsx (10)
- warning [@typescript-eslint/no-unused-vars] 3:20 'useEffect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:69 'CardFooter' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:10 'Tabs' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:16 'TabsList' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:26 'TabsTrigger' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 7:10 'Check' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 11:64 'SubscriptionWithPrice' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 46:6 'Plans' is defined but never used.
- warning [complexity] 50:16 Function 'BillingManagement' has a complexity of 68. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 103:14 'error' is defined but never used.

### app/[locale]/dashboard/components/charts/contract-quantity.tsx (10)
- warning [@typescript-eslint/no-unused-vars] 15:3 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 16:3 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:3 'CardDescription' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:3 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 22:23 'ChartContainer' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 41:7 'chartConfig' is assigned a value but never used.
- warning [complexity] 48:16 Function 'ContractQuantityChart' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 84:9 'getColor' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 89:54 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 203:29 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/charts/contract-quantity.tsx:203:29 201 | /> 202 | <Tooltip > 203 | content={<CustomTooltip />} | ^^^^^^^^^^^^^ This component is created during render 204 | cursor={{ fill: 'hsl(var(--foreground) / 0.35)' }} 205 | /> 206 | <Bar /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/charts/contract-quantity.tsx:89:25 87 | }; 88 | > 89 | const CustomTooltip = ({ active, payload, label }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 90 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 91 | const data = payload[0].payload; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 113 | return null; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 114 | }; | ^^^^ The component is created during render here 115 | 116 | return ( 117 | <ChartSurface>

### app/[locale]/dashboard/components/charts/daily-tick-target.tsx (10)
- warning [@typescript-eslint/no-unused-vars] 4:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:41 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:18 'HelpCircle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:10 'Switch' is defined but never used.
- warning [complexity] 37:16 Function 'DailyTickTargetChart' has a complexity of 29. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 48:5 'getTodayTarget' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 49:5 'getTodayProgress' is assigned a value but never used.
- warning [react-hooks/set-state-in-effect] 95:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/charts/daily-tick-target.tsx:95:5 93 | 94 | // Use the from date as the selected date for storage > 95 | setSelectedDate(fromDate) | ^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 96 | 97 | // Filter trades for the selected period (even if trades array is empty) 98 | const displayTrades = trades.filter(trade => {

### app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx (10)
- warning [@typescript-eslint/no-unused-vars] 14:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:41 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 37:7 'chartConfig' is assigned a value but never used.
- warning [complexity] 47:16 Function 'TimeOfDayTradeChart' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 92:9 'maxPnL' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 93:9 'minPnL' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 96:9 'getColor' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 101:54 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/global-sync-button.tsx (10)
- warning [@typescript-eslint/no-unused-vars] 3:33 'useMemo' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:21 'CheckCircle2' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:35 'AlertCircle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:55 'Settings2' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:66 'ShieldCheck' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:79 'ShieldAlert' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 12:18 'AnimatePresence' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 16:5 'DropdownMenuItem' is defined but never used.
- warning [complexity] 24:8 Function 'GlobalSyncButton' has a complexity of 13. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 26:13 'rithmic' is assigned a value but never used.

### app/[locale]/dashboard/components/mindset/mindset-widget.tsx (10)
- warning [@typescript-eslint/no-unused-vars] 10:43 'ChevronUp' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:54 'ChevronDown' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 30:10 'Trade' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 43:10 'isEditing' is assigned a value but never used.
- warning [complexity] 54:16 Arrow function has a complexity of 15. Maximum allowed is 10.
- warning [react-hooks/set-state-in-effect] 83:9 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/mindset/mindset-widget.tsx:83:9 81 | if (isToday(selectedDate) && hasTodayData) { 82 | // Set data to today's data > 83 | setEmotionValue(mood?.emotionValue ?? 50) | ^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 84 | setSelectedNews(mood?.selectedNews ?? []) 85 | setJournalContent(mood?.journalContent ?? "") 86 | setIsEditing(true)
- warning [@typescript-eslint/no-unused-vars] 151:14 'error' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 183:14 'error' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 453:25 'api' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 453:30 'event' is defined but never used.

### app/[locale]/dashboard/components/widget-canvas.tsx (10)
- warning [complexity] 43:88 Arrow function has a complexity of 15. Maximum allowed is 10.
- warning [complexity] 158:4 Arrow function has a complexity of 29. Maximum allowed is 10.
- warning [complexity] 388:16 Function 'WidgetCanvas' has a complexity of 15. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 436:6 React Hook useCallback has a missing dependency: 'setIsCustomizing'. Either include it or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 564:6 React Hook useCallback has an unnecessary dependency: 'toast'. Either exclude it or remove the dependency array. Outer scope values like 'toast' aren't valid dependencies because mutating them doesn't re-render the component.
- warning [@typescript-eslint/no-explicit-any] 644:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 647:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 654:22 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 661:22 Unexpected any. Specify a different type.
- warning [complexity] 692:48 Arrow function has a complexity of 15. Maximum allowed is 10.

### hooks/use-hash-upload.ts (10)
- warning [react-hooks/preserve-manual-memoization] 166:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `setLoading`, but the source dependencies were [files, path, bucketName, errors, successes, cacheControl, upsert]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:166:32 164 | }) 165 | > 166 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 167 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 168 | … | ^^^^^^^^^^^^^^^^^^^^ > 239 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 240 | }, [files, path, bucketName, errors, successes, cacheControl, upsert]) | ^^^^ Could not preserve existing manual memoization 241 | 242 | useEffect(() => { 243 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 166:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `getScopedBasePath`, but the source dependencies were [files, path, bucketName, errors, successes, cacheControl, upsert]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:166:32 164 | }) 165 | > 166 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 167 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 168 | … | ^^^^^^^^^^^^^^^^^^^^ > 239 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 240 | }, [files, path, bucketName, errors, successes, cacheControl, upsert]) | ^^^^ Could not preserve existing manual memoization 241 | 242 | useEffect(() => { 243 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 166:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `computeFileHash`, but the source dependencies were [files, path, bucketName, errors, successes, cacheControl, upsert]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:166:32 164 | }) 165 | > 166 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 167 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 168 | … | ^^^^^^^^^^^^^^^^^^^^ > 239 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 240 | }, [files, path, bucketName, errors, successes, cacheControl, upsert]) | ^^^^ Could not preserve existing manual memoization 241 | 242 | useEffect(() => { 243 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 166:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `getFileExtension`, but the source dependencies were [files, path, bucketName, errors, successes, cacheControl, upsert]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:166:32 164 | }) 165 | > 166 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 167 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 168 | … | ^^^^^^^^^^^^^^^^^^^^ > 239 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 240 | }, [files, path, bucketName, errors, successes, cacheControl, upsert]) | ^^^^ Could not preserve existing manual memoization 241 | 242 | useEffect(() => { 243 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 166:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `setErrors`, but the source dependencies were [files, path, bucketName, errors, successes, cacheControl, upsert]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:166:32 164 | }) 165 | > 166 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 167 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 168 | … | ^^^^^^^^^^^^^^^^^^^^ > 239 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 240 | }, [files, path, bucketName, errors, successes, cacheControl, upsert]) | ^^^^ Could not preserve existing manual memoization 241 | 242 | useEffect(() => { 243 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 166:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `setSuccesses`, but the source dependencies were [files, path, bucketName, errors, successes, cacheControl, upsert]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:166:32 164 | }) 165 | > 166 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 167 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 168 | … | ^^^^^^^^^^^^^^^^^^^^ > 239 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 240 | }, [files, path, bucketName, errors, successes, cacheControl, upsert]) | ^^^^ Could not preserve existing manual memoization 241 | 242 | useEffect(() => { 243 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 166:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `setUploadedPaths`, but the source dependencies were [files, path, bucketName, errors, successes, cacheControl, upsert]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:166:32 164 | }) 165 | > 166 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 167 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 168 | … | ^^^^^^^^^^^^^^^^^^^^ > 239 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 240 | }, [files, path, bucketName, errors, successes, cacheControl, upsert]) | ^^^^ Could not preserve existing manual memoization 241 | 242 | useEffect(() => { 243 | if (files.length === 0) {
- warning [react-hooks/exhaustive-deps] 240:6 React Hook useCallback has a missing dependency: 'getScopedBasePath'. Either include it or remove the dependency array.
- warning [react-hooks/set-state-in-effect] 262:9 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts:262:9 260 | }) 261 | if (changed) { > 262 | setFiles(newFiles) | ^^^^^^^^ Avoid calling setState() directly within an effect 263 | } 264 | } 265 | }, [files.length, setFiles, maxFiles])
- warning [react-hooks/exhaustive-deps] 265:6 React Hook useEffect has a missing dependency: 'files'. Either include it or remove the dependency array.

### lib/performance/code-splitting.tsx (10)
- warning [@typescript-eslint/no-unused-vars] 19:10 '_ssr' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 59:47 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 60:55 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 62:49 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 66:53 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 109:70 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 117:6 React Hook useEffect was passed a dependency list that is not an array literal. This means we can't statically verify whether you've passed the correct dependencies.
- warning [react-hooks/exhaustive-deps] 117:6 React Hook useEffect has a missing dependency: 'keys'. Either include it or remove the dependency array.
- warning [@typescript-eslint/no-explicit-any] 121:44 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 133:54 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/calendar/daily-comment.tsx (9)
- warning [@typescript-eslint/no-unused-vars] 5:3 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:3 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 7:3 'CardDescription' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 8:3 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 9:3 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 30:11 'Mood' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 38:17 Unexpected any. Specify a different type.
- warning [complexity] 43:8 Function 'DailyComment' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 43:32 'dayData' is defined but never used.

### app/[locale]/dashboard/components/calendar/daily-stats.tsx (9)
- warning [@typescript-eslint/no-unused-vars] 12:8 'Decimal' is defined but never used.
- warning [complexity] 34:8 Function 'DailyStats' has a complexity of 15. Maximum allowed is 10.
- warning [react-hooks/preserve-manual-memoization] 38:95 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `dayData.trades`, but the source dependencies were [dayData?.trades]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/calendar/daily-stats.tsx:38:95 36 | 37 | // Calculate stats > 38 | const { totalPnL, avgTimeInPosition, accountCount, maxDrawdown, maxProfit } = React.useMemo(() => { | ^^^^^^^ > 39 | if (!dayData?.trades?.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 40 | return { … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 94 | } | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 95 | }, [dayData?.trades]) | ^^^^ Could not preserve existing manual memoization 96 | 97 | if (!dayData?.trades?.length) { 98 | return null
- warning [react-hooks/preserve-manual-memoization] 38:95 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `dayData.trades`, but the source dependencies were [dayData?.trades]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/calendar/daily-stats.tsx:38:95 36 | 37 | // Calculate stats > 38 | const { totalPnL, avgTimeInPosition, accountCount, maxDrawdown, maxProfit } = React.useMemo(() => { | ^^^^^^^ > 39 | if (!dayData?.trades?.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 40 | return { … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 94 | } | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 95 | }, [dayData?.trades]) | ^^^^ Could not preserve existing manual memoization 96 | 97 | if (!dayData?.trades?.length) { 98 | return null
- warning [@typescript-eslint/no-explicit-any] 50:83 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 58:74 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 62:50 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 62:58 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 65:34 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/charts/weekday-pnl.tsx (9)
- warning [@typescript-eslint/no-unused-vars] 14:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:41 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 40:7 'chartConfig' is assigned a value but never used.
- warning [complexity] 47:16 Function 'WeekdayPNLChart' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 101:9 'getColor' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 122:45 'label' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 122:54 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/filters/tag-widget.tsx (9)
- warning [@typescript-eslint/no-unused-vars] 10:16 'X' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 24:3 'CardDescription' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 25:3 'CardFooter' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 38:61 'syncTradeTagsToTagTableAction' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 40:10 'Tag' is defined but never used.
- warning [complexity] 79:8 Function 'TagWidget' has a complexity of 22. Maximum allowed is 10.
- warning [complexity] 103:51 Async arrow function has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 137:15 'updatedTag' is assigned a value but never used.
- warning [complexity] 454:43 Arrow function has a complexity of 13. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/ftmo/ftmo-processor.tsx (9)
- warning [@typescript-eslint/no-unused-vars] 3:17 'useState' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 29:41 'headers' is defined but never used.
- warning [complexity] 32:42 Arrow function has a complexity of 38. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 120:99 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 121:93 Unexpected any. Specify a different type.
- warning [complexity] 156:62 Arrow function has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 170:64 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 171:73 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 172:57 Unexpected any. Specify a different type.

### server/payment-security.ts (9)
- warning [complexity] 280:3 Method 'redactSensitiveData' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 280:29 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 280:35 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 285:21 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 365:29 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 447:56 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 447:74 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 456:27 Unexpected any. Specify a different type.
- warning [complexity] 456:34 Async arrow function has a complexity of 11. Maximum allowed is 10.

### tests/account-metrics.test.ts (9)
- warning [@typescript-eslint/no-explicit-any] 9:50 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 10:50 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 11:50 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 23:45 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 24:45 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 37:50 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 40:45 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 65:37 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 66:50 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/calendar/mobile-calendar.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 4:40 'startOfMonth' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:54 'endOfMonth' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:66 'eachDayOfInterval' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:85 'isSameMonth' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:98 'isToday' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 71:21 'setIsLoading' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 138:14 '_' is defined but never used.
- warning [complexity] 194:48 Arrow function has a complexity of 20. Maximum allowed is 10.

### app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 14:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:41 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 16:23 'ChartContainer' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 51:7 'chartConfig' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 72:43 'label' is defined but never used.
- warning [complexity] 110:16 Function 'PNLChart' has a complexity of 15. Maximum allowed is 10.

### app/[locale]/dashboard/components/charts/tick-distribution.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 14:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:41 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 48:7 'chartConfig' is assigned a value but never used.
- warning [complexity] 62:16 Function 'TickDistributionChart' has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 108:33 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 251:29 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/charts/tick-distribution.tsx:251:29 249 | /> 250 | <Tooltip > 251 | content={<CustomTooltip />} | ^^^^^^^^^^^^^ This component is created during render 252 | cursor={{ fill: 'hsl(var(--foreground) / 0.35)' }} 253 | /> 254 | <Bar /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/charts/tick-distribution.tsx:118:25 116 | }; 117 | > 118 | const CustomTooltip = ({ active, payload }: TooltipProps) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 119 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 120 | const data = payload[0].payload; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 136 | return null; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 137 | }; | ^^^^ The component is created during render here 138 | 139 | return ( 140 | <ChartSurface>

### app/[locale]/dashboard/components/charts/time-in-position.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 14:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 14:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 35:7 'chartConfig' is assigned a value but never used.
- warning [complexity] 51:16 Function 'TimeInPositionChart' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 86:9 'getColor' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 91:54 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 216:29 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/charts/time-in-position.tsx:216:29 214 | /> 215 | <Tooltip > 216 | content={<CustomTooltip />} | ^^^^^^^^^^^^^ This component is created during render 217 | cursor={{ fill: 'hsl(var(--foreground) / 0.35)' }} 218 | /> 219 | <Bar /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/charts/time-in-position.tsx:91:25 89 | }; 90 | > 91 | const CustomTooltip = ({ active, payload, label }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 92 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 93 | const data = payload[0].payload; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 126 | return null; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 127 | }; | ^^^^ The component is created during render here 128 | 129 | return ( 130 | <ChartSurface>

### app/[locale]/dashboard/components/charts/time-range-performance.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 5:10 'Card' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:16 'CardContent' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:29 'CardHeader' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:41 'CardTitle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 20:10 'ChartConfig' is defined but never used.
- warning [complexity] 26:1 Function 'getTimeRangeKey' has a complexity of 16. Maximum allowed is 10.
- warning [complexity] 54:16 Function 'TimeRangePerformanceChart' has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 116:54 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-connection.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 3:44 'useRef' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 12:10 'RithmicSyncFeedback' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 15:27 'getRithmicData' is defined but never used.
- warning [complexity] 34:8 Function 'RithmicSyncConnection' has a complexity of 27. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 109:68 'isAutoConnect' is assigned a value but never used.
- warning [complexity] 109:100 Async arrow function has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 254:44 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 429:6 React Hook useCallback has missing dependencies: 'credentials.username' and 't'. Either include them or remove the dependency array.

### app/[locale]/dashboard/components/tables/trade-tag.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 3:20 'useMemo' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 3:29 'useEffect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:16 'Search' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:24 'Trash2' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 5:32 'X' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 22:10 'Tag' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 216:10 'getContrastColor' is defined but never used.

### app/[locale]/dashboard/settings/page.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 41:3 'DropdownMenuLabel' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 44:3 'DropdownMenuSeparator' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 48:10 'createTeam' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 48:22 'joinTeam' is defined but never used.
- warning [complexity] 79:16 Function 'SettingsPage' has a complexity of 21. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 100:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 101:18 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 586:29 Unexpected any. Specify a different type.

### app/[locale]/teams/components/team-navbar.tsx (8)
- warning [@typescript-eslint/no-unused-vars] 10:27 'Globe' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:5 'navigationMenuTriggerStyle' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 24:19 'CommandEmpty' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 24:47 'CommandInput' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 102:12 'themeOpen' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 103:12 'languageOpen' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 110:11 'handleLanguageChange' is assigned a value but never used.
- warning [react-hooks/static-components] 308:38 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/teams/components/team-navbar.tsx:308:38 306 | <div className="flex flex-col h-full"> 307 | <div className="grow overflow-y-auto py-6"> > 308 | <MobileNavContent onLinkClick={closeMenu} /> | ^^^^^^^^^^^^^^^^ This component is created during render 309 | </div> 310 | </div> 311 | </SheetContent> /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/teams/components/team-navbar.tsx:127:30 125 | }; 126 | > 127 | const MobileNavContent = ({ onLinkClick }: { onLinkClick: () => void }) => ( | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 128 | <nav className="flex flex-col space-y-4"> | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 129 | <Accordion type="single" collapsible className="w-full"> … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 188 | </nav> | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 189 | ) | ^^^^^^ The component is created during render here 190 | 191 | return ( 192 | <>

### context/rithmic-sync-context.tsx (8)
- warning [complexity] 130:31 Arrow function has a complexity of 54. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 154:21 '_' is defined but never used.
- warning [react-hooks/exhaustive-deps] 498:5 React Hook useCallback has a missing dependency: 'setIsAutoSyncing'. Either include it or remove the dependency array.
- warning [complexity] 538:34 Async arrow function has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 607:37 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 609:38 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 697:5 React Hook useCallback has a missing dependency: 'trades'. Either include it or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 848:6 React Hook useCallback has a missing dependency: 'isLoading'. Either include it or remove the dependency array.

### lib/trade-types.ts (8)
- warning [complexity] 39:8 Function 'decimalToNumber' has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 43:65 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 44:88 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 47:61 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 51:61 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 55:61 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 57:22 Unexpected any. Specify a different type.
- warning [complexity] 75:8 Function 'toImportTradeDraft' has a complexity of 24. Maximum allowed is 10.

### app/[locale]/(landing)/support/page.tsx (7)
- warning [@typescript-eslint/no-unused-vars] 51:44 'UIMessage' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 82:33 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 82:41 Unexpected any. Specify a different type.
- warning [complexity] 82:46 Arrow function has a complexity of 22. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 106:55 'error' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 167:9 'askForEmailForm' is assigned a value but never used.
- warning [complexity] 221:46 Arrow function has a complexity of 17. Maximum allowed is 10.

### app/[locale]/admin/components/newsletter/subscriber-table.tsx (7)
- warning [@typescript-eslint/no-unused-vars] 15:10 'Input' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 16:10 'Label' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:10 'Newsletter' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 20:39 'X' is defined but never used.
- warning [complexity] 33:8 Function 'SubscriberTable' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 41:68 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 317:68 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/analysis/accounts-analysis.tsx (7)
- warning [@typescript-eslint/no-unused-vars] 34:6 'AccountMetrics' is defined but never used.
- warning [complexity] 108:8 Function 'AccountsAnalysis' has a complexity of 70. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 124:42 'stop' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 128:24 'message' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 160:70 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 347:37 Unexpected any. Specify a different type.
- warning [complexity] 347:57 Arrow function has a complexity of 12. Maximum allowed is 10.

### app/[locale]/dashboard/components/share-button.tsx (7)
- warning [@typescript-eslint/no-unused-vars] 17:41 'format' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 49:14 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 50:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 114:25 'size' is assigned a value but never used.
- warning [complexity] 114:62 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [react-hooks/set-state-in-effect] 153:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/share-button.tsx:153:7 151 | // Update date range when trades change 152 | useEffect(() => { > 153 | setSelectedDateRange({ | ^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 154 | from: defaultDateRange.from, 155 | to: undefined 156 | })
- warning [complexity] 172:34 Async arrow function has a complexity of 18. Maximum allowed is 10.

### components/mdx-sidebar.tsx (7)
- warning [@typescript-eslint/no-unused-vars] 4:8 'Link' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:10 'motion' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:18 'AnimatePresence' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 7:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 8:10 'ChevronRight' is defined but never used.
- warning [react-hooks/set-state-in-effect] 59:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/components/mdx-sidebar.tsx:59:7 57 | ) 58 | if (currentGroup) { > 59 | setExpandedGroups(new Set([currentGroup.title])) | ^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 60 | } 61 | }, [pathname]) 62 |
- warning [@typescript-eslint/no-unused-vars] 63:9 'toggleGroup' is assigned a value but never used.

### lib/widget-optimistic-updates.ts (7)
- warning [@typescript-eslint/no-unused-vars] 1:10 'DashboardLayoutWithWidgets' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 15:54 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 16:43 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 59:41 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 67:33 Unexpected any. Specify a different type.
- warning [complexity] 103:3 Async method 'executeOptimisticUpdate' has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 147:3 Async method 'executeBatchOptimisticUpdate' has a complexity of 12. Maximum allowed is 10.

### scripts/performance-audit.mjs (7)
- warning [@typescript-eslint/no-unused-vars] 51:12 'error' is defined but never used.
- warning [complexity] 184:1 Function 'scanForMemoryLeaks' has a complexity of 13. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 236:16 'error' is defined but never used.
- warning [complexity] 266:1 Function 'analyzeStaticGenerationOpportunities' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 301:16 'error' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 367:16 'error' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 419:12 'error' is defined but never used.

### app/[locale]/dashboard/components/chat/equity-chart-message.tsx (6)
- warning [@typescript-eslint/no-unused-vars] 15:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 76:27 Unexpected any. Specify a different type.
- warning [complexity] 76:32 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 188:5 'showIndividual' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 193:15 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 197:8 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/chat/input.tsx (6)
- warning [@typescript-eslint/no-unused-vars] 1:41 'useMemo' is defined but never used.
- warning [complexity] 41:8 Function 'ChatInput' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 92:74 Unexpected any. Specify a different type.
- warning [complexity] 128:50 Arrow function has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 229:74 Unexpected any. Specify a different type.
- warning [@next/next/no-img-element] 328:19 Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element

### app/[locale]/dashboard/components/filters/account-group-board.tsx (6)
- warning [@typescript-eslint/no-unused-vars] 3:10 'Group' is defined but never used.
- warning [complexity] 59:8 Function 'AccountGroupBoard' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 73:5 'deleteAccount' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 307:9 'selectAllMatching' is assigned a value but never used.
- warning [react-hooks/exhaustive-deps] 440:6 React Hook useCallback has a missing dependency: 'groups'. Either include it or remove the dependency array.
- warning [complexity] 613:39 Arrow function has a complexity of 20. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/import-button.tsx (6)
- warning [@typescript-eslint/no-unused-vars] 3:35 'useEffect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 26:10 'usePdfProcessingStore' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 33:6 'ColumnConfig' is defined but never used.
- warning [complexity] 75:43 Async arrow function has a complexity of 15. Maximum allowed is 10.
- warning [complexity] 238:25 Arrow function has a complexity of 18. Maximum allowed is 10.
- warning [complexity] 386:29 Arrow function has a complexity of 19. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/ninjatrader/ninjatrader-performance-processor.tsx (6)
- warning [complexity] 27:88 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 104:62 Arrow function has a complexity of 18. Maximum allowed is 10.
- warning [complexity] 239:37 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 248:39 Arrow function has a complexity of 18. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 299:40 Unexpected any. Specify a different type.
- warning [react-hooks/set-state-in-effect] 341:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/ninjatrader/ninjatrader-performance-processor.tsx:341:5 339 | 340 | useEffect(() => { > 341 | processTrades(); | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 342 | }, [processTrades]); 343 | 344 | const totalPnL = useMemo(() => trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0), [trades]);

### app/[locale]/dashboard/components/import/tradovate/tradovate-credentials-manager.tsx (6)
- warning [@typescript-eslint/no-unused-vars] 3:33 'useEffect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 35:10 'useData' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 52:21 'setSyncingId' is assigned a value but never used.
- warning [react-hooks/exhaustive-deps] 75:5 React Hook useCallback has a missing dependency: 'deleteAccount'. Either include it or remove the dependency array.
- warning [@typescript-eslint/no-unused-vars] 95:14 'error' is defined but never used.
- warning [no-constant-condition] 311:23 Unexpected constant condition.

### app/[locale]/dashboard/components/mindset/hourly-financial-timeline.tsx (6)
- warning [@typescript-eslint/no-explicit-any] 58:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 238:60 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 239:48 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 364:39 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 529:29 'onClick' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 529:60 'expanded' is assigned a value but never used.

### app/[locale]/dashboard/components/widgets/expectancy-widget.tsx (6)
- warning [complexity] 12:16 Function 'ExpectancyWidget' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 12:44 'size' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 16:83 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 23:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 25:49 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 27:33 Unexpected any. Specify a different type.

### app/[locale]/teams/components/user-equity/user-equity-chart.tsx (6)
- warning [@typescript-eslint/no-unused-vars] 3:31 'LineChart' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 3:42 'Line' is defined but never used.
- warning [complexity] 86:1 Function 'getSmartTicks' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 117:54 Unexpected any. Specify a different type.
- warning [complexity] 117:59 Arrow function has a complexity of 27. Maximum allowed is 10.
- warning [react-hooks/static-components] 261:30 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/teams/components/user-equity/user-equity-chart.tsx:261:30 259 | tickFormatter={(value) => Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value)} 260 | /> > 261 | <Tooltip content={<CustomTooltip />} /> | ^^^^^^^^^^^^^ This component is created during render 262 | <Area 263 | type="monotone" 264 | dataKey="cumulativePnL" /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/teams/components/user-equity/user-equity-chart.tsx:117:25 115 | const trendColor = totalPnL >= 0 ? "hsl(var(--chart-positive))" : "hsl(var(--chart-negative))" 116 | > 117 | const CustomTooltip = ({ active, payload, label }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 118 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 119 | if (showDailyView) { … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 207 | return null | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 208 | } | ^^^^ The component is created during render here 209 | 210 | return ( 211 | <div data-chart-surface="modern" className="h-32">

### components/lazy/charts.tsx (6)
- warning [@typescript-eslint/no-explicit-any] 13:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 21:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 29:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 37:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 45:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 53:20 Unexpected any. Specify a different type.

### components/tiptap/menu-bar.tsx (6)
- warning [complexity] 15:8 Function 'ResponsiveMenuBar' has a complexity of 15. Maximum allowed is 10.
- warning [complexity] 43:5 Method 'selector' has a complexity of 32. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 77:45 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 90:41 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 91:41 Unexpected any. Specify a different type.
- warning [complexity] 443:38 Arrow function has a complexity of 12. Maximum allowed is 10.

### lib/performance/render-optimization.ts (6)
- warning [react-hooks/refs] 108:23 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/lib/performance/render-optimization.ts:108:23 106 | 107 | return { > 108 | isLowPerformance: isLowPerformanceRef.current, | ^^^^^^^^^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 109 | fps: renderOptimizationEngine.getFPSMetrics() 110 | } 111 | }
- warning [react-hooks/refs] 108:23 Error: Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef). /Users/timon/Downloads/final-qunt-edge-main/lib/performance/render-optimization.ts:108:23 106 | 107 | return { > 108 | isLowPerformance: isLowPerformanceRef.current, | ^^^^^^^^^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render 109 | fps: renderOptimizationEngine.getFPSMetrics() 110 | } 111 | }
- warning [@typescript-eslint/no-explicit-any] 113:58 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 113:68 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 134:58 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 134:68 Unexpected any. Specify a different type.

### lib/widget-persistence-manager.ts (6)
- warning [@typescript-eslint/no-unused-vars] 1:38 'Widget' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 2:32 'StorageResult' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:34 'ConflictResolution' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:27 'ValidationResult' is defined but never used.
- warning [complexity] 103:3 Async method 'performSave' has a complexity of 20. Maximum allowed is 10.
- warning [complexity] 222:3 Async method 'detectAndResolveConflict' has a complexity of 17. Maximum allowed is 10.

### proxy.ts (6)
- warning [complexity] 124:1 Async function 'updateSession' has a complexity of 22. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 165:75 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 168:23 Unexpected any. Specify a different type.
- warning [complexity] 203:16 Async function 'middleware' has a complexity of 69. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 350:38 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 468:14 'geoError' is defined but never used.

### server/shared.ts (6)
- warning [@typescript-eslint/no-explicit-any] 21:13 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 22:12 Unexpected any. Specify a different type.
- warning [complexity] 34:8 Async function 'createShared' has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 96:26 Async arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 181:38 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 182:36 Unexpected any. Specify a different type.

### tests/e2e/performance/load-testing.spec.ts (6)
- warning [@typescript-eslint/no-explicit-any] 154:44 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 161:35 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 178:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 179:35 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 193:37 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 196:30 Unexpected any. Specify a different type.

### app/[locale]/admin/components/send-email/send-email-page-client.tsx (5)
- warning [complexity] 35:8 Function 'SendEmailPageClient' has a complexity of 15. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 112:5 React Hook useMemo has a missing dependency: 'templateOptions'. Either include it or remove the dependency array.
- warning [@typescript-eslint/no-unused-vars] 114:9 'selectedTemplateLabel' is assigned a value but never used.
- warning [complexity] 188:31 Async arrow function has a complexity of 11. Maximum allowed is 10.
- warning [complexity] 234:57 Arrow function has a complexity of 13. Maximum allowed is 10.

### app/[locale]/dashboard/components/accounts/accounts-table-view.tsx (5)
- warning [react-hooks/incompatible-library] 158:17 Compilation Skipped: Use of incompatible library This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/accounts/accounts-table-view.tsx:158:17 156 | return drawdownThreshold > 0 && remainingLoss !== undefined && remainingLoss <= 0 157 | } > 158 | const table = useReactTable({ | ^^^^^^^^^^^^^ TanStack Table's `useReactTable()` API returns functions that cannot be memoized safely 159 | data: rows, 160 | columns, 161 | state: { sorting, expanded },
- warning [complexity] 219:69 Arrow function has a complexity of 15. Maximum allowed is 10.
- warning [complexity] 720:9 Method 'cell' has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 780:9 Method 'cell' has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 883:9 Method 'sortingFn' has a complexity of 13. Maximum allowed is 10.

### app/[locale]/dashboard/components/calendar/charts.tsx (5)
- warning [complexity] 57:8 Function 'Charts' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 151:71 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 158:32 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 172:77 Unexpected any. Specify a different type.
- warning [complexity] 172:82 Arrow function has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/components/filters/account-filter.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 3:19 'CommandEmpty' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 8:20 'useEffect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 31:53 'className' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 110:23 'prev' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 115:27 'item' is defined but never used.

### app/[locale]/dashboard/components/import/manual/manual-processor.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 3:36 'useCallback' is defined but never used.
- warning [complexity] 44:16 Function 'ManualProcessor' has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 72:38 Arrow function has a complexity of 11. Maximum allowed is 10.
- warning [complexity] 96:25 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 199:57 Arrow function has a complexity of 13. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/topstep/topstep-processor.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 1:17 'useState' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 8:10 'generateDeterministicTradeId' is defined but never used.
- warning [complexity] 34:45 Arrow function has a complexity of 20. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 95:54 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 123:22 'e' is defined but never used.

### app/[locale]/dashboard/components/mindset/mindset-summary.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 22:6 'ImpactLevel' is defined but never used.
- warning [react-hooks/set-state-in-effect] 32:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/mindset/mindset-summary.tsx:32:5 30 | 31 | useEffect(() => { > 32 | setMounted(true) | ^^^^^^^^^^ Avoid calling setState() directly within an effect 33 | }, []) 34 | 35 | if (!mounted) {
- warning [react-hooks/set-state-in-effect] 77:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/mindset/mindset-summary.tsx:77:5 75 | return matchesDate && matchesLocale && matchesSelectedNews 76 | }) > 77 | setEvents(dateEvents) | ^^^^^^^^^ Avoid calling setState() directly within an effect 78 | }, [date, financialEvents, locale, selectedNews, showOnlySelectedNews]) 79 | 80 | const getEmotionLabel = (value: number) => {
- warning [react-hooks/set-state-in-effect] 99:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/mindset/mindset-summary.tsx:99:5 97 | 98 | useEffect(() => { > 99 | setEmotion(getEmotionLabel(emotionValue)) | ^^^^^^^^^^ Avoid calling setState() directly within an effect 100 | }, [emotionValue]) 101 | 102 | return (
- warning [react-hooks/exhaustive-deps] 100:6 React Hook useEffect has a missing dependency: 'getEmotionLabel'. Either include it or remove the dependency array.

### app/[locale]/dashboard/components/tables/bulk-edit-panel.tsx (5)
- warning [@typescript-eslint/no-explicit-any] 16:43 Unexpected any. Specify a different type.
- warning [complexity] 22:8 Function 'BulkEditPanel' has a complexity of 21. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 53:22 Unexpected any. Specify a different type.
- warning [complexity] 75:49 Async arrow function has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 80:22 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/tables/column-header.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 2:62 'X' is defined but never used.
- warning [complexity] 35:8 Function 'DataTableColumnHeader' has a complexity of 17. Maximum allowed is 10.
- warning [react-hooks/set-state-in-effect] 57:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/tables/column-header.tsx:57:5 55 | useEffect(() => { 56 | const filter = column.getFilterValue() as { min?: number; max?: number } | undefined > 57 | setMinValue(filter?.min?.toString() || '') | ^^^^^^^^^^^ Avoid calling setState() directly within an effect 58 | setMaxValue(filter?.max?.toString() || '') 59 | }, [column.getFilterValue()]) 60 |
- warning [react-hooks/exhaustive-deps] 59:6 React Hook useEffect has a missing dependency: 'column'. Either include it or remove the dependency array.
- warning [react-hooks/exhaustive-deps] 59:7 React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked.

### app/[locale]/dashboard/config/widget-registry.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 25:10 'MoodSelector' is defined but never used.
- warning [react-hooks/rules-of-hooks] 154:13 React Hook "useI18n" is called in function "createMindsetPreview" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use".
- warning [@typescript-eslint/no-unused-vars] 284:9 't' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 616:22 'size' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 643:22 'size' is defined but never used.

### app/[locale]/dashboard/data/components/data-management/data-management-card.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 2:53 'useRef' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 17:10 'User' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 21:93 'DialogTrigger' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 24:10 'Prisma' is defined but never used.
- warning [complexity] 35:8 Function 'DataManagementCard' has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/settings/actions.ts (5)
- warning [@typescript-eslint/no-unused-vars] 4:8 'auth' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:12 'error' is defined but never used.
- warning [complexity] 240:8 Async function 'addManagerToTeam' has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 555:8 Async function 'addTraderToTeam' has a complexity of 11. Maximum allowed is 10.
- warning [complexity] 619:8 Async function 'sendTeamInvitation' has a complexity of 26. Maximum allowed is 10.

### app/api/imports/ibkr/extract-orders/route.ts (5)
- warning [@typescript-eslint/no-unused-vars] 48:7 '_' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 53:7 'settleDate' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 57:7 'value' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 61:7 'code' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 122:7 '_' is assigned a value but never used.

### components/ui/mood-tracker.tsx (5)
- warning [@typescript-eslint/no-unused-vars] 26:3 'color' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 27:3 'defaultBackgroundColor' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 31:3 'hoveredIndex' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 35:3 'isHighlighted' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 111:56 'totalBlocks' is defined but never used.

### hooks/use-supabase-upload.ts (5)
- warning [react-hooks/preserve-manual-memoization] 134:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `setLoading`, but the source dependencies were [files, bucketName, errors, successes, cacheControl, upsert, getScopedBasePath]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-supabase-upload.ts:134:32 132 | }) 133 | > 134 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 135 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 136 | … | ^^^^^^^^^^^^^^^^^^^^ > 182 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 183 | }, [files, bucketName, errors, successes, cacheControl, upsert, getScopedBasePath]) | ^^^^ Could not preserve existing manual memoization 184 | 185 | useEffect(() => { 186 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 134:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `setErrors`, but the source dependencies were [files, bucketName, errors, successes, cacheControl, upsert, getScopedBasePath]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-supabase-upload.ts:134:32 132 | }) 133 | > 134 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 135 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 136 | … | ^^^^^^^^^^^^^^^^^^^^ > 182 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 183 | }, [files, bucketName, errors, successes, cacheControl, upsert, getScopedBasePath]) | ^^^^ Could not preserve existing manual memoization 184 | 185 | useEffect(() => { 186 | if (files.length === 0) {
- warning [react-hooks/preserve-manual-memoization] 134:32 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `setSuccesses`, but the source dependencies were [files, bucketName, errors, successes, cacheControl, upsert, getScopedBasePath]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/hooks/use-supabase-upload.ts:134:32 132 | }) 133 | > 134 | const onUpload = useCallback(async () => { | ^^^^^^^^^^^^^ > 135 | setLoading(true) | ^^^^^^^^^^^^^^^^^^^^ > 136 | … | ^^^^^^^^^^^^^^^^^^^^ > 182 | setLoading(false) | ^^^^^^^^^^^^^^^^^^^^ > 183 | }, [files, bucketName, errors, successes, cacheControl, upsert, getScopedBasePath]) | ^^^^ Could not preserve existing manual memoization 184 | 185 | useEffect(() => { 186 | if (files.length === 0) {
- warning [react-hooks/set-state-in-effect] 203:9 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-supabase-upload.ts:203:9 201 | }) 202 | if (changed) { > 203 | setFiles(newFiles) | ^^^^^^^^ Avoid calling setState() directly within an effect 204 | } 205 | } 206 | }, [files.length, setFiles, maxFiles])
- warning [react-hooks/exhaustive-deps] 206:6 React Hook useEffect has a missing dependency: 'files'. Either include it or remove the dependency array.

### lib/ai/telemetry.ts (5)
- warning [complexity] 38:8 Function 'extractUsage' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 38:37 Unexpected any. Specify a different type.
- warning [complexity] 62:8 Function 'categorizeAiError' has a complexity of 22. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 63:31 Unexpected any. Specify a different type.
- warning [complexity] 89:8 Async function 'logAiRequest' has a complexity of 16. Maximum allowed is 10.

### app/[locale]/(authentication)/components/user-auth-form.tsx (4)
- warning [complexity] 67:8 Function 'UserAuthForm' has a complexity of 21. Maximum allowed is 10.
- warning [complexity] 139:5 Async function 'onSubmitEmail' has a complexity of 11. Maximum allowed is 10.
- warning [complexity] 171:5 Function 'parseAuthError' has a complexity of 22. Maximum allowed is 10.
- warning [complexity] 370:5 Function 'openMailClient' has a complexity of 32. Maximum allowed is 10.

### app/[locale]/dashboard/components/accounts/account-table.tsx (4)
- warning [complexity] 39:8 Function 'AccountTable' has a complexity of 12. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 40:3 'accountNumber' is defined but never used.
- warning [complexity] 126:3 Function 'renderMetricRow' has a complexity of 14. Maximum allowed is 10.
- warning [react-hooks/immutability] 347:19 Error: Cannot reassign variable after render completes Reassigning `runningBalance_3` after render has completed can cause inconsistent behavior on subsequent renders. Consider using state instead. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/accounts/account-table.tsx:347:19 345 | let runningBalance = startingBalance 346 | return metricsAfterReset.map(metric => { > 347 | runningBalance += metric.pnl | ^^^^^^^^^^^^^^ Cannot reassign `runningBalance_3` after render completes 348 | if (metric.payout?.status === 'PAID') { 349 | runningBalance -= metric.payout.amount 350 | }

### app/[locale]/dashboard/components/accounts/suggestion-input.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 6:10 'Check' is defined but never used.
- warning [complexity] 19:16 Function 'EnhancedInput' has a complexity of 18. Maximum allowed is 10.
- warning [react-hooks/immutability] 58:9 Error: Cannot access variable before it is declared `validateInput` is accessed before it is declared, which prevents the earlier access from updating when this value changes over time. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/accounts/suggestion-input.tsx:58:9 56 | ) { 57 | setShowSuggestions(false) > 58 | validateInput(value) | ^^^^^^^^^^^^^ `validateInput` accessed before it is declared 59 | if (value) { 60 | setConfirmed(true) 61 | } /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/accounts/suggestion-input.tsx:103:3 101 | }, [initialValue, validate, hasInteracted]) 102 | > 103 | const validateInput = (inputValue: string) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 104 | if (!validate) { | ^^^^^^^^^^^^^^^^^^^^ > 105 | setIsValid(true) … | ^^^^^^^^^^^^^^^^^^^^ > 112 | return result.valid | ^^^^^^^^^^^^^^^^^^^^ > 113 | } | ^^^^ `validateInput` is declared here 114 | 115 | const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { 116 | const newValue = e.target.value
- warning [react-hooks/exhaustive-deps] 69:6 React Hook useEffect has a missing dependency: 'validateInput'. Either include it or remove the dependency array.

### app/[locale]/dashboard/components/calendar/weekly-modal.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 7:10 'ScrollArea' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 26:3 'isLoading' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 37:19 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 45:43 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/filters/filter-command-menu-account-section.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 3:20 'useEffect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 36:30 'setShowAccountNumbers' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 109:23 'prev' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 114:27 'item' is defined but never used.

### app/[locale]/dashboard/components/filters/filter-command-menu.tsx (4)
- warning [complexity] 29:8 Function 'FilterCommandMenu' has a complexity of 28. Maximum allowed is 10.
- warning [complexity] 147:60 Async arrow function has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 215:80 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 359:85 Arrow function has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/account-selection.tsx (4)
- warning [react-hooks/set-state-in-effect] 33:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/account-selection.tsx:33:5 31 | 32 | useEffect(() => { > 33 | setLocalAccounts(prev => Array.from(new Set([...prev, ...accounts]))) | ^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 34 | }, [accounts]) 35 | 36 | const handleAddAccount = useCallback((e: React.MouseEvent) => {
- warning [react-hooks/preserve-manual-memoization] 36:40 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `accountNumbers`, but the source dependencies were [newAccountNumber, localAccounts, setAccountNumbers, onAddAccount, setNewAccountNumber, t, toast]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/account-selection.tsx:36:40 34 | }, [accounts]) 35 | > 36 | const handleAddAccount = useCallback((e: React.MouseEvent) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^ > 37 | e.stopPropagation() | ^^^^^^^^^^^^^^^^^^^^^^^ > 38 | if (newAccountNumber.trim()) { … | ^^^^^^^^^^^^^^^^^^^^^^^ > 48 | } | ^^^^^^^^^^^^^^^^^^^^^^^ > 49 | }, [newAccountNumber, localAccounts, setAccountNumbers, onAddAccount, setNewAccountNumber, t, toast]) | ^^^^ Could not preserve existing manual memoization 50 | 51 | return ( 52 | <div className="h-full flex flex-col">
- warning [react-hooks/exhaustive-deps] 49:6 React Hook useCallback has a missing dependency: 'accountNumbers'. Either include it or remove the dependency array. Outer scope values like 'toast' aren't valid dependencies because mutating them doesn't re-render the component.
- warning [@typescript-eslint/no-explicit-any] 113:45 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/import/column-mapping.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 1:17 'useEffect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 13:6 'MappingKey' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 58:89 'importType' is defined but never used.
- warning [complexity] 65:75 Arrow function has a complexity of 12. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/import-type-selection.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 11:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 39:10 'hoveredCategory' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 79:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 80:33 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/import/rithmic/rithmic-order-processor-new.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 55:12 '_' is assigned a value but never used.
- warning [complexity] 175:41 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 318:47 'symbol' is defined but never used.
- warning [react-hooks/set-state-in-effect] 339:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/rithmic/rithmic-order-processor-new.tsx:339:5 337 | 338 | useEffect(() => { > 339 | processOrders() | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 340 | }, [processOrders]) 341 | 342 | const uniqueSymbols = useMemo(() => Array.from(new Set(processedTrades.map(trade => trade.instrument))), [processedTrades])

### app/[locale]/dashboard/components/import/rithmic/sync/rithmic-notifications.tsx (4)
- warning [complexity] 37:8 Function 'RithmicSyncNotifications' has a complexity of 17. Maximum allowed is 10.
- warning [react-hooks/purity] 45:18 Error: Cannot call impure function during render `Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/rithmic/sync/rithmic-notifications.tsx:45:18 43 | title: t('notification.title'), 44 | message: t('notification.noAccount'), > 45 | timestamp: Date.now(), | ^^^^^^^^^^ Cannot call impure function 46 | progress: { 47 | current: 0, 48 | total: 0,
- warning [complexity] 103:16 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 123:18 '_' is assigned a value but never used.

### app/[locale]/dashboard/components/import/tradezella/tradezella-processor.tsx (4)
- warning [@typescript-eslint/no-explicit-any] 47:40 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 50:40 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 65:55 Unexpected any. Specify a different type.
- warning [react-hooks/set-state-in-effect] 93:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/tradezella/tradezella-processor.tsx:93:5 91 | 92 | useEffect(() => { > 93 | processTrades(); | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 94 | }, [processTrades]); 95 | 96 | const totalPnL = useMemo(() => trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0), [trades]);

### app/[locale]/dashboard/components/tables/trade-comment.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 5:10 'Tag' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 6:10 'Trade' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 11:10 'updateTradeCommentAction' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 25:67 'onCommentChange' is defined but never used.

### app/[locale]/dashboard/components/widgets/trading-score-widget.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 11:46 'size' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 27:26 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 29:49 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 31:33 Unexpected any. Specify a different type.

### app/[locale]/dashboard/data/components/data-management/account-equity-chart.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 4:56 'ResponsiveContainer' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:77 'TooltipProps' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 45:11 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 140:13 'stopProfitBalance' is assigned a value but never used.

### app/[locale]/embed/components/time-range-performance.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 15:10 'cn' is defined but never used.
- warning [complexity] 26:1 Function 'getTimeRangeKey' has a complexity of 16. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 60:10 'activeRange' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 126:54 Unexpected any. Specify a different type.

### app/[locale]/embed/page.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 32:48 '_' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 32:51 'i' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 74:48 Unexpected any. Specify a different type.
- warning [complexity] 129:53 Arrow function has a complexity of 17. Maximum allowed is 10.

### app/[locale]/shared/[slug]/opengraph-image.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 4:10 'Logo' is defined but never used.
- warning [complexity] 17:16 Async function 'Image' has a complexity of 22. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 139:15 'lossAngle' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 147:15 'secondaryColor' is assigned a value but never used.

### app/[locale]/teams/components/user-equity/team-equity-grid-client.tsx (4)
- warning [@typescript-eslint/no-explicit-any] 23:11 Unexpected any. Specify a different type.
- warning [complexity] 53:8 Function 'TeamEquityGridClient' has a complexity of 20. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 330:23 'index' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 345:30 Unexpected any. Specify a different type.

### components/export-button.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 6:20 'CalendarIcon' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 8:29 'CardFooter' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 15:10 'cn' is defined but never used.
- warning [react-hooks/set-state-in-effect] 166:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/components/export-button.tsx:166:5 164 | 165 | useEffect(() => { > 166 | updateFilteredTrades() | ^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 167 | }, [updateFilteredTrades]) 168 | 169 | const totalPages = Math.ceil(filteredTrades.length / itemsPerPage)

### components/ui/chart.tsx (4)
- warning [@typescript-eslint/no-unused-vars] 72:7 '_' is defined but never used.
- warning [complexity] 133:43 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 185:38 Arrow function has a complexity of 20. Maximum allowed is 10.
- warning [complexity] 317:1 Function 'getPayloadConfigFromPayload' has a complexity of 12. Maximum allowed is 10.

### lib/__tests__/payment-flows.test.ts (4)
- warning [@typescript-eslint/no-unused-vars] 475:15 'sub' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 501:15 'sub' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 544:36 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 594:15 'invoice' is assigned a value but never used.

### lib/indexeddb/trades-cache.ts (4)
- warning [@typescript-eslint/no-unused-vars] 1:21 'PrismaAccount' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 1:45 'PrismaGroup' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 33:32 'event' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 75:14 'e' is defined but never used.

### lib/translation-utils.ts (4)
- warning [@typescript-eslint/no-explicit-any] 11:34 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 12:19 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 18:37 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 34:40 Unexpected any. Specify a different type.

### lib/utils.ts (4)
- warning [@typescript-eslint/no-unused-vars] 5:10 'format' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 131:53 'accounts' is assigned a value but never used.
- warning [complexity] 142:70 Arrow function has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 158:14 'e' is defined but never used.

### lib/widget-policy-engine/decision-engine.ts (4)
- warning [@typescript-eslint/no-unused-vars] 17:11 'riskScore' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 18:11 'severity' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 75:57 'context' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 120:57 'context' is defined but never used.

### lib/widget-policy-engine/manifest-validator.ts (4)
- warning [complexity] 131:3 Method 'generateManifestWarnings' has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 179:44 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 179:50 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 194:11 Unexpected any. Specify a different type.

### remove_gradients.js (4)
- warning [@typescript-eslint/no-require-imports] 1:12 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-unused-vars] 2:7 'path' is assigned a value but never used.
- warning [@typescript-eslint/no-require-imports] 2:14 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-unused-vars] 24:7 'patternsToRemove' is assigned a value but never used.

### server/billing.ts (4)
- warning [complexity] 44:8 Async function 'getSubscriptionData' has a complexity of 37. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 72:54 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 198:31 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 215:81 '_subscriptionId' is defined but never used.

### server/equity-chart.ts (4)
- warning [complexity] 111:50 Arrow function has a complexity of 42. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 290:39 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 362:13 'relevantTrades' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 389:15 'account' is assigned a value but never used.

### app/[locale]/admin/actions/stats.ts (3)
- warning [@typescript-eslint/no-unused-vars] 7:10 'Subscription' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 32:17 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 143:54 Unexpected any. Specify a different type.

### app/[locale]/admin/actions/weekly-recap.ts (3)
- warning [@typescript-eslint/no-unused-vars] 4:10 'PrismaClient' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 45:10 'formatPnL' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 155:17 Unexpected any. Specify a different type.

### app/[locale]/admin/components/newsletter/newsletter-audio-splitter.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 6:41 'Mic' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 20:46 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 24:9 't' is assigned a value but never used.

### app/[locale]/admin/components/payments/subscriptions-table.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 16:10 'Loader2' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 34:12 'isCancelling' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 47:18 'error' is defined but never used.

### app/[locale]/admin/components/theme-switcher.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 3:10 'useState' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:19 'CommandEmpty' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:47 'CommandInput' is defined but never used.

### app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx (3)
- warning [complexity] 22:8 Function 'ComparisonTable' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 39:31 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 54:22 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/accounts/trade-progress-chart.tsx (3)
- warning [complexity] 106:58 Arrow function has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 165:29 Unexpected any. Specify a different type.
- warning [complexity] 239:48 Arrow function has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/components/calendar/desktop-calendar.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 219:37 'index' is defined but never used.
- warning [complexity] 295:16 Function 'CalendarPnl' has a complexity of 22. Maximum allowed is 10.
- warning [complexity] 630:47 Arrow function has a complexity of 32. Maximum allowed is 10.

### app/[locale]/dashboard/components/data-debug.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 7:29 'Database' is defined but never used.
- warning [complexity] 11:8 Function 'DataDebug' has a complexity of 12. Maximum allowed is 10.
- warning [react-hooks/rules-of-hooks] 67:72 React Hook "useData" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?

### app/[locale]/dashboard/components/filters/instrument-filter-simple.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 10:47 'CommandInput' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:42 'className' is defined but never used.
- warning [react-hooks/set-state-in-effect] 28:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/instrument-filter-simple.tsx:28:7 26 | if (trades && trades.length > 0) { 27 | const uniqueInstruments = Array.from(new Set(trades.map(trade => trade.instrument || ''))) > 28 | setAvailableInstruments(uniqueInstruments) | ^^^^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 29 | } 30 | }, [trades]) 31 |

### app/[locale]/dashboard/components/filters/tag-filter.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 10:47 'CommandInput' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:29 'className' is defined but never used.
- warning [react-hooks/set-state-in-effect] 30:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/tag-filter.tsx:30:5 28 | tag.name.toLowerCase().includes(searchQuery.toLowerCase()) 29 | ) ?? [] > 30 | setFilteredTags(filtered) | ^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 31 | }, [tags, searchQuery]) 32 | 33 | const handleSelect = (tagName: string) => {

### app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 25:3 'importType' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 73:40 'rowNumber' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 75:59 'colNumber' is defined but never used.

### app/[locale]/dashboard/components/import/components/import-dialog-header.tsx (3)
- warning [@typescript-eslint/no-explicit-any] 26:65 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 28:66 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 48:29 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/import/components/platform-card.tsx (3)
- warning [complexity] 20:8 Function 'PlatformCard' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 86:45 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 90:48 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/import/config/platforms.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 5:10 'ImportType' is defined but never used.
- warning [complexity] 60:21 Arrow function has a complexity of 11. Maximum allowed is 10.
- warning [@typescript-eslint/no-empty-object-type] 180:31 The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`. - If that's what you want, disable this lint rule with an inline comment or configure the 'allowObjectTypes' rule option. - If you want a type meaning "any object", you probably want `object` instead. - If you want a type meaning "any value", you probably want `unknown` instead.

### app/[locale]/dashboard/components/import/rithmic/rithmic-performance-processor.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 3:17 'useState' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 56:54 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 69:22 'e' is defined but never used.

### app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx (3)
- warning [complexity] 98:45 Arrow function has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 168:54 Unexpected any. Specify a different type.
- warning [react-hooks/set-state-in-effect] 221:9 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx:221:9 219 | 220 | useEffect(() => { > 221 | processTrades(); | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 222 | }, [processTrades]); 223 | 224 | const handleCommissionChange = (instrument: string, value: string) => {

### app/[locale]/dashboard/import/page.tsx (3)
- warning [react-hooks/set-state-in-effect] 44:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/import/page.tsx:44:7 42 | 43 | if (useTradovateSyncStore.persist?.hasHydrated?.()) { > 44 | setStoreHydrated(true); | ^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 45 | } 46 | 47 | return () => {
- warning [complexity] 53:37 Async arrow function has a complexity of 29. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 195:6 React Hook useEffect has a missing dependency: 'refreshAllData'. Either include it or remove the dependency array.

### app/[locale]/embed/components/commissions-pnl.tsx (3)
- warning [@typescript-eslint/no-explicit-any] 57:47 Unexpected any. Specify a different type.
- warning [complexity] 57:52 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [react-hooks/static-components] 138:27 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/commissions-pnl.tsx:138:27 136 | </Pie> 137 | <Tooltip > 138 | content={<CustomTooltip />} | ^^^^^^^^^^^^^ This component is created during render 139 | wrapperStyle={{ fontSize: "12px", zIndex: 1000 }} 140 | /> 141 | <Legend verticalAlign="bottom" align="center" /> /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/commissions-pnl.tsx:57:25 55 | v.toLocaleString("en-US", { style: "currency", currency: "USD" }); 56 | > 57 | const CustomTooltip = ({ active, payload }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 58 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 59 | const item = payload[0]; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 93 | return null; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 94 | }; | ^^^^ The component is created during render here 95 | 96 | return ( 97 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/embed/components/tick-distribution.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 148:45 'label' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 148:54 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 261:56 Unexpected any. Specify a different type.

### app/[locale]/embed/components/trade-distribution.tsx (3)
- warning [@typescript-eslint/no-explicit-any] 66:47 Unexpected any. Specify a different type.
- warning [complexity] 66:52 Arrow function has a complexity of 12. Maximum allowed is 10.
- warning [react-hooks/static-components] 200:27 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/trade-distribution.tsx:200:27 198 | /> 199 | <Tooltip > 200 | content={<CustomTooltip />} | ^^^^^^^^^^^^^ This component is created during render 201 | wrapperStyle={{ fontSize: "12px", zIndex: 1000 }} 202 | /> 203 | </PieChart> /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/trade-distribution.tsx:66:25 64 | ); 65 | > 66 | const CustomTooltip = ({ active, payload }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 67 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 68 | const item = payload[0]; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 108 | return null; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 109 | }; | ^^^^ The component is created during render here 110 | 111 | return ( 112 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/teams/components/theme-switcher.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 3:10 'useState' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:19 'CommandEmpty' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:47 'CommandInput' is defined but never used.

### app/[locale]/teams/join/page.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 13:3 'Users' is defined but never used.
- warning [complexity] 35:16 Function 'TeamJoinPage' has a complexity of 17. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 58:6 React Hook useEffect has a missing dependency: 'loadInvitationDetails'. Either include it or remove the dependency array.

### app/api/ai/mappings/route.ts (3)
- warning [complexity] 90:1 Function 'validateMapping' has a complexity of 30. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 250:107 Unexpected any. Specify a different type.
- warning [complexity] 264:8 Async function 'POST' has a complexity of 25. Maximum allowed is 10.

### app/api/etp/v1/store/route.ts (3)
- warning [complexity] 29:1 Function 'validateOrderPayload' has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 93:8 Async function 'POST' has a complexity of 16. Maximum allowed is 10.
- warning [complexity] 192:8 Async function 'GET' has a complexity of 13. Maximum allowed is 10.

### app/api/imports/ibkr/fifo-computation/route.ts (3)
- warning [complexity] 14:1 Function 'matchOrdersWithFIFO' has a complexity of 20. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 113:9 'matched' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 156:51 Unexpected any. Specify a different type.

### components/subscription-badge.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 5:18 'differenceInDays' is defined but never used.
- warning [complexity] 18:8 Function 'SubscriptionBadge' has a complexity of 24. Maximum allowed is 10.
- warning [complexity] 89:30 Arrow function has a complexity of 17. Maximum allowed is 10.

### components/tiptap-editor.tsx (3)
- warning [complexity] 120:8 Function 'TiptapEditor' has a complexity of 19. Maximum allowed is 10.
- warning [complexity] 167:41 Async arrow function has a complexity of 14. Maximum allowed is 10.
- warning [complexity] 250:44 Arrow function has a complexity of 11. Maximum allowed is 10.

### components/ui/dropzone.tsx (3)
- warning [@next/next/no-img-element] 113:17 Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element
- warning [@typescript-eslint/no-unused-vars] 188:11 'maxFiles' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 188:34 'inputRef' is assigned a value but never used.

### components/ui/language-selector.tsx (3)
- warning [@typescript-eslint/no-unused-vars] 7:19 'CommandEmpty' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 7:47 'CommandInput' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 40:9 'currentLocale' is assigned a value but never used.

### context/theme-provider.tsx (3)
- warning [react-hooks/set-state-in-effect] 59:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/context/theme-provider.tsx:59:5 57 | } 58 | }) > 59 | applyTheme(savedTheme || 'system') | ^^^^^^^^^^ Avoid calling setState() directly within an effect 60 | }, []) 61 | 62 | useEffect(() => {
- warning [react-hooks/preserve-manual-memoization] 103:25 Compilation Skipped: Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `toggleTheme`, but the source dependencies were [theme, effectiveTheme, intensity]. Inferred different dependency than source. /Users/timon/Downloads/final-qunt-edge-main/context/theme-provider.tsx:103:25 101 | } 102 | > 103 | const value = useMemo(() => ({ | ^^^^^^^^ > 104 | theme, | ^^^^^^^^^^ > 105 | effectiveTheme, | ^^^^^^^^^^ > 106 | intensity, | ^^^^^^^^^^ > 107 | setTheme, | ^^^^^^^^^^ > 108 | setIntensity, | ^^^^^^^^^^ > 109 | toggleTheme, | ^^^^^^^^^^ > 110 | }), [theme, effectiveTheme, intensity]) | ^^^^^ Could not preserve existing manual memoization 111 | 112 | return ( 113 | <ThemeContext.Provider value={value}>
- warning [react-hooks/exhaustive-deps] 110:7 React Hook useMemo has a missing dependency: 'toggleTheme'. Either include it or remove the dependency array.

### context/tradovate-sync-context.tsx (3)
- warning [complexity] 48:46 Arrow function has a complexity of 11. Maximum allowed is 10.
- warning [complexity] 107:32 Async arrow function has a complexity of 15. Maximum allowed is 10.
- warning [react-hooks/exhaustive-deps] 280:6 React Hook useEffect has a missing dependency: 'checkAndPerformSyncs'. Either include it or remove the dependency array.

### lib/auto-save-service.ts (3)
- warning [@typescript-eslint/no-explicit-any] 77:19 Unexpected any. Specify a different type.
- warning [complexity] 125:3 Async method 'executeSave' has a complexity of 11. Maximum allowed is 10.
- warning [complexity] 183:3 Async method 'performSaveWithRetry' has a complexity of 13. Maximum allowed is 10.

### lib/databento.ts (3)
- warning [@typescript-eslint/no-unused-vars] 1:10 'format' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 101:3 'resolution' is assigned a value but never used.
- warning [@typescript-eslint/no-explicit-any] 134:25 Unexpected any. Specify a different type.

### lib/default-layouts.ts (3)
- warning [@typescript-eslint/no-unused-vars] 2:3 'WidgetType' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 3:3 'WidgetSize' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 4:3 'Widget' is defined but never used.

### lib/mdx.ts (3)
- warning [@typescript-eslint/no-explicit-any] 56:33 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 61:44 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 64:44 Unexpected any. Specify a different type.

### lib/widget-encryption.ts (3)
- warning [@typescript-eslint/no-explicit-any] 38:23 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 181:27 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 198:29 Unexpected any. Specify a different type.

### lib/widget-policy-engine/__tests__/integration.test.ts (3)
- warning [@typescript-eslint/no-unused-vars] 1:32 'beforeEach' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 11:13 'schemaValidator' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 12:13 'errorHandler' is assigned a value but never used.

### lib/widget-policy-engine/__tests__/property-based.test.ts (3)
- warning [@typescript-eslint/no-unused-vars] 1:24 'expect' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 13:13 'calculator' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 76:13 'calculator' is assigned a value but never used.

### server/optimized-trades.ts (3)
- warning [complexity] 16:14 Async arrow function has a complexity of 17. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 17:20 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 163:85 Unexpected any. Specify a different type.

### server/user-data.ts (3)
- warning [@typescript-eslint/no-explicit-any] 14:11 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 45:12 'error' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 229:33 Unexpected any. Specify a different type.

### tests/performance/performance-regression.test.ts (3)
- warning [@typescript-eslint/no-unused-vars] 9:22 'act' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 10:30 'usePerformanceMonitor' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 109:28 Unexpected any. Specify a different type.

### tests/sanitize.test.ts (3)
- warning [@typescript-eslint/ban-ts-comment] 8:5 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 10:9 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.
- warning [@typescript-eslint/ban-ts-comment] 14:5 Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.

### app/[locale]/(landing)/propfirms/page.tsx (2)
- warning [complexity] 191:60 Arrow function has a complexity of 21. Maximum allowed is 10.
- warning [complexity] 233:57 Arrow function has a complexity of 15. Maximum allowed is 10.

### app/[locale]/(landing)/support/components/support-form.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 14:10 'PromptInputMessage' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 15:10 'useUserStore' is defined but never used.

### app/[locale]/admin/components/dashboard/admin-dashboard.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 33:19 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 34:20 Unexpected any. Specify a different type.

### app/[locale]/admin/components/dashboard/user-growth-chart.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 7:10 'Badge' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 80:35 Unexpected any. Specify a different type.

### app/[locale]/admin/components/weekly-stats/weekly-recap-preview.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 24:96 'selectedEmail' is assigned a value but never used.
- warning [complexity] 66:36 Async arrow function has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/behavior/page-client.tsx (2)
- warning [complexity] 39:16 Function 'DashboardBehaviorPage' has a complexity of 41. Maximum allowed is 10.
- warning [complexity] 120:40 Arrow function has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/behavior/page.tsx (2)
- warning [complexity] 27:16 Function 'DashboardBehaviorPage' has a complexity of 41. Maximum allowed is 10.
- warning [complexity] 101:40 Arrow function has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/components/charts/account-selection-popover.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 20:6 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 32:9 'maxAccounts' is assigned a value but never used.

### app/[locale]/dashboard/components/charts/pnl-by-side.tsx (2)
- warning [complexity] 49:16 Function 'PnLBySideChart' has a complexity of 14. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 99:65 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx (2)
- warning [complexity] 73:16 Function 'PnLPerContractDailyChart' has a complexity of 18. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 151:65 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/charts/pnl-per-contract.tsx (2)
- warning [complexity] 61:16 Function 'PnLPerContractChart' has a complexity of 15. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 110:65 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/chat/actions/chat.ts (2)
- warning [@typescript-eslint/no-unused-vars] 4:19 'format' is defined but never used.
- warning [@typescript-eslint/no-explicit-any] 36:24 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/dashboard-header.tsx (2)
- warning [complexity] 59:8 Function 'DashboardHeader' has a complexity of 58. Maximum allowed is 10.
- warning [complexity] 90:25 Arrow function has a complexity of 13. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/components/platform-tutorial.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 6:10 'cn' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 18:3 'setIsOpen' is defined but never used.

### app/[locale]/dashboard/components/import/etp/etp-sync.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 25:27 'setIsOpen' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 77:14 'error' is defined but never used.

### app/[locale]/dashboard/components/import/ibkr-pdf/pdf-upload.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 3:40 'useEffect' is defined but never used.
- warning [react-hooks/exhaustive-deps] 97:6 React Hook useCallback has a missing dependency: 'setFiles'. Either include it or remove the dependency array. If 'setFiles' changes too often, find the parent component that defines it and wrap that definition in useCallback.

### app/[locale]/dashboard/components/import/rithmic/sync/rithmic-credentials-manager.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 28:3 'DialogTrigger' is defined but never used.
- warning [complexity] 405:38 Arrow function has a complexity of 25. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-progress.tsx (2)
- warning [complexity] 46:19 Arrow function has a complexity of 21. Maximum allowed is 10.
- warning [complexity] 82:73 Arrow function has a complexity of 12. Maximum allowed is 10.

### app/[locale]/dashboard/components/import/thor/thor-sync.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 25:28 'setIsOpen' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 76:14 'error' is defined but never used.

### app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 13:43 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-unused-vars] 23:9 't' is assigned a value but never used.

### app/[locale]/dashboard/components/tables/trade-video-url.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 9:10 'updateTradeVideoUrlAction' is defined but never used.
- warning [complexity] 25:8 Function 'TradeVideoUrl' has a complexity of 21. Maximum allowed is 10.

### app/[locale]/dashboard/trader-profile/page-client.tsx (2)
- warning [complexity] 137:16 Function 'TraderProfilePage' has a complexity of 35. Maximum allowed is 10.
- warning [complexity] 176:34 Arrow function has a complexity of 13. Maximum allowed is 10.

### app/[locale]/dashboard/trader-profile/page.tsx (2)
- warning [complexity] 138:16 Function 'TraderProfilePage' has a complexity of 35. Maximum allowed is 10.
- warning [complexity] 177:34 Arrow function has a complexity of 13. Maximum allowed is 10.

### app/[locale]/embed/components/contract-quantity.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 31:54 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 73:34 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/contract-quantity.tsx:73:34 71 | <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}h`} ticks={[0,3,6,9,12,15,18,21]} /> 72 | <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v: number) => v.toFixed(0)} /> > 73 | <Tooltip content={<CustomTooltip />} contentStyle={{ | ^^^^^^^^^^^^^ This component is created during render 74 | background: 'hsl(var(--embed-tooltip-bg, var(--background)))', 75 | borderColor: 'hsl(var(--embed-tooltip-border, var(--border)))', 76 | borderRadius: 'var(--embed-tooltip-radius, 0.5rem)' /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/contract-quantity.tsx:31:25 29 | const getColor = (count: number) => `hsl(var(--chart-1) / ${Math.max(0.2, count / maxTradeCount)})` 30 | > 31 | const CustomTooltip = ({ active, payload, label }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 32 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 33 | const data = payload[0].payload … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 46 | return null | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 47 | } | ^^^^ The component is created during render here 48 | 49 | return ( 50 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/embed/components/pnl-bar-chart.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 85:47 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 194:27 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-bar-chart.tsx:194:27 192 | /> 193 | <Tooltip > 194 | content={<CustomTooltip />} | ^^^^^^^^^^^^^ This component is created during render 195 | wrapperStyle={{ fontSize: "12px", zIndex: 1000 }} 196 | /> 197 | <Bar /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-bar-chart.tsx:85:25 83 | ); 84 | > 85 | const CustomTooltip = ({ active, payload }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 86 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 87 | const data = payload[0].payload; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 142 | return null; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 143 | }; | ^^^^ The component is created during render here 144 | 145 | return ( 146 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/embed/components/pnl-by-side.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 107:47 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 207:27 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-by-side.tsx:207:27 205 | <ReferenceLine y={0} stroke="hsl(var(--border))" /> 206 | <Tooltip > 207 | content={<CustomTooltip />} | ^^^^^^^^^^^^^ This component is created during render 208 | wrapperStyle={{ fontSize: "12px", zIndex: 1000 }} 209 | /> 210 | <Bar /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-by-side.tsx:107:25 105 | }; 106 | > 107 | const CustomTooltip = ({ active, payload }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 108 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 109 | const data = payload[0].payload; … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 149 | return null; | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 150 | }; | ^^^^ The component is created during render here 151 | 152 | return ( 153 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/embed/components/pnl-per-contract-daily.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 69:47 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 147:34 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-per-contract-daily.tsx:147:34 145 | /> 146 | <ReferenceLine y={0} stroke="hsl(var(--border))" /> > 147 | <Tooltip content={<CustomTooltip />} wrapperStyle={{ fontSize: '12px', zIndex: 1000 }} /> | ^^^^^^^^^^^^^ This component is created during render 148 | <Bar dataKey="averagePnl" radius={[3, 3, 0, 0]} maxBarSize={40} className="transition-all duration-300 ease-in-out"> 149 | {chartData.map((entry, idx) => ( 150 | <Cell key={`cell-${idx}`} fill={getColor(entry.averagePnl)} /> /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-per-contract-daily.tsx:69:25 67 | } 68 | > 69 | const CustomTooltip = ({ active, payload }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 70 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 71 | const data = payload[0].payload … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 103 | return null | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 104 | } | ^^^^ The component is created during render here 105 | 106 | return ( 107 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/embed/components/pnl-per-contract.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 73:47 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 148:34 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-per-contract.tsx:148:34 146 | /> 147 | <ReferenceLine y={0} stroke="hsl(var(--border))" /> > 148 | <Tooltip content={<CustomTooltip />} wrapperStyle={{ fontSize: '12px', zIndex: 1000 }} /> | ^^^^^^^^^^^^^ This component is created during render 149 | <Bar dataKey="averagePnl" radius={[3, 3, 0, 0]} maxBarSize={40} className="transition-all duration-300 ease-in-out"> 150 | {chartData.map((entry, idx) => ( 151 | <Cell key={`cell-${idx}`} fill={getColor(entry.averagePnl)} /> /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/pnl-per-contract.tsx:73:25 71 | } 72 | > 73 | const CustomTooltip = ({ active, payload }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 74 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 75 | const data = payload[0].payload … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 103 | return null | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 104 | } | ^^^^ The component is created during render here 105 | 106 | return ( 107 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/embed/components/time-in-position.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 50:54 Unexpected any. Specify a different type.
- warning [react-hooks/static-components] 119:34 Error: Cannot create components during render Components created during render will reset their state each time they are created. Declare components outside of render. /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/time-in-position.tsx:119:34 117 | tickFormatter={formatTime} 118 | /> > 119 | <Tooltip content={<CustomTooltip />} wrapperStyle={{ fontSize: '12px', zIndex: 1000 }} /> | ^^^^^^^^^^^^^ This component is created during render 120 | <Bar dataKey="avgTimeInPosition" radius={[3, 3, 0, 0]} maxBarSize={40} className="transition-all duration-300 ease-in-out"> 121 | {chartData.map((entry, idx) => ( 122 | <Cell key={`cell-${idx}`} fill={getColor(entry.tradeCount)} /> /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/embed/components/time-in-position.tsx:50:25 48 | const getColor = (count: number) => `hsl(var(--chart-2) / ${Math.max(0.2, count / maxTradeCount)})` 49 | > 50 | const CustomTooltip = ({ active, payload, label }: any) => { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 51 | if (active && payload && payload.length) { | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 52 | const data = payload[0].payload … | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 76 | return null | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ > 77 | } | ^^^^ The component is created during render here 78 | 79 | return ( 80 | <Card data-chart-surface="modern" className="h-[500px] flex flex-col">

### app/[locale]/embed/components/weekday-pnl.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 48:75 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 81:54 Unexpected any. Specify a different type.

### app/[locale]/teams/actions/stats.ts (2)
- warning [@typescript-eslint/no-explicit-any] 72:17 Unexpected any. Specify a different type.
- warning [complexity] 708:36 Arrow function has a complexity of 11. Maximum allowed is 10.

### app/api/ai/analysis/accounts/route.ts (2)
- warning [@typescript-eslint/no-explicit-any] 167:32 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 190:28 Unexpected any. Specify a different type.

### app/api/ai/chat/route.ts (2)
- warning [@typescript-eslint/no-explicit-any] 132:47 Unexpected any. Specify a different type.
- warning [complexity] 169:8 Async function 'POST' has a complexity of 14. Maximum allowed is 10.

### app/api/ai/chat/tools/get-instrument-performance.ts (2)
- warning [complexity] 43:1 Function 'calculateInstrumentMetrics' has a complexity of 17. Maximum allowed is 10.
- warning [complexity] 189:1 Function 'analyzeInstruments' has a complexity of 15. Maximum allowed is 10.

### app/api/ai/editor/route.ts (2)
- warning [complexity] 81:8 Async function 'POST' has a complexity of 19. Maximum allowed is 10.
- warning [@typescript-eslint/no-explicit-any] 110:33 Unexpected any. Specify a different type.

### app/api/cron/route.ts (2)
- warning [complexity] 27:8 Async function 'GET' has a complexity of 13. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 27:27 'req' is defined but never used.

### app/api/email/weekly-summary/[userid]/actions/user-data.ts (2)
- warning [@typescript-eslint/no-unused-vars] 94:3 'language' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 119:11 'weekday' is assigned a value but never used.

### app/api/og/route.tsx (2)
- warning [complexity] 7:1 Function 'hslToHex' has a complexity of 13. Maximum allowed is 10.
- warning [complexity] 51:8 Async function 'GET' has a complexity of 12. Maximum allowed is 10.

### app/api/team/invite/route.ts (2)
- warning [complexity] 11:8 Async function 'POST' has a complexity of 29. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 159:13 'data' is assigned a value but never used.

### app/api/thor/store/route.ts (2)
- warning [complexity] 81:8 Async function 'POST' has a complexity of 15. Maximum allowed is 10.
- warning [complexity] 170:8 Async function 'GET' has a complexity of 13. Maximum allowed is 10.

### app/api/whop/checkout/route.ts (2)
- warning [complexity] 24:1 Function 'resolvePlanId' has a complexity of 12. Maximum allowed is 10.
- warning [complexity] 52:1 Async function 'handleWhopCheckout' has a complexity of 18. Maximum allowed is 10.

### components/ai-elements/image.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 11:3 'uint8Array' is defined but never used.
- warning [@next/next/no-img-element] 15:3 Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element

### components/emails/support-subscription-error.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 75:7 'userMessage' is assigned a value but never used.
- warning [@typescript-eslint/no-unused-vars] 83:7 'assistantMessage' is assigned a value but never used.

### components/linked-accounts.tsx (2)
- warning [@typescript-eslint/no-explicit-any] 41:36 Unexpected any. Specify a different type.
- warning [react-hooks/exhaustive-deps] 66:6 React Hook useEffect has a missing dependency: 't'. Either include it or remove the dependency array.

### components/referral-button.tsx (2)
- warning [complexity] 42:16 Function 'ReferralButton' has a complexity of 23. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 91:9 'getProgressPercentage' is assigned a value but never used.

### components/SparkChart.tsx (2)
- warning [@typescript-eslint/no-unused-vars] 46:3 'data' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 47:3 'index' is defined but never used.

### components/ui/optimized-table.tsx (2)
- warning [react-hooks/incompatible-library] 40:17 Compilation Skipped: Use of incompatible library This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized. /Users/timon/Downloads/final-qunt-edge-main/components/ui/optimized-table.tsx:40:17 38 | const [containerHeight, setContainerHeight] = useState(maxHeight) 39 | > 40 | const table = useReactTable({ | ^^^^^^^^^^^^^ TanStack Table's `useReactTable()` API returns functions that cannot be memoized safely 41 | data, 42 | columns, 43 | getCoreRowModel: getCoreRowModel(),
- warning [@typescript-eslint/no-unused-vars] 93:7 'accumulatedHeight' is assigned a value but never used.

### components/ui/unified-sidebar.tsx (2)
- warning [complexity] 91:40 Arrow function has a complexity of 19. Maximum allowed is 10.
- warning [complexity] 130:8 Function 'UnifiedSidebar' has a complexity of 15. Maximum allowed is 10.

### lib/__tests__/behavior-insights-confidence.test.ts (2)
- warning [@typescript-eslint/no-explicit-any] 31:8 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 52:8 Unexpected any. Specify a different type.

### lib/account-metrics.ts (2)
- warning [complexity] 65:8 Function 'computeAccountMetrics' has a complexity of 52. Maximum allowed is 10.
- warning [@typescript-eslint/no-unused-vars] 197:65 '_' is defined but never used.

### lib/performance/dom-optimization.ts (2)
- warning [react-hooks/exhaustive-deps] 102:20 The ref value 'optimizerRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'optimizerRef.current' to a variable inside the effect, and use that variable in the cleanup function.
- warning [@typescript-eslint/no-unused-vars] 139:11 'rect' is assigned a value but never used.

### lib/widget-migration-service.ts (2)
- warning [@typescript-eslint/no-explicit-any] 44:23 Unexpected any. Specify a different type.
- warning [@typescript-eslint/no-explicit-any] 209:33 Unexpected any. Specify a different type.

### scripts/analyze-components.js (2)
- warning [@typescript-eslint/no-require-imports] 2:12 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 3:14 A `require()` style import is forbidden.

### scripts/codemods/add-policy-evaluation.js (2)
- warning [@typescript-eslint/no-require-imports] 1:12 A `require()` style import is forbidden.
- warning [@typescript-eslint/no-require-imports] 2:14 A `require()` style import is forbidden.

### scripts/test-db-connection.ts (2)
- warning [@typescript-eslint/no-unused-vars] 2:10 'PrismaClient' is defined but never used.
- warning [@typescript-eslint/no-unused-vars] 3:10 'PrismaPg' is defined but never used.

### .github/scripts/check-manifests.js (1)
- warning [complexity] 20:1 Function 'checkManifests' has a complexity of 21. Maximum allowed is 10.

### app/[locale]/(landing)/_updates/[slug]/page.tsx (1)
- warning [complexity] 132:16 Async function 'Page' has a complexity of 12. Maximum allowed is 10.

### app/[locale]/(landing)/community/components/comment-section.tsx (1)
- warning [complexity] 36:1 Function 'CommentComponent' has a complexity of 12. Maximum allowed is 10.

### app/[locale]/(landing)/community/components/post-card.tsx (1)
- warning [complexity] 74:8 Function 'PostCard' has a complexity of 12. Maximum allowed is 10.

### app/[locale]/(landing)/components/card-showcase.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 10:68 'CheckCircle2' is defined but never used.

### app/[locale]/(landing)/components/chat-feature.tsx (1)
- warning [@typescript-eslint/no-explicit-any] 122:37 Unexpected any. Specify a different type.

### app/[locale]/(landing)/components/hero.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 10:32 'onStart' is defined but never used.

### app/[locale]/(landing)/components/problem-statement.tsx (1)
- warning [react/no-unescaped-entities] 26:75 `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.

### app/[locale]/(landing)/propfirms/actions/timeframe-utils.ts (1)
- warning [@typescript-eslint/no-unused-vars] 10:9 'startOfToday' is assigned a value but never used.

### app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx (1)
- warning [complexity] 75:8 Function 'AccountsBarChart' has a complexity of 11. Maximum allowed is 10.

### app/[locale]/(landing)/types/gtag.d.ts (1)
- warning [@typescript-eslint/no-explicit-any] 9:14 Unexpected any. Specify a different type.

### app/[locale]/admin/actions/generate-newsletter.ts (1)
- warning [@typescript-eslint/no-unused-vars] 19:51 'youtubeUrl' is defined but never used.

### app/[locale]/admin/components/dashboard/free-users-table.tsx (1)
- warning [complexity] 41:34 Arrow function has a complexity of 16. Maximum allowed is 10.

### app/[locale]/admin/components/newsletter/newsletter-editor.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 12:29 'Upload' is defined but never used.

### app/[locale]/admin/components/newsletter/newsletter-transcription.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 34:9 't' is assigned a value but never used.

### app/[locale]/admin/components/payments/transactions-table.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 45:18 'error' is defined but never used.

### app/[locale]/admin/components/weekly-stats/weekly-recap-context.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 5:10 'prisma' is defined but never used.

### app/[locale]/admin/layout.tsx (1)
- warning [react-hooks/exhaustive-deps] 37:6 React Hook useEffect has a missing dependency: 'locale'. Either include it or remove the dependency array.

### app/[locale]/admin/utils/youtube.ts (1)
- warning [complexity] 41:8 Async function 'generateBasePrompt' has a complexity of 16. Maximum allowed is 10.

### app/[locale]/dashboard/actions/get-smart-insights.ts (1)
- warning [complexity] 37:8 Async function 'getSmartInsights' has a complexity of 15. Maximum allowed is 10.

### app/[locale]/dashboard/components/accounts/account-card.tsx (1)
- warning [complexity] 18:8 Function 'AccountCard' has a complexity of 75. Maximum allowed is 10.

### app/[locale]/dashboard/components/add-widget-sheet.tsx (1)
- warning [@typescript-eslint/no-explicit-any] 28:11 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/calendar/daily-mood.tsx (1)
- warning [complexity] 27:8 Function 'DailyMood' has a complexity of 24. Maximum allowed is 10.

### app/[locale]/dashboard/components/calendar/weekly-calendar.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 17:10 'useUserStore' is defined but never used.

### app/[locale]/dashboard/components/charts/trade-distribution.tsx (1)
- warning [@typescript-eslint/no-explicit-any] 178:56 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/daily-summary-modal.tsx (1)
- warning [complexity] 31:8 Function 'DailySummaryModal' has a complexity of 27. Maximum allowed is 10.

### app/[locale]/dashboard/components/filters/account-coin.tsx (1)
- warning [complexity] 44:8 Function 'AccountCoin' has a complexity of 22. Maximum allowed is 10.

### app/[locale]/dashboard/components/filters/account-group.tsx (1)
- warning [complexity] 35:8 Function 'AccountGroup' has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/components/filters/active-filter-tags.tsx (1)
- warning [complexity] 14:8 Function 'ActiveFilterTags' has a complexity of 34. Maximum allowed is 10.

### app/[locale]/dashboard/components/filters/filter-selection.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 20:121 'anonymizeAccount' is defined but never used.

### app/[locale]/dashboard/components/filters/filters.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 36:10 'searchTerm' is assigned a value but never used.

### app/[locale]/dashboard/components/filters/instrument-filter.tsx (1)
- warning [react-hooks/set-state-in-effect] 22:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/filters/instrument-filter.tsx:22:7 20 | if (trades && trades.length > 0) { 21 | const uniqueInstruments = Array.from(new Set(trades.map(trade => trade.instrument || ''))) > 22 | setAvailableInstruments(uniqueInstruments) | ^^^^^^^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 23 | } 24 | }, [trades]) 25 |

### app/[locale]/dashboard/components/filters/pnl-filter-simple.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 15:35 'className' is defined but never used.

### app/[locale]/dashboard/components/filters/pnl-filter.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 12:11 'pnlRange' is assigned a value but never used.

### app/[locale]/dashboard/components/import/components/platform-item.tsx (1)
- warning [complexity] 20:8 Function 'PlatformItem' has a complexity of 17. Maximum allowed is 10.

### app/[locale]/dashboard/components/mindset/news-impact.tsx (1)
- warning [react-hooks/set-state-in-effect] 39:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/mindset/news-impact.tsx:39:5 37 | return eventDate.toDateString() === date.toDateString() && event.lang === locale 38 | }) > 39 | setEvents(dateEvents) | ^^^^^^^^^ Avoid calling setState() directly within an effect 40 | setIsLoading(false) 41 | }, [date, financialEvents, locale]) 42 |

### app/[locale]/dashboard/components/mindset/timeline.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 67:14 'error' is defined but never used.

### app/[locale]/dashboard/components/navbar.tsx (1)
- warning [complexity] 27:16 Function 'Navbar' has a complexity of 12. Maximum allowed is 10.

### app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx (1)
- warning [complexity] 17:16 Function 'CumulativePnlCard' has a complexity of 19. Maximum allowed is 10.

### app/[locale]/dashboard/components/statistics/profit-factor-card.tsx (1)
- warning [complexity] 17:16 Function 'ProfitFactorCard' has a complexity of 11. Maximum allowed is 10.

### app/[locale]/dashboard/components/tables/editable-time-cell.tsx (1)
- warning [@typescript-eslint/no-explicit-any] 18:43 Unexpected any. Specify a different type.

### app/[locale]/dashboard/components/user-menu.tsx (1)
- warning [complexity] 59:16 Function 'UserMenu' has a complexity of 18. Maximum allowed is 10.

### app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx (1)
- warning [complexity] 12:16 Function 'RiskMetricsWidget' has a complexity of 15. Maximum allowed is 10.

### app/[locale]/dashboard/dashboard-context-auto-save.tsx (1)
- warning [complexity] 14:95 Arrow function has a complexity of 15. Maximum allowed is 10.

### app/[locale]/dashboard/dashboard-context.tsx (1)
- warning [complexity] 14:95 Arrow function has a complexity of 15. Maximum allowed is 10.

### app/[locale]/embed/components/pnl-time-bar-chart.tsx (1)
- warning [@typescript-eslint/no-explicit-any] 73:54 Unexpected any. Specify a different type.

### app/[locale]/embed/theme.ts (1)
- warning [prefer-const] 115:21 'l' is never reassigned. Use 'const' instead.

### app/[locale]/shared/[slug]/layout.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 4:10 'ReactNode' is defined but never used.

### app/[locale]/shared/[slug]/shared-widget-canvas.tsx (1)
- warning [complexity] 14:88 Arrow function has a complexity of 15. Maximum allowed is 10.

### app/[locale]/teams/actions/analytics.ts (1)
- warning [complexity] 16:8 Async function 'getTeamAnalyticsDataAction' has a complexity of 28. Maximum allowed is 10.

### app/[locale]/teams/components/team-subscription-badge-client.tsx (1)
- warning [complexity] 75:30 Arrow function has a complexity of 19. Maximum allowed is 10.

### app/[locale]/teams/components/team-subscription-badge.tsx (1)
- warning [complexity] 73:30 Arrow function has a complexity of 19. Maximum allowed is 10.

### app/[locale]/teams/components/teams-sidebar.tsx (1)
- warning [complexity] 8:8 Function 'TeamsSidebar' has a complexity of 15. Maximum allowed is 10.

### app/[locale]/teams/dashboard/[slug]/analytics/page.tsx (1)
- warning [complexity] 170:30 Arrow function has a complexity of 17. Maximum allowed is 10.

### app/[locale]/teams/dashboard/trader/[slug]/page.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 2:8 'WidgetCanvas' is defined but never used.

### app/api/admin/subscriptions/route.ts (1)
- warning [complexity] 119:8 Async function 'PATCH' has a complexity of 12. Maximum allowed is 10.

### app/api/ai/analysis/accounts/generate-analysis-component.ts (1)
- warning [complexity] 23:3 Async method 'execute' has a complexity of 19. Maximum allowed is 10.

### app/api/ai/analysis/accounts/get-account-performance.ts (1)
- warning [complexity] 47:1 Function 'calculateAccountMetrics' has a complexity of 23. Maximum allowed is 10.

### app/api/ai/analysis/global/route.ts (1)
- warning [complexity] 79:8 Async function 'POST' has a complexity of 12. Maximum allowed is 10.

### app/api/ai/analysis/instrument/route.ts (1)
- warning [complexity] 78:8 Async function 'POST' has a complexity of 12. Maximum allowed is 10.

### app/api/ai/analysis/time-of-day/route.ts (1)
- warning [complexity] 83:8 Async function 'POST' has a complexity of 12. Maximum allowed is 10.

### app/api/ai/chat/tools/generate-equity-chart.ts (1)
- warning [@typescript-eslint/no-explicit-any] 83:39 Unexpected any. Specify a different type.

### app/api/ai/chat/tools/get-overall-performance-metrics.ts (1)
- warning [complexity] 28:1 Function 'calculateOverallMetrics' has a complexity of 16. Maximum allowed is 10.

### app/api/ai/chat/tools/get-performance-trends.ts (1)
- warning [complexity] 58:1 Function 'analyzeTrends' has a complexity of 13. Maximum allowed is 10.

### app/api/ai/chat/tools/get-time-of-day-performance.ts (1)
- warning [complexity] 88:1 Function 'analyzeTimeOfDay' has a complexity of 18. Maximum allowed is 10.

### app/api/ai/chat/tools/get-trades-details.ts (1)
- warning [complexity] 15:5 Async method 'execute' has a complexity of 12. Maximum allowed is 10.

### app/api/ai/format-trades/route.ts (1)
- warning [complexity] 21:8 Async function 'POST' has a complexity of 19. Maximum allowed is 10.

### app/api/ai/search/date/route.ts (1)
- warning [complexity] 26:8 Async function 'POST' has a complexity of 17. Maximum allowed is 10.

### app/api/ai/support/route.ts (1)
- warning [complexity] 31:8 Async function 'POST' has a complexity of 24. Maximum allowed is 10.

### app/api/ai/transcribe/route.ts (1)
- warning [complexity] 21:8 Async function 'POST' has a complexity of 14. Maximum allowed is 10.

### app/api/auth/callback/route.ts (1)
- warning [complexity] 15:8 Async function 'GET' has a complexity of 30. Maximum allowed is 10.

### app/api/cron/investing/route.ts (1)
- warning [complexity] 40:1 Async function 'fetchInvestingCalendarEvents' has a complexity of 38. Maximum allowed is 10.

### app/api/cron/renewal-notice/route.ts (1)
- warning [complexity] 19:8 Async function 'GET' has a complexity of 15. Maximum allowed is 10.

### app/api/email/format-name/route.ts (1)
- warning [complexity] 40:8 Async function 'POST' has a complexity of 19. Maximum allowed is 10.

### app/api/email/welcome/route.ts (1)
- warning [complexity] 47:14 Async arrow function has a complexity of 21. Maximum allowed is 10.

### app/api/imports/ibkr/ocr/route.ts (1)
- warning [complexity] 99:8 Async function 'POST' has a complexity of 19. Maximum allowed is 10.

### app/api/referral/route.ts (1)
- warning [@typescript-eslint/no-unused-vars] 17:27 '_req' is defined but never used.

### app/api/route.ts (1)
- warning [@typescript-eslint/no-unused-vars] 5:27 'request' is defined but never used.

### app/api/trader-profile/benchmark/route.ts (1)
- warning [complexity] 36:1 Async function 'computeBenchmarkSnapshot' has a complexity of 11. Maximum allowed is 10.

### app/api/tradovate/sync/route.ts (1)
- warning [complexity] 17:8 Async function 'POST' has a complexity of 15. Maximum allowed is 10.

### app/icon.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 1:10 'Logo' is defined but never used.

### components/ai-activated.tsx (1)
- warning [react-hooks/set-state-in-effect] 19:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/components/ai-activated.tsx:19:7 17 | useEffect(() => { 18 | if (success && !hasSeenSuccess) { > 19 | setHasSeenSuccess(true) | ^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 20 | } 21 | }, [success, hasSeenSuccess]) 22 |

### components/ai-elements/branch.tsx (1)
- warning [react-hooks/exhaustive-deps] 85:9 The 'childrenArray' conditional could make the dependencies of useEffect Hook (at line 92) change on every render. To fix this, wrap the initialization of 'childrenArray' in its own useMemo() Hook.

### components/ai-elements/inline-citation.tsx (1)
- warning [react-hooks/set-state-in-effect] 166:5 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/components/ai-elements/inline-citation.tsx:166:5 164 | } 165 | > 166 | setCount(api.scrollSnapList().length); | ^^^^^^^^ Avoid calling setState() directly within an effect 167 | setCurrent(api.selectedScrollSnap() + 1); 168 | 169 | api.on("select", () => {

### components/ai-elements/prompt-input.tsx (1)
- warning [@next/next/no-img-element] 94:9 Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element

### components/ai-elements/reasoning.tsx (1)
- warning [react-hooks/set-state-in-effect] 71:11 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/components/ai-elements/reasoning.tsx:71:11 69 | if (isStreaming) { 70 | if (startTime === null) { > 71 | setStartTime(Date.now()); | ^^^^^^^^^^^^ Avoid calling setState() directly within an effect 72 | } 73 | } else if (startTime !== null) { 74 | setDuration(Math.ceil((Date.now() - startTime) / MS_IN_S));

### components/emails/renewal-notice.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 89:3 'userEmail' is defined but never used.

### components/magicui/animated-beam.tsx (1)
- warning [complexity] 46:4 Arrow function has a complexity of 15. Maximum allowed is 10.

### components/pricing-plans.tsx (1)
- warning [complexity] 515:18 Arrow function has a complexity of 14. Maximum allowed is 10.

### components/sidebar/aimodel-sidebar.tsx (1)
- warning [complexity] 62:60 Arrow function has a complexity of 11. Maximum allowed is 10.

### components/tiptap/optimized-bubble-menu.tsx (1)
- warning [complexity] 27:5 Method 'selector' has a complexity of 17. Maximum allowed is 10.

### components/ui/card.tsx (1)
- warning [complexity] 29:5 Arrow function has a complexity of 16. Maximum allowed is 10.

### components/ui/chart-surface.tsx (1)
- warning [complexity] 25:8 Function 'ChartSurface' has a complexity of 18. Maximum allowed is 10.

### components/ui/column-config-dialog.tsx (1)
- warning [@typescript-eslint/no-unused-vars] 16:31 'TableColumnConfig' is defined but never used.

### components/ui/optimized-input.tsx (1)
- warning [react-hooks/set-state-in-effect] 19:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/components/ui/optimized-input.tsx:19:7 17 | 18 | useEffect(() => { > 19 | setLocalValue(props.value || props.defaultValue || '') | ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect 20 | }, [props.value, props.defaultValue]) 21 | 22 | const debouncedOnChange = useDebouncedCallback((value: string) => {

### components/ui/sidebar.tsx (1)
- warning [complexity] 217:5 Arrow function has a complexity of 12. Maximum allowed is 10.

### components/ui/stats-card.tsx (1)
- warning [complexity] 32:11 Arrow function has a complexity of 13. Maximum allowed is 10.

### components/ui/widget-shell.tsx (1)
- warning [complexity] 34:8 Function 'WidgetShell' has a complexity of 16. Maximum allowed is 10.

### hooks/use-navigation-loading.tsx (1)
- warning [react-hooks/set-state-in-effect] 18:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-navigation-loading.tsx:18:7 16 | useEffect(() => { 17 | if (pathname !== lastPath) { > 18 | setIsLoading(false) | ^^^^^^^^^^^^ Avoid calling setState() directly within an effect 19 | setLastPath(pathname) 20 | } 21 | }, [pathname, lastPath])

### hooks/use-sidebar-scroll.ts (1)
- warning [react-hooks/set-state-in-effect] 11:7 Error: Calling setState synchronously within an effect can trigger cascading renders Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following: * Update external systems with the latest state from React. * Subscribe for updates from some external system, calling setState in a callback function when external state changes. Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect). /Users/timon/Downloads/final-qunt-edge-main/hooks/use-sidebar-scroll.ts:11:7 9 | useEffect(() => { 10 | if (!isMobile && !isOpen && scrollRef.current) { > 11 | setScrollTop(scrollRef.current.scrollTop || 0) | ^^^^^^^^^^^^ Avoid calling setState() directly within an effect 12 | } 13 | }, [isOpen, isMobile]) 14 |

### lib/__tests__/team-accept-invitation-route.test.ts (1)
- warning [@typescript-eslint/no-explicit-any] 68:56 Unexpected any. Specify a different type.

### lib/ai/get-all-trades.ts (1)
- warning [complexity] 25:8 Async function 'getAllTradesForAi' has a complexity of 11. Maximum allowed is 10.

### lib/analytics/metrics-v1.ts (1)
- warning [complexity] 59:8 Function 'calculateRiskMetricsV1' has a complexity of 18. Maximum allowed is 10.

### lib/behavior-insights.ts (1)
- warning [complexity] 123:8 Function 'computeBehaviorInsights' has a complexity of 31. Maximum allowed is 10.

### lib/browser-sandbox.ts (1)
- warning [complexity] 141:8 Async function 'scrapeWithSandbox' has a complexity of 23. Maximum allowed is 10.

### lib/chart-colors.ts (1)
- warning [@typescript-eslint/no-unused-vars] 1:10 'getChartColor' is defined but never used.

### lib/color-tokens.ts (1)
- warning [@typescript-eslint/no-unused-vars] 89:32 'blur' is assigned a value but never used.

### lib/contrast-validator.ts (1)
- warning [@typescript-eslint/no-unused-vars] 1:34 'checkContrast' is defined but never used.

### lib/data-types.ts (1)
- warning [complexity] 274:8 Function 'normalizeAccountForClient' has a complexity of 26. Maximum allowed is 10.

### lib/debug/performance-monitor.ts (1)
- warning [@typescript-eslint/no-explicit-any] 77:30 Unexpected any. Specify a different type.

### lib/performance/performance-measurement.ts (1)
- warning [@typescript-eslint/no-explicit-any] 94:30 Unexpected any. Specify a different type.

### lib/prisma.ts (1)
- warning [complexity] 90:70 Arrow function has a complexity of 11. Maximum allowed is 10.

### lib/query-optimizer.ts (1)
- warning [complexity] 202:1 Async function 'runLocalRedisCommand' has a complexity of 12. Maximum allowed is 10.

### lib/rate-limit.ts (1)
- warning [complexity] 64:1 Async function 'incrementUpstash' has a complexity of 13. Maximum allowed is 10.

### lib/redis-cache.ts (1)
- warning [complexity] 198:1 Async function 'runLocalRedisCommand' has a complexity of 12. Maximum allowed is 10.

### lib/rithmic-storage.ts (1)
- warning [@typescript-eslint/no-explicit-any] 43:44 Unexpected any. Specify a different type.

### lib/tick-calculations.ts (1)
- warning [@typescript-eslint/no-explicit-any] 75:17 Unexpected any. Specify a different type.

### lib/trade-factory.ts (1)
- warning [complexity] 9:8 Function 'createTradeWithDefaults' has a complexity of 24. Maximum allowed is 10.

### lib/webhook-idempotency.ts (1)
- warning [@typescript-eslint/no-explicit-any] 19:29 Unexpected any. Specify a different type.

### lib/widget-conflict-resolution.ts (1)
- warning [@typescript-eslint/no-unused-vars] 172:18 'layout' is defined but never used.

### lib/widget-policy-engine/__tests__/policy-engine.test.ts (1)
- warning [@typescript-eslint/no-unused-vars] 1:44 'vi' is defined but never used.

### lib/widget-policy-engine/policy-engine.ts (1)
- warning [complexity] 127:3 Method 'validatePolicyManifest' has a complexity of 15. Maximum allowed is 10.

### lib/widget-policy-engine/risk-calculator.ts (1)
- warning [@typescript-eslint/no-unused-vars] 46:5 'manifest' is defined but never used.

### lib/widget-storage-service.ts (1)
- warning [@typescript-eslint/no-explicit-any] 37:50 Unexpected any. Specify a different type.

### scripts/loadtest/k6-smoke.js (1)
- warning [import/no-anonymous-default-export] 89:1 Unexpected default export of anonymous function

### scripts/perf-lighthouse.mjs (1)
- warning [complexity] 48:1 Function 'evaluate' has a complexity of 21. Maximum allowed is 10.

### scripts/smoke-http.mjs (1)
- warning [complexity] 64:1 Async function 'run' has a complexity of 16. Maximum allowed is 10.

### server/authz.ts (1)
- warning [complexity] 135:8 Function 'requireServiceAuth' has a complexity of 13. Maximum allowed is 10.

### server/financial-events.ts (1)
- warning [@typescript-eslint/no-unused-vars] 5:10 'format' is defined but never used.

### server/layouts.ts (1)
- warning [@typescript-eslint/no-explicit-any] 47:26 Unexpected any. Specify a different type.

### server/storage.ts (1)
- warning [complexity] 25:8 Async function 'listStorageObjects' has a complexity of 11. Maximum allowed is 10.

### server/subscription.ts (1)
- warning [complexity] 21:8 Async function 'getSubscriptionDetails' has a complexity of 13. Maximum allowed is 10.

### store/auth-preference-store.ts (1)
- warning [@typescript-eslint/no-unused-vars] 25:42 'version' is defined but never used.

### tests/e2e/auth.spec.ts (1)
- warning [@typescript-eslint/no-unused-vars] 18:30 'page' is defined but never used.

### tests/lib/unsubscribe-token.test.ts (1)
- warning [@typescript-eslint/no-unused-vars] 43:12 'payload' is assigned a value but never used.
