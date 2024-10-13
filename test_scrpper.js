const puppeteer = require('puppeteer');
const fs = require('fs');
const { amazon_review_class, flipkart_review_class, shopify_review_class } = require('./server/cosntants');
// import OpenAI from "openai";

class reviews {
    
}

(async () => {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const htmlFileName = "content.txt"
    const cssFileName = "style.txt"
    
    // Open a new page
    const page = await browser.newPage();
    
    // Navigate to the desired URL
    const url = 'https://www.amazon.in/Rellon-Industries-Students-Lightweight-A1/dp/B0CW2VV681/ref=cm_cr_arp_d_product_top?ie=UTF8&th=1'; // Change this to your target URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    // Extract only the body content
    // const elements = await page.evaluate(() => {
    //     let reviews = Array.from(document.querySelectorAll('[data-hook="review"]')); // Adjust the selector if needed
    //     return reviews.map(div => div.innerText.trim());  // Or use .innerText for content
    // });
    
    const reviews = await page.evaluate(() => {
        function findReviewClassFromWebsite(url) {
            if(url.includes("amazon")) {
                return amazon_review_class
            }
            if(url.includes("flipkart")) {
                return flipkart_review_class
            }
            if(url.includes("shop")) {
                return shopify_review_class
            }
        }
        const reviewClass = findReviewClassFromWebsite(page.url)
        const reviewElements = Array.from(document.querySelectorAll(`[class="${reviewClass}"]`));
        const reviewsData = reviewElements.map(element => element.innerText.trim());
        return reviewsData;
    });
    // Write body content to file
    fs.writeFile(htmlFileName, reviews, (err) => {
        if (err) {
            console.error("Error while writing html file");
        } else {
            console.log("Successfully written body content");
        }
    });// // Extract specific data by class or id

    // elements.forEach(ele => console.log(ele))
    // const extractedData = await page.evaluate(() => {
    //     // Example: Find the element with a specific class
    //     const reviews = Array.from(document.querySelectorAll('*'));

    //     // You can also find by ID
    //     // const element = document.getElementById('someId').innerText

    //     return reviews;
    // });
    // system_messge = `
    // Given a list of HTML elements, i
    // dentify and extract the class name associated with customer reviews. 
    // Look for patterns such as keywords like 'review', 'rating', 'feedback', or any elements containing customer testimonials. 
    // Return the specific class name that is most relevant to customer reviews.
    // `
    // const openai = new OpenAI();
    // const completion = await openai.chat.completions.create({
    //     model: "gpt-4o",
    //     messages: [
    //         {"role": "system", "content": system_messge},
    //         {"role": "user", content: extractedData}
    //     ]
    // });

    // Close the browser
    await browser.close();
})();
