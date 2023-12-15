## Project set up

To run the web scraper:

1. Make sure you have Node.js installed
2. Run "node scraper.js". The scraper.js file is located in the folder titled "web_scraper"

To add the extension to chrome

1. Go to chome settings (3 dots on the top right corner of chrome browser)
2. Click on extension -> manage extensions
3. Click on "load unpacked" (top left of the site) and upload the project's root folder
4. The extension will now be available under your chrome extensions

## Implementation details

The web scraper makes use of Puppeteer, a Node.js library for controlling chrome/chromium used in this case for web scraping by collecting the urls to each pos in the smogon team discussion forums as well as each post's text content.

The chrome extension acceses the data collected by the scraper and ranks the results based on the user query using BM25 to score and rank the relevancy of forum posts.


Link to the youtube video with the demo:

https://youtu.be/uRBjM0BzRaA
