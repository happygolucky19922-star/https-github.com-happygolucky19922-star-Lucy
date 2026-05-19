
import { JSDOM } from 'jsdom';
import fs from 'fs';
const dom = new JSDOM(fs.readFileSync('dist/index.html', 'utf8'), {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost:3000'
});
dom.window.onerror = (msg, src, l, col, err) => console.log('JSDOM ERROR:', err);
setTimeout(() => console.log('Done'), 3000);
