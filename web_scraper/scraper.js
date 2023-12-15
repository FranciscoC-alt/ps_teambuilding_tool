const {
    initPuppeteer,
    scrapeForum,
    saveToJSON
} = require("./utils")
  
;(async () => {
    const { browser, page } = await initPuppeteer()
    
    const results = await scrapeForum(page, browser)
    
    saveToJSON("data.json", "..", results)
    
    await browser.close()
})()