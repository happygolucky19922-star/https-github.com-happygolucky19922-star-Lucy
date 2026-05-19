
const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE_ERROR:', error.message));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes('Something went wrong')) {
        console.log('ERROR BOUNDARY RENDERED!');
        const errorText = await page.evaluate(() => {
           return document.querySelector('.text-red-400') ? document.querySelector('.text-red-400').innerText : 'No stack';
        });
        console.log('ERROR BOUNDARY TEXT:', errorText);
    }
    await browser.close();
})();
