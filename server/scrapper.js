const { chromium } = require('playwright');
// const { logger } = require('./logger');

async function extractReviews(url) {
    // Launch the browser
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the product page
    await page.goto(url);
    // Wait for reviews section to load
    await page.waitForSelector('.reviews-selector', { timeout: 10000 });

    // Scrape the reviews
    const reviews = await page.evaluate(() => {
        // This part should extract reviews dynamically from the page
        const reviewElements = document.querySelectorAll('.review-element-class');
        const reviewsData = [];

        reviewElements.forEach((el) => {
            const title = el.querySelector('.review-title-class')?.textContent || 'No Title';
            const body = el.querySelector('.review-body-class')?.textContent || 'No Body';
            const rating = el.querySelector('.review-rating-class')?.textContent || 'No Rating';
            const reviewer = el.querySelector('.reviewer-name-class')?.textContent || 'Anonymous';

            reviewsData.push({ title, body, rating, reviewer });
        });

        return reviewsData;
    });

    await browser.close();

    return {
        reviews_count: reviews.length,
        reviews
    };
}

module.exports = { extractReviews };
