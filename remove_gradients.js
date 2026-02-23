const fs = require('fs');
const path = require('path');

const files = [
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
    "app/[locale]/(landing)/disclaimers/page.tsx"
];

const patternsToRemove = [
    // background gradients
    /bg-gradient-to-[a-z]+\s+from-[a-zA-Z0-9-/[\]]+\s+via-[a-zA-Z0-9-/[\]]+\s+to-[a-zA-Z0-9-/[\]]+/g,
    /bg-gradient-to-[a-z]+\s+from-[a-zA-Z0-9-/[\]]+\s+to-[a-zA-Z0-9-/[\]]+/g,
    // glowing blurs
    /<div[^>]+animate-pulse[^>]+blur-\[1[0-9]{2}px\][^>]*><\/div>/g,
    /<div[^>]+animate-\[pulse[^>]+blur-\[1[0-9]{2}px\][^>]*><\/div>/g,
    // text gradients
    /text-transparent\s+bg-clip-text\s+bg-gradient-to-[a-z]+\s+from-[a-zA-Z0-9-/[\]]+\s+to-[a-zA-Z0-9-/[\]]+/g,
    /bg-gradient-to-[a-z]+\s+from-[a-zA-Z0-9-/[\]]+\s+to-[a-zA-Z0-9-/[\]]+\s+bg-clip-text\s+text-transparent/g
];

let changedAny = false;

for (let file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;

        // remove glow divs entirely
        newContent = newContent.replace(/<div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">[\s\S]*?<\/div>\n\s*<\/div>/g, '');
        newContent = newContent.replace(/<div className="absolute[^>]+blur-\[[1-9][0-9]*px\]"[^>]*><\/div>/g, '');

        // Text gradients
        newContent = newContent.replace(/text-transparent bg-clip-text bg-gradient-to-b from-white\/80 to-white\/40/g, 'text-foreground');
        newContent = newContent.replace(/bg-gradient-to-br from-white to-white\/60 bg-clip-text text-transparent/g, 'text-foreground');
        
        // Background gradients on Cards/divs
        newContent = newContent.replace(/bg-gradient-to-r from-white\/10 via-white\/10 to-white\/5/g, 'bg-card/75');
        newContent = newContent.replace(/bg-gradient-[^\s"]+(\s+from-[^\s"]+)?(\s+via-[^\s"]+)?(\s+to-[^\s"]+)?/g, 'bg-card/75');

        if (content !== newContent) {
            fs.writeFileSync(file, newContent);
            console.log(`Updated: ${file}`);
            changedAny = true;
        }
    }
}

if (!changedAny) {
    console.log("No gradients found.");
}
