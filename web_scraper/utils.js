const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")

const url = "https://www.smogon.com/forums/forums/sv-ou-teams.748/"

const initPuppeteer = async () => {
  try {
    
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto(url);
    return { browser, page };

  } catch (error) {
    console.error('Error during browser launch:', error);
    throw error;
  }
};


const scrapeForum = async (page, browser) => {

  try {
    let pageIndex = 1;
    let hasNextPage = true;
    const results = [];

    // Functionn to move to the next page in the main forum
    const openNext = async () => {
      const next_url = `${url}?page=${pageIndex}`;
      await page.goto(next_url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    };

    while (hasNextPage) {
      await openNext();
      const pageResults = await scrapePage(page, browser);
      results.push(...pageResults);

      // Check if there is a "next page" button
      hasNextPage = await page.$('.pageNavSimple-el--next');
      if (hasNextPage) { pageIndex++; }
    }

    return results;

  } catch (error) {
    console.error('Error while scraping forum:', error);
    throw error;
  }
};


const scrapePage = async (page, browser) => {

  try {
    await page.waitForSelector('.p-pageWrapper');

    // Get the urls for all the posts in the page
    const posts = await page.$$eval('.structItem-title a:nth-of-type(2)', links => links.map(link => link.href));

    const results = [];

    for (const link of posts) {
      const result = await scrapePost(link, browser);
      results.push(result);
    }

    return results;
  } catch (error) {

    console.error('Error while scraping page:', error);
    throw error;
  }
};

async function scrapePost( link, browser ) {

  return new Promise( async (resolve, reject) => {
      
    let post;

    try {

      post = await browser.newPage();

      await post.goto( link, { waitUntil: 'domcontentloaded', timeout: 60000 } );
      await post.waitForSelector('div.bbWrapper');

      const textContent = await post.$eval('div.bbWrapper', element => element.textContent.trim());

      let titleText = await post.$eval('.p-title-value', element => element.textContent.trim());

      // Trim this since most post titles start with this
      const prefix = 'SV OU';
      if (titleText.startsWith( prefix )) { titleText = titleText.slice( prefix.length ).trim(); }

      const result = {
        textContent: textContent,
        link: link,
        title: titleText
      };

      resolve( result );
          
      
    } catch (error) {
      console.error('Error while scraping post:', error);
      reject(error);
    } finally {
      
      if ( post ) { await post.close(); }
    }
  });
}


const saveToJSON = (filename, dirLocation, data) => {
  const directory = path.join(__dirname, dirLocation) 
  
  try {
    fs.writeFileSync(
      path.join(directory, filename),
      JSON.stringify(data, null, 2),
      "utf-8"
    )
  } catch (err) {
    console.error(err)
  }

  console.log(`Data saved to ${directory}`)
}


module.exports = {
  initPuppeteer,
  scrapeForum,
  saveToJSON
}