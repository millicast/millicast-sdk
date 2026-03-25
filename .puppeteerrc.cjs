const {join}=require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports={
    // Changes the download location to be inside the project folder
    // This makes it much easier for CI to "see" the browser
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};