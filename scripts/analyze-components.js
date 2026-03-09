
const fs = require('fs');
const path = require('path');

const uiDir = path.join(process.cwd(), 'components/ui');
const scanDirs = [
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'components'),
    path.join(process.cwd(), 'lib')
];

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

const uiComponents = fs.readdirSync(uiDir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => f.replace('.tsx', ''));

const allSourceFiles = [];
scanDirs.forEach(dir => getAllFiles(dir, allSourceFiles));

const usageCount = {};
uiComponents.forEach(c => usageCount[c] = 0);

allSourceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    uiComponents.forEach(component => {
        // Check for import usage: e.g. from "@/components/ui/button"
        // Also check relative imports if any (though unlikely for shadcn structure)
        // We'll trust exact path match first.
        if (content.includes(`components/ui/${component}`)) {
            usageCount[component]++;
        }
    });
});

console.log('Unused Components Report:');
console.log('-------------------------');
let unusedFound = false;
Object.keys(usageCount).forEach(component => {
    if (usageCount[component] === 0) {
        console.log(`- ${component}.tsx`);
        unusedFound = true;
    }
});

if (!unusedFound) {
    console.log('No unused components found.');
}

console.log('\nLeast Used Components (Count < 3):');
console.log('----------------------------------');
Object.keys(usageCount).forEach(component => {
    if (usageCount[component] > 0 && usageCount[component] < 3) {
        console.log(`- ${component}.tsx: ${usageCount[component]} uses`);
    }
});
