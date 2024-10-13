const puppeteer = require('puppeteer');
const { Configuration, OpenAIApi } = require('openai');
const { amazon_review_class, flipkart_review_class, shopify_review_class } = require('./cosntants');
const axios = require("axios")

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
        return {
            message: "Error Occured in while getting Review Elements "
        }
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
        - DO NOT return code or any Explaination directly return JSON OBJECT.
        - DO NOT add any comments as well, the out will used in Json.parse()
        - Use None if the value for perticular property is not found

        ###Example Out put:
        {
            "reviewerName": "KaifMaster",
            "reviewTitle: "Good Product",
            "reviewBody": "Nice quality product",
            "rating": "4 star"
        }
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
        return {
            "message": "Error Occured while building JSON object via LLM"
        }
    }
}
module.exports = { extractReviews };
