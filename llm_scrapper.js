const puppeteer = require('puppeteer');
// const OpenAI = require('openai');  // Correct import statement for OpenAI
const axios = require("axios");
const fs = require('fs');

function chunkHTMLContent(htmlContent, chunkSize = 10000) {
    // Split the HTML content into chunks based on the specified chunk size
    const chunks = [];
    for (let i = 0; i < htmlContent.length; i += chunkSize) {
        chunks.push(htmlContent.slice(i, i + chunkSize));
    }
    console.log(chunks.length)
    
    return chunks;
}

async function getReviewSelector(htmlContent) {
    try {
        const apiUrl = 'http://localhost:11434/api/chat';
        
        const prompt = `
        ${htmlContent}
        GOAL: You are tasked with extracting review-related attributes from an HTML document. 

        Discription:
        Your job is to analyze a given HTML document of a product page and identify the attributes
        that contain elements related to review data provided by buyers. 
        Specifically, you need to identify the attributes that correspond to the following information:
        1. Reviewer Name
        2. Review Title
        3. Review Body
        4. Rating Stars

        ### Instructions:
        - Focus on attributes like class, id, data-hook, or other relevant HTML attributes that can help locate these elements.
        - Analyze the surrounding text or content to determine which attributes contain the specified information (reviewer name, title, body, and rating stars).  
        - Identify the common attributes that are specific to the review section and can be used to extract these four pieces of information.      
        - The output MUST be a valid JSON object that maps each of the four fields (reviewer_name, review_title, review_body, rating_stars) to its respective attribute:value pair.
        - Do not return review data itself, just the attributes and values in give Foramt in Discription
        - Provide the output as a JSON object with exact attribute-value pairs.
        - Do not include explanations or insights; only return the JSON format.
        - Use the following format for your response:

        ### Example Output:
        {
          "reviewer_name": "class='review-author'",
          "review_title": "id='review-title'",
          "review_body": "data-hook='review-body'",
          "rating_stars": "class='rating-stars'"
        }

        Now, given the above HTML content, return the JSON object with the attribute-value pairs:
        `;

        const prompt2 = `
        ###Goal: 
        Your task is to analyze the provided HTML document and identify the class name for the div that contains individual reviews provided by buyers.

        ###Instruction:
        - Focus solely on container tags such as <div> or <span> that include review information.
        - Ignore all javascript inside the code.
        - Analys text inside each potential tags(div, span) and check if the text is realted to review or not. 
        - Identify the single, common class name that is consistently used for all review sections on this page.
        - Do not generate or hallucinate information; base your answer strictly on the provided HTML content.
        - DO NOT include any additional information or explanations; return only the JSON object, as the response will be processed further.
        - RETURN None if you can't any information related to product review in the html structure

        ###Examples:
        - Amazon product page: {"class": "a-section review aok-relative"}
        - Flipkart product page: {"class": "RcTBJd"}


        ###Output Format - class is found:
        {
            "class": "class_name"
        }
        ###Output Format - class not found:
        "None"

        `

        const prompt3 = `
        ${htmlContent}
        You are tasked with identifying the dynamic CSS selectors that encapsulate customer reviews on an e-commerce product page. 

        Goal:
            - Analyze the provided HTML content of a product page and find the CSS selectors (class, id, data-hook, etc.) for reviews.
            - Ensure that you identify selectors for key review information:
            1. Reviewer Name
            2. Review Title
            3. Review Body
            4. Rating Stars

        Instructions:
            1. Focus on container tags such as '<div>', '<span>', and others that include review information.
            2. Only return relevant CSS selectors that can be used to extract review details.
            3. If pagination is present, identify any necessary selectors to handle it.

        Expected Output:
        {
        "reviewer_name": "attribute-value",
        "review_title": "attribute-value",
        "review_body": "attribute-value",
        "rating_stars": "attribute-value",
        "pagination": "attribute-value"
        }
        `

        // Prepare the request data
        const htmlchunks = chunkHTMLContent(htmlContent)

        const reviewElements = htmlchunks.map(async (chunk) => {
            const data = {
                "model": "mistral",
                "messages": [
                    {
                        "role": "user",
                        "content": chunk + '\n' + prompt2
                    },
                ],
                "stream": false
            };
            const response = await axios.post(apiUrl, data);
            console.log(response)
            const result = JSON.parse(response.data?.message?.content.trim());
            return result

        })

        
        
        // Extract and return the JSON object directly from the LLM's response if it's structured correctly
        return reviewElements;
    } catch (error) {
        console.error("Error occurred while fetching review selectors:", error);
    }
}


async function scrapeHTML(url) {
    // Step 1: Use Puppeteer to get the HTML of the webpage
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const fileName = "content.txt"
    const bodyContent = await page.evaluate(()=> {
        return  document.querySelector("body").innerHTML
    })
    fs.writeFile(fileName, bodyContent, (err) => {
        if (err) {
            console.error("Error while writing html file");
        } else {
            console.log("Successfully written body content");
        }
    });
    console.log("Extracted HTML content of the page")
    await browser.close();

    return bodyContent;
}

(async () => {
    const url = 'https://www.amazon.in/Rellon-Industries-Students-Lightweight-A1/dp/B0CW2VV681/ref=cm_cr_arp_d_product_top?ie=UTF8&th=1';  // Replace with the target URL
    const bodyContent = await scrapeHTML(url);
    const reviewSelector = await getReviewSelector(bodyContent);
    console.log('Review Selector:', reviewSelector);
})();
