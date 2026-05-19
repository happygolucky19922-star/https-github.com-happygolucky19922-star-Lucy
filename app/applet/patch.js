const fs = require('fs');
let c = fs.readFileSync('src/components/LucyChatView.tsx', 'utf8');
c = c.replace('notify(`\\${c} detached.`);', 'notify(`${c} detached.`);');
c = c.replace('notify(`\\${c} initialized and attached.`, "success");', 'notify(`${c} initialized and attached.`, "success");');
fs.writeFileSync('src/components/LucyChatView.tsx', c);
