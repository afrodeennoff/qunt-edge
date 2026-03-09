
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const uiDir = path.join(cwd, 'components/ui');
const scanDirs = [
    path.join(cwd, 'app'),
    path.join(cwd, 'components'),
    path.join(cwd, 'lib')
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

let allSourceFiles = [];
scanDirs.forEach(dir => {
    const files = getAllFiles(dir);
    allSourceFiles = [...allSourceFiles, ...files];
});

const usageCount = {};
uiComponents.forEach(c => usageCount[c] = 0);

allSourceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    uiComponents.forEach(component => {
        // Check absolute path
        if (content.includes(`components/ui/${component}`)) {
            usageCount[component]++;
        }
        // Check relative path (mostly for within components/ui)
        if (file.includes('components/ui') && content.includes(`./${component}`)) {
            usageCount[component]++;
        }
    });
});

console.log('Unused Components Report:');
console.log('-------------------------');
let unusedFound = false;
Object.keys(usageCount).forEach(component => {
    if (usageCount[component] === 0) {
        console.log(`- ${component}`);
        unusedFound = true;
    }
});

if (!unusedFound) {
    console.log('No completely unused components found.');
}

console.log('\nLeast Used Components (Count < 3):');
console.log('----------------------------------');
Object.keys(usageCount).forEach(component => {
    if (usageCount[component] > 0 && usageCount[component] < 3) {
        console.log(`- ${component}: ${usageCount[component]} uses`);
    }
});
