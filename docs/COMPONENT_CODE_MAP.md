# Component Code Map

This is the end-to-end component inventory for the project.
Format: `Component/File` | `Function` | `Use Case` | `File ID`

## App Locale Components

| Component/File | Function | Use Case | File ID |
|---|---|---|---|
| `page` | Route page entry | First screen for route | `app/[locale]/(authentication)/authentication/page.tsx` |
| `user-auth-form` | Auth component | Login/signup and auth interactions | `app/[locale]/(authentication)/components/user-auth-form.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/(authentication)/layout.tsx` |
| `AnalysisDemo` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/AnalysisDemo.tsx` |
| `CTA` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/CTA.tsx` |
| `DeferredHomeSections` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/DeferredHomeSections.tsx` |
| `Differentiators` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/Differentiators.tsx` |
| `Features` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/Features.tsx` |
| `Footer` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/Footer.tsx` |
| `Hero` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/Hero.tsx` |
| `HomeContent` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/HomeContent.tsx` |
| `HowItWorks` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/HowItWorks.tsx` |
| `Navigation` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/Navigation.tsx` |
| `ProblemStatement` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/ProblemStatement.tsx` |
| `Qualification` | Home component | Homepage narrative and CTA flow | `app/[locale]/(home)/components/Qualification.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/(home)/layout.tsx` |
| `loading` | Route loading state | Skeleton/loading UX during fetch | `app/[locale]/(home)/loading.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(home)/page.tsx` |
| `opengraph-image` | OG image renderer | Social preview image generation | `app/[locale]/(landing)/_updates/[slug]/opengraph-image.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/_updates/[slug]/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/_updates/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/about/page.tsx` |
| `auth-prompt` | UI component | Render feature-specific interface | `app/[locale]/(landing)/community/components/auth-prompt.tsx` |
| `comment-section` | UI component | Render feature-specific interface | `app/[locale]/(landing)/community/components/comment-section.tsx` |
| `copy-notification` | UI component | Render feature-specific interface | `app/[locale]/(landing)/community/components/copy-notification.tsx` |
| `create-post` | UI component | Render feature-specific interface | `app/[locale]/(landing)/community/components/create-post.tsx` |
| `post-card` | UI component | Render feature-specific interface | `app/[locale]/(landing)/community/components/post-card.tsx` |
| `post-list` | UI component | Render feature-specific interface | `app/[locale]/(landing)/community/components/post-list.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/community/page.tsx` |
| `loading` | Route loading state | Skeleton/loading UX during fetch | `app/[locale]/(landing)/community/post/[id]/loading.tsx` |
| `not-found` | UI component | Render feature-specific interface | `app/[locale]/(landing)/community/post/[id]/not-found.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/community/post/[id]/page.tsx` |
| `ai-feature` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/ai-feature.tsx` |
| `calendar-preview` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/calendar-preview.tsx` |
| `card-showcase` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/card-showcase.tsx` |
| `chat-feature` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/chat-feature.tsx` |
| `completed-timeline` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/completed-timeline.tsx` |
| `faq` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/faq.tsx` |
| `features` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/features.tsx` |
| `footer` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/footer.tsx` |
| `hero` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/hero.tsx` |
| `how-it-works` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/how-it-works.tsx` |
| `import-feature` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/import-feature.tsx` |
| `marketing-layout-shell` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/marketing-layout-shell.tsx` |
| `navbar` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/navbar.tsx` |
| `partners` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/partners.tsx` |
| `performance-visualization-chart` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/performance-visualization-chart.tsx` |
| `pnl-per-contract-preview` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/pnl-per-contract-preview.tsx` |
| `problem-statement` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/problem-statement.tsx` |
| `qualification` | Marketing component | Public landing content and conversion flow | `app/[locale]/(landing)/components/qualification.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/disclaimers/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/docs/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/faq/page.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/(landing)/layout.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/maintenance/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/newsletter/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/pricing/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/privacy/page.tsx` |
| `accounts-bar-chart` | UI component | Render feature-specific interface | `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx` |
| `sort-controls` | UI component | Render feature-specific interface | `app/[locale]/(landing)/propfirms/components/sort-controls.tsx` |
| `timeframe-controls` | UI component | Render feature-specific interface | `app/[locale]/(landing)/propfirms/components/timeframe-controls.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/propfirms/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/referral/page.tsx` |
| `support-form` | UI component | Render feature-specific interface | `app/[locale]/(landing)/support/components/support-form.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/support/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/terms/page.tsx` |
| `opengraph-image` | OG image renderer | Social preview image generation | `app/[locale]/(landing)/updates/[slug]/opengraph-image.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/updates/[slug]/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/(landing)/updates/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/[...not-found]/page.tsx` |
| `admin-dashboard` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/dashboard/admin-dashboard.tsx` |
| `free-users-table` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/dashboard/free-users-table.tsx` |
| `user-growth-chart` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/dashboard/user-growth-chart.tsx` |
| `newsletter-audio-extractor` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/newsletter-audio-extractor.tsx` |
| `newsletter-audio-player` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/newsletter-audio-player.tsx` |
| `newsletter-audio-splitter` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/newsletter-audio-splitter.tsx` |
| `newsletter-context` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/newsletter-context.tsx` |
| `newsletter-editor` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/newsletter-editor.tsx` |
| `newsletter-preview` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/newsletter-preview.tsx` |
| `newsletter-transcription` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/newsletter-transcription.tsx` |
| `subscriber-table` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/newsletter/subscriber-table.tsx` |
| `subscriptions-table` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/payments/subscriptions-table.tsx` |
| `transactions-table` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/payments/transactions-table.tsx` |
| `email-preview` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/send-email/email-preview.tsx` |
| `email-template-selector` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/send-email/email-template-selector.tsx` |
| `send-email-page-client` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/send-email/send-email-page-client.tsx` |
| `user-selector` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/send-email/user-selector.tsx` |
| `sidebar-nav` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/sidebar-nav.tsx` |
| `theme-switcher` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/theme-switcher.tsx` |
| `email-preview-loading` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/weekly-stats/email-preview-loading.tsx` |
| `weekly-recap-context` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/weekly-stats/weekly-recap-context.tsx` |
| `weekly-recap-preview` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/weekly-stats/weekly-recap-preview.tsx` |
| `welcome-email-context` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/welcome-email/welcome-email-context.tsx` |
| `welcome-email-preview` | Admin panel component | Operations, messaging, reporting, or billing admin UX | `app/[locale]/admin/components/welcome-email/welcome-email-preview.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/admin/layout.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/admin/newsletter-builder/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/admin/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/admin/send-email/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/admin/weekly-recap/page.tsx` |
| `loading` | Route loading state | Skeleton/loading UX during fetch | `app/[locale]/admin/welcome-email/loading.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/admin/welcome-email/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/behavior/page.tsx` |
| `billing-management` | UI component | Render feature-specific interface | `app/[locale]/dashboard/billing/components/billing-management.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/billing/page.tsx` |
| `account-card` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/account-card.tsx` |
| `account-configurator` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/account-configurator.tsx` |
| `account-table` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/account-table.tsx` |
| `accounts-overview` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/accounts-overview.tsx` |
| `accounts-table-view` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/accounts-table-view.tsx` |
| `propfirms-comparison-table` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx` |
| `suggestion-input` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/suggestion-input.tsx` |
| `trade-progress-chart` | Account analytics component | Account-level performance and config | `app/[locale]/dashboard/components/accounts/trade-progress-chart.tsx` |
| `add-widget-sheet` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/add-widget-sheet.tsx` |
| `accounts-analysis` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/analysis/accounts-analysis.tsx` |
| `analysis-overview` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/analysis/analysis-overview.tsx` |
| `analysis-skeleton` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/analysis/analysis-skeleton.tsx` |
| `calendar-widget` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/calendar-widget.tsx` |
| `charts` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/charts.tsx` |
| `daily-comment` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/daily-comment.tsx` |
| `daily-modal` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/daily-modal.tsx` |
| `daily-mood` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/daily-mood.tsx` |
| `daily-stats` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/daily-stats.tsx` |
| `desktop-calendar` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/desktop-calendar.tsx` |
| `mobile-calendar` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/mobile-calendar.tsx` |
| `mood-selector` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/mood-selector.tsx` |
| `weekly-calendar` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/weekly-calendar.tsx` |
| `weekly-modal` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/calendar/weekly-modal.tsx` |
| `chart-the-future-panel` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/chart-the-future-panel.tsx` |
| `account-selection-popover` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/account-selection-popover.tsx` |
| `commissions-pnl` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/commissions-pnl.tsx` |
| `contract-quantity` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/contract-quantity.tsx` |
| `daily-tick-target` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/daily-tick-target.tsx` |
| `equity-chart` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/equity-chart.tsx` |
| `pnl-bar-chart` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx` |
| `pnl-by-side` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/pnl-by-side.tsx` |
| `pnl-per-contract-daily` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx` |
| `pnl-per-contract` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx` |
| `pnl-time-bar-chart` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx` |
| `tick-distribution` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/tick-distribution.tsx` |
| `time-in-position` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/time-in-position.tsx` |
| `time-range-performance` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/time-range-performance.tsx` |
| `trade-distribution` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/trade-distribution.tsx` |
| `weekday-pnl` | Chart widget component | Visualize specific trading metric | `app/[locale]/dashboard/components/charts/weekday-pnl.tsx` |
| `bot-message` | Chat UI component | AI conversation and responses | `app/[locale]/dashboard/components/chat/bot-message.tsx` |
| `chat` | Chat UI component | AI conversation and responses | `app/[locale]/dashboard/components/chat/chat.tsx` |
| `equity-chart-message` | Chat UI component | AI conversation and responses | `app/[locale]/dashboard/components/chat/equity-chart-message.tsx` |
| `header` | Chat UI component | AI conversation and responses | `app/[locale]/dashboard/components/chat/header.tsx` |
| `input` | Chat UI component | AI conversation and responses | `app/[locale]/dashboard/components/chat/input.tsx` |
| `user-message` | Chat UI component | AI conversation and responses | `app/[locale]/dashboard/components/chat/user-message.tsx` |
| `daily-summary-modal` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/daily-summary-modal.tsx` |
| `dashboard-header` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/dashboard-header.tsx` |
| `account-coin` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/account-coin.tsx` |
| `account-filter` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/account-filter.tsx` |
| `account-group-board` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/account-group-board.tsx` |
| `account-group` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/account-group.tsx` |
| `active-filter-tags` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/active-filter-tags.tsx` |
| `filter-command-menu-account-section` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-command-menu-account-section.tsx` |
| `filter-command-menu-date-section` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx` |
| `filter-command-menu-instrument-section` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-command-menu-instrument-section.tsx` |
| `filter-command-menu-pnl-section` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-command-menu-pnl-section.tsx` |
| `filter-command-menu-tag-section` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-command-menu-tag-section.tsx` |
| `filter-command-menu` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-command-menu.tsx` |
| `filter-dropdown` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-dropdown.tsx` |
| `filter-dropdowns` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-dropdowns.tsx` |
| `filter-selection` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filter-selection.tsx` |
| `filters` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/filters.tsx` |
| `instrument-filter-simple` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/instrument-filter-simple.tsx` |
| `instrument-filter` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/instrument-filter.tsx` |
| `pnl-filter-simple` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/pnl-filter-simple.tsx` |
| `pnl-filter` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/pnl-filter.tsx` |
| `pnl-range-filter` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/pnl-range-filter.tsx` |
| `tag-filter` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/tag-filter.tsx` |
| `tag-widget` | Filter system component | Constrain dashboard datasets by criteria | `app/[locale]/dashboard/components/filters/tag-widget.tsx` |
| `global-sync-button` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/global-sync-button.tsx` |
| `account-selection` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/account-selection.tsx` |
| `atas-file-upload` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx` |
| `atas-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/atas/atas-processor.tsx` |
| `column-mapping` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/column-mapping.tsx` |
| `format-preview` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/components/format-preview.tsx` |
| `import-dialog-footer` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/components/import-dialog-footer.tsx` |
| `import-dialog-header` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/components/import-dialog-header.tsx` |
| `platform-card` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/components/platform-card.tsx` |
| `platform-item` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/components/platform-item.tsx` |
| `platform-tutorial` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/components/platform-tutorial.tsx` |
| `platforms` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/config/platforms.tsx` |
| `etp-sync` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/etp/etp-sync.tsx` |
| `file-upload` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/file-upload.tsx` |
| `ftmo-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/ftmo/ftmo-processor.tsx` |
| `header-selection` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/header-selection.tsx` |
| `pdf-processing` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/ibkr-pdf/pdf-processing.tsx` |
| `pdf-upload` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/ibkr-pdf/pdf-upload.tsx` |
| `import-button` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/import-button.tsx` |
| `import-type-selection` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/import-type-selection.tsx` |
| `manual-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/manual/manual-processor.tsx` |
| `ninjatrader-performance-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/ninjatrader/ninjatrader-performance-processor.tsx` |
| `quantower-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/quantower/quantower-processor.tsx` |
| `rithmic-order-processor-new` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/rithmic/rithmic-order-processor-new.tsx` |
| `rithmic-performance-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/rithmic/rithmic-performance-processor.tsx` |
| `rithmic-credentials-manager` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-credentials-manager.tsx` |
| `rithmic-notifications` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-notifications.tsx` |
| `rithmic-sync-connection` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-connection.tsx` |
| `rithmic-sync-progress` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-progress.tsx` |
| `sync-countdown` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/rithmic/sync/sync-countdown.tsx` |
| `thor-sync` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/thor/thor-sync.tsx` |
| `topstep-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/topstep/topstep-processor.tsx` |
| `tradezella-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/tradezella/tradezella-processor.tsx` |
| `tradovate-credentials-manager` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/tradovate/tradovate-credentials-manager.tsx` |
| `tradovate-processor` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx` |
| `tradovate-sync` | Import pipeline component | Import, map, parse, or sync trade data | `app/[locale]/dashboard/components/import/tradovate/tradovate-sync.tsx` |
| `importance-filter` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/importance-filter.tsx` |
| `lazy-widget` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/lazy-widget.tsx` |
| `day-tag-selector` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/day-tag-selector.tsx` |
| `emotion-selector` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/emotion-selector.tsx` |
| `hourly-financial-timeline` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/hourly-financial-timeline.tsx` |
| `journaling` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/journaling.tsx` |
| `mindset-summary` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/mindset-summary.tsx` |
| `mindset-widget` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/mindset-widget.tsx` |
| `news-impact` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/news-impact.tsx` |
| `timeline` | Mindset/journal component | Behavioral tracking and journaling | `app/[locale]/dashboard/components/mindset/timeline.tsx` |
| `navbar` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/navbar.tsx` |
| `pnl-summary` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/pnl-summary.tsx` |
| `share-button` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/share-button.tsx` |
| `shared-layouts-manager` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/shared-layouts-manager.tsx` |
| `average-position-time-card` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/average-position-time-card.tsx` |
| `cumulative-pnl-card` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx` |
| `long-short-card` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/long-short-card.tsx` |
| `profit-factor-card` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/profit-factor-card.tsx` |
| `risk-reward-ratio-card` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/risk-reward-ratio-card.tsx` |
| `statistics-widget` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/statistics-widget.tsx` |
| `trade-performance-card` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/trade-performance-card.tsx` |
| `winning-streak-card` | Stat card component | Display compact KPI metric | `app/[locale]/dashboard/components/statistics/winning-streak-card.tsx` |
| `bulk-edit-panel` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/bulk-edit-panel.tsx` |
| `column-header` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/column-header.tsx` |
| `editable-instrument-cell` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx` |
| `editable-time-cell` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/editable-time-cell.tsx` |
| `trade-comment` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/trade-comment.tsx` |
| `trade-image-editor` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/trade-image-editor.tsx` |
| `trade-table-review` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/trade-table-review.tsx` |
| `trade-tag` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/trade-tag.tsx` |
| `trade-video-url` | Trade table subcomponent | Review/edit trade rows and cells | `app/[locale]/dashboard/components/tables/trade-video-url.tsx` |
| `toolbar` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/toolbar.tsx` |
| `top-nav` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/top-nav.tsx` |
| `user-menu` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/user-menu.tsx` |
| `widget-canvas` | UI component | Render feature-specific interface | `app/[locale]/dashboard/components/widget-canvas.tsx` |
| `expectancy-widget` | Specialized dashboard widget | Derived KPI widget in widget canvas | `app/[locale]/dashboard/components/widgets/expectancy-widget.tsx` |
| `risk-metrics-widget` | Specialized dashboard widget | Derived KPI widget in widget canvas | `app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx` |
| `trading-score-widget` | Specialized dashboard widget | Derived KPI widget in widget canvas | `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx` |
| `widget-registry` | UI component | Render feature-specific interface | `app/[locale]/dashboard/config/widget-registry.tsx` |
| `dashboard-context-auto-save` | UI component | Render feature-specific interface | `app/[locale]/dashboard/dashboard-context-auto-save.tsx` |
| `dashboard-context` | UI component | Render feature-specific interface | `app/[locale]/dashboard/dashboard-context.tsx` |
| `account-equity-chart` | UI component | Render feature-specific interface | `app/[locale]/dashboard/data/components/data-management/account-equity-chart.tsx` |
| `data-management-card` | UI component | Render feature-specific interface | `app/[locale]/dashboard/data/components/data-management/data-management-card.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/data/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/import/page.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/dashboard/layout.tsx` |
| `loading` | Route loading state | Skeleton/loading UX during fetch | `app/[locale]/dashboard/loading.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/reports/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/settings/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/strategies/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/dashboard/trader-profile/page.tsx` |
| `commissions-pnl` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/commissions-pnl.tsx` |
| `contract-quantity` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/contract-quantity.tsx` |
| `pnl-bar-chart` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/pnl-bar-chart.tsx` |
| `pnl-by-side` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/pnl-by-side.tsx` |
| `pnl-per-contract-daily` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/pnl-per-contract-daily.tsx` |
| `pnl-per-contract` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/pnl-per-contract.tsx` |
| `pnl-time-bar-chart` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/pnl-time-bar-chart.tsx` |
| `tick-distribution` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/tick-distribution.tsx` |
| `time-in-position` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/time-in-position.tsx` |
| `time-range-performance` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/time-range-performance.tsx` |
| `trade-distribution` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/trade-distribution.tsx` |
| `weekday-pnl` | Embed chart component | Render embeddable analytics chart | `app/[locale]/embed/components/weekday-pnl.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/embed/page.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/layout.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/shared/[slug]/layout.tsx` |
| `opengraph-image` | OG image renderer | Social preview image generation | `app/[locale]/shared/[slug]/opengraph-image.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/shared/[slug]/page.tsx` |
| `shared-page-client` | Shared view component | Read-only shared dashboard rendering | `app/[locale]/shared/[slug]/shared-page-client.tsx` |
| `shared-widget-canvas` | Shared view component | Read-only shared dashboard rendering | `app/[locale]/shared/[slug]/shared-widget-canvas.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/teams/(landing)/layout.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/(landing)/page.tsx` |
| `auth-profile-button-skeleton` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/auth-profile-button-skeleton.tsx` |
| `auth-profile-button` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/auth-profile-button.tsx` |
| `logout-button` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/logout-button.tsx` |
| `team-management` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/team-management.tsx` |
| `team-navbar` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/team-navbar.tsx` |
| `team-subscription-badge-client` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/team-subscription-badge-client.tsx` |
| `team-subscription-badge` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/team-subscription-badge.tsx` |
| `teams-sidebar` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/teams-sidebar.tsx` |
| `theme-switcher` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/theme-switcher.tsx` |
| `trader-info` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/trader-info.tsx` |
| `team-equity-grid-client` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/user-equity/team-equity-grid-client.tsx` |
| `user-equity-chart` | Team workspace component | Team navigation, membership, and analytics views | `app/[locale]/teams/components/user-equity/user-equity-chart.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/dashboard/[slug]/analytics/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/dashboard/[slug]/members/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/dashboard/[slug]/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/dashboard/[slug]/traders/page.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/teams/dashboard/layout.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/dashboard/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/dashboard/trader/[slug]/page.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/join/page.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/teams/layout.tsx` |
| `layout` | Route layout wrapper | Shared shell, providers, or guards | `app/[locale]/teams/manage/layout.tsx` |
| `page` | Route page entry | First screen for route | `app/[locale]/teams/manage/page.tsx` |

## Reusable Components (/components)

| Component/File | Function | Use Case | File ID |
|---|---|---|---|
| `SparkChart` | Reusable UI component | Shared building block across routes | `components/SparkChart.tsx` |
| `ai-activated` | Reusable UI component | Shared building block across routes | `components/ai-activated.tsx` |
| `actions` | AI message/render component | AI output rendering and interaction | `components/ai-elements/actions.tsx` |
| `artifact` | AI message/render component | AI output rendering and interaction | `components/ai-elements/artifact.tsx` |
| `branch` | AI message/render component | AI output rendering and interaction | `components/ai-elements/branch.tsx` |
| `chain-of-thought` | AI message/render component | AI output rendering and interaction | `components/ai-elements/chain-of-thought.tsx` |
| `context` | AI message/render component | AI output rendering and interaction | `components/ai-elements/context.tsx` |
| `conversation` | AI message/render component | AI output rendering and interaction | `components/ai-elements/conversation.tsx` |
| `image` | AI message/render component | AI output rendering and interaction | `components/ai-elements/image.tsx` |
| `inline-citation` | AI message/render component | AI output rendering and interaction | `components/ai-elements/inline-citation.tsx` |
| `loader` | AI message/render component | AI output rendering and interaction | `components/ai-elements/loader.tsx` |
| `message` | AI message/render component | AI output rendering and interaction | `components/ai-elements/message.tsx` |
| `news-sub-menu` | AI message/render component | AI output rendering and interaction | `components/ai-elements/news-sub-menu.tsx` |
| `open-in-chat` | AI message/render component | AI output rendering and interaction | `components/ai-elements/open-in-chat.tsx` |
| `prompt-input` | AI message/render component | AI output rendering and interaction | `components/ai-elements/prompt-input.tsx` |
| `reasoning` | AI message/render component | AI output rendering and interaction | `components/ai-elements/reasoning.tsx` |
| `response-test` | AI message/render component | AI output rendering and interaction | `components/ai-elements/response-test.tsx` |
| `response` | AI message/render component | AI output rendering and interaction | `components/ai-elements/response.tsx` |
| `sources` | AI message/render component | AI output rendering and interaction | `components/ai-elements/sources.tsx` |
| `suggestion` | AI message/render component | AI output rendering and interaction | `components/ai-elements/suggestion.tsx` |
| `task` | AI message/render component | AI output rendering and interaction | `components/ai-elements/task.tsx` |
| `web-preview` | AI message/render component | AI output rendering and interaction | `components/ai-elements/web-preview.tsx` |
| `calendar-days` | Animated icon component | Visual status/feature illustration | `components/animated-icons/calendar-days.tsx` |
| `clipboard-check` | Animated icon component | Visual status/feature illustration | `components/animated-icons/clipboard-check.tsx` |
| `upload` | Animated icon component | Visual status/feature illustration | `components/animated-icons/upload.tsx` |
| `users` | Animated icon component | Visual status/feature illustration | `components/animated-icons/users.tsx` |
| `auth-timeout` | Reusable UI component | Shared building block across routes | `components/auth/auth-timeout.tsx` |
| `consent-banner` | Reusable UI component | Shared building block across routes | `components/consent-banner.tsx` |
| `country-filter` | Reusable UI component | Shared building block across routes | `components/country-filter.tsx` |
| `black-friday` | Email template component | Transactional or campaign email rendering | `components/emails/black-friday.tsx` |
| `comment-notification` | Email template component | Transactional or campaign email rendering | `components/emails/blog/comment-notification.tsx` |
| `missing-data` | Email template component | Transactional or campaign email rendering | `components/emails/missing-data.tsx` |
| `new-feature` | Email template component | Transactional or campaign email rendering | `components/emails/new-feature.tsx` |
| `renewal-notice` | Email template component | Transactional or campaign email rendering | `components/emails/renewal-notice.tsx` |
| `support-request` | Email template component | Transactional or campaign email rendering | `components/emails/support-request.tsx` |
| `support-subscription-error` | Email template component | Transactional or campaign email rendering | `components/emails/support-subscription-error.tsx` |
| `team-invitation` | Email template component | Transactional or campaign email rendering | `components/emails/team-invitation.tsx` |
| `weekly-recap` | Email template component | Transactional or campaign email rendering | `components/emails/weekly-recap.tsx` |
| `welcome` | Email template component | Transactional or campaign email rendering | `components/emails/welcome.tsx` |
| `export-button` | Reusable UI component | Shared building block across routes | `components/export-button.tsx` |
| `icons` | Reusable UI component | Shared building block across routes | `components/icons.tsx` |
| `charts` | Lazy-load wrapper | Performance optimization for deferred components | `components/lazy/charts.tsx` |
| `consent-banner-lazy` | Lazy-load wrapper | Performance optimization for deferred components | `components/lazy/consent-banner-lazy.tsx` |
| `scroll-lock-fix-lazy` | Lazy-load wrapper | Performance optimization for deferred components | `components/lazy/scroll-lock-fix-lazy.tsx` |
| `linked-accounts` | Reusable UI component | Shared building block across routes | `components/linked-accounts.tsx` |
| `logo` | Reusable UI component | Shared building block across routes | `components/logo.tsx` |
| `animated-beam` | Reusable UI component | Shared building block across routes | `components/magicui/animated-beam.tsx` |
| `mdx-sidebar` | Reusable UI component | Shared building block across routes | `components/mdx-sidebar.tsx` |
| `modals` | Reusable UI component | Shared building block across routes | `components/modals.tsx` |
| `onboarding-modal` | Reusable UI component | Shared building block across routes | `components/onboarding-modal.tsx` |
| `pricing-plans` | Reusable UI component | Shared building block across routes | `components/pricing-plans.tsx` |
| `dashboard-providers` | Provider wrapper | Global/dashboard context setup | `components/providers/dashboard-providers.tsx` |
| `root-providers` | Provider wrapper | Global/dashboard context setup | `components/providers/root-providers.tsx` |
| `referral-button` | Reusable UI component | Shared building block across routes | `components/referral-button.tsx` |
| `scroll-lock-fix` | Reusable UI component | Shared building block across routes | `components/scroll-lock-fix.tsx` |
| `aimodel-sidebar` | Sidebar/navigation component | Primary app navigation structures | `components/sidebar/aimodel-sidebar.tsx` |
| `dashboard-sidebar` | Sidebar/navigation component | Primary app navigation structures | `components/sidebar/dashboard-sidebar.tsx` |
| `subscription-badge` | Reusable UI component | Shared building block across routes | `components/subscription-badge.tsx` |
| `theme-switcher` | Reusable UI component | Shared building block across routes | `components/theme-switcher.tsx` |
| `tiptap-editor` | Rich text editor component | Journaling/editor formatting controls | `components/tiptap-editor.tsx` |
| `menu-bar` | Rich text editor component | Journaling/editor formatting controls | `components/tiptap/menu-bar.tsx` |
| `optimized-bubble-menu` | Rich text editor component | Journaling/editor formatting controls | `components/tiptap/optimized-bubble-menu.tsx` |
| `accordion` | UI primitive | Shared design-system control | `components/ui/accordion.tsx` |
| `action-card` | UI primitive | Shared design-system control | `components/ui/action-card.tsx` |
| `alert-dialog` | UI primitive | Shared design-system control | `components/ui/alert-dialog.tsx` |
| `alert` | UI primitive | Shared design-system control | `components/ui/alert.tsx` |
| `avatar` | UI primitive | Shared design-system control | `components/ui/avatar.tsx` |
| `badge` | UI primitive | Shared design-system control | `components/ui/badge.tsx` |
| `button` | UI primitive | Shared design-system control | `components/ui/button.tsx` |
| `calendar` | UI primitive | Shared design-system control | `components/ui/calendar.tsx` |
| `card` | UI primitive | Shared design-system control | `components/ui/card.tsx` |
| `carousel` | UI primitive | Shared design-system control | `components/ui/carousel.tsx` |
| `chart` | UI primitive | Shared design-system control | `components/ui/chart.tsx` |
| `checkbox` | UI primitive | Shared design-system control | `components/ui/checkbox.tsx` |
| `collapsible` | UI primitive | Shared design-system control | `components/ui/collapsible.tsx` |
| `column-config-dialog` | UI primitive | Shared design-system control | `components/ui/column-config-dialog.tsx` |
| `command` | UI primitive | Shared design-system control | `components/ui/command.tsx` |
| `context-menu` | UI primitive | Shared design-system control | `components/ui/context-menu.tsx` |
| `dialog` | UI primitive | Shared design-system control | `components/ui/dialog.tsx` |
| `drawer` | UI primitive | Shared design-system control | `components/ui/drawer.tsx` |
| `dropdown-menu` | UI primitive | Shared design-system control | `components/ui/dropdown-menu.tsx` |
| `dropzone` | UI primitive | Shared design-system control | `components/ui/dropzone.tsx` |
| `form` | UI primitive | Shared design-system control | `components/ui/form.tsx` |
| `glass-card` | UI primitive | Shared design-system control | `components/ui/glass-card.tsx` |
| `hover-card` | UI primitive | Shared design-system control | `components/ui/hover-card.tsx` |
| `input-otp` | UI primitive | Shared design-system control | `components/ui/input-otp.tsx` |
| `input` | UI primitive | Shared design-system control | `components/ui/input.tsx` |
| `kbd` | UI primitive | Shared design-system control | `components/ui/kbd.tsx` |
| `label` | UI primitive | Shared design-system control | `components/ui/label.tsx` |
| `language-selector` | UI primitive | Shared design-system control | `components/ui/language-selector.tsx` |
| `media-card` | UI primitive | Shared design-system control | `components/ui/media-card.tsx` |
| `mood-tracker` | UI primitive | Shared design-system control | `components/ui/mood-tracker.tsx` |
| `navigation-menu` | UI primitive | Shared design-system control | `components/ui/navigation-menu.tsx` |
| `pagination` | UI primitive | Shared design-system control | `components/ui/pagination.tsx` |
| `popover` | UI primitive | Shared design-system control | `components/ui/popover.tsx` |
| `progress` | UI primitive | Shared design-system control | `components/ui/progress.tsx` |
| `radio-group` | UI primitive | Shared design-system control | `components/ui/radio-group.tsx` |
| `range-filter` | UI primitive | Shared design-system control | `components/ui/range-filter.tsx` |
| `resizable` | UI primitive | Shared design-system control | `components/ui/resizable.tsx` |
| `scroll-area` | UI primitive | Shared design-system control | `components/ui/scroll-area.tsx` |
| `segmented-control` | UI primitive | Shared design-system control | `components/ui/segmented-control.tsx` |
| `select` | UI primitive | Shared design-system control | `components/ui/select.tsx` |
| `separator` | UI primitive | Shared design-system control | `components/ui/separator.tsx` |
| `sheet-tooltip` | UI primitive | Shared design-system control | `components/ui/sheet-tooltip.tsx` |
| `sheet` | UI primitive | Shared design-system control | `components/ui/sheet.tsx` |
| `sidebar` | UI primitive | Shared design-system control | `components/ui/sidebar.tsx` |
| `skeleton` | UI primitive | Shared design-system control | `components/ui/skeleton.tsx` |
| `slider` | UI primitive | Shared design-system control | `components/ui/slider.tsx` |
| `sonner` | UI primitive | Shared design-system control | `components/ui/sonner.tsx` |
| `stat-tile` | UI primitive | Shared design-system control | `components/ui/stat-tile.tsx` |
| `stats-card` | UI primitive | Shared design-system control | `components/ui/stats-card.tsx` |
| `switch` | UI primitive | Shared design-system control | `components/ui/switch.tsx` |
| `table` | UI primitive | Shared design-system control | `components/ui/table.tsx` |
| `tabs` | UI primitive | Shared design-system control | `components/ui/tabs.tsx` |
| `textarea` | UI primitive | Shared design-system control | `components/ui/textarea.tsx` |
| `tooltip` | UI primitive | Shared design-system control | `components/ui/tooltip.tsx` |
| `unified-sidebar` | UI primitive | Shared design-system control | `components/ui/unified-sidebar.tsx` |
| `updates-navigation` | Reusable UI component | Shared building block across routes | `components/updates-navigation.tsx` |
| `with-risk-evaluation` | Widget policy wrapper | Apply risk policy around widget runtime | `components/widget-policy/with-risk-evaluation.tsx` |

## Notes
- Source of truth for route composition remains `app/[locale]/**/page.tsx` and `layout.tsx`.
- Dashboard runtime flow starts from `app/[locale]/dashboard/layout.tsx` and `app/[locale]/dashboard/page.tsx`.
- For imports, begin from `app/[locale]/dashboard/components/import/import-button.tsx` and follow provider-specific processors.
