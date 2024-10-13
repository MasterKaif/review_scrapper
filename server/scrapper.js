const puppeteer = require('puppeteer');
const { Configuration, OpenAIApi } = require('openai');
const { amazon_review_class, flipkart_review_class, shopify_review_class } = require('./cosntants');
const axios = require("axios")


async function getReviewSelector(htmlContent) {
    const openai = new OpenAIApi(new Configuration({
        apiKey: "sk-kL1Dhx4dWNkuUllpkbCHPm0YHZUbtZd20oGJeMZLCMT3BlbkFJrtMv2l8jK7GWMV1sIWowfoOgNHG84JEVpVKUWX6EYA",  
    }));
    // Step 2: Send the HTML to OpenAI API to find the review selector
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',  // or another model you wish to use
        messages: [
            {
                role: 'system',
                content: 'You are an assistant that helps identify CSS selectors for review content in HTML code. Provide a CSS selector based on the given HTML content.',
            },
            {
                role: 'user',
                content: htmlContent,
            },
        ],
    });

    const selector = response.data.choices[0].message.content;
    return selector;
}

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

async function extractReviews(url) {
    try{

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
    
        // Navigate to the product page
        await page.goto(url, { waitUntil: 'networkidle2' });
        const reviewClass = findReviewClassFromWebsite(url)
        // Scrape the reviews
        const reviews = await page.evaluate((reviewClass) => {
            const reviewElements = Array.from(document.querySelectorAll(`[class="${reviewClass}"]`));
            const reviewsData = reviewElements.map(element => element.innerText.trim());
            return reviewsData;
        }, reviewClass);

        console.log(reviews)
    
        await browser.close();
        const reviewData = await askLLMTocreateJSON(reviews)
    
        return {
            reviews_count: reviews.length,
            reviewData
        };
    } catch (error) {
        console.log("Error Occured while getting Review Elements")
        console.log(error)
    }
}

async function askLLMTocreateJSON(reviews) {
    try {

        const prompt = `
        Goal: Create a List of JSON objects from Given List of string where each JSON contains Following properties:
            1. reviewerName
            2. reviewTitle
            3. reviewBody
            4. rating
    
        ### Instruction:
        - Each string in List is a review of product.
        - Your job is to analyse the string and Identify which part of the string belongs following properties and create JSON object outof it
            Properties:
               1. reviewerName
                2. reviewTitle
                3. reviewBody
                4. rating 
        `
        const data = {
            "model": "mistral",
            "messages": [
                {
                    "role": "user",
                    "content": reviews + '\n' + prompt
                },
            ],
            "stream": false
        };
        const apiUrl = 'http://localhost:11434/api/chat';
        const response = await axios.post(apiUrl, data);
        console.log(response)
        const result = JSON.parse(response.data?.message?.content.trim());
        return result
    } catch(error) {
        console.log("Error Occured While Quering LLM")
        console.log(error)
    }
}
module.exports = { extractReviews };
