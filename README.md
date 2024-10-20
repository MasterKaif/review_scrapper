# review_scrapper
Application to Dynamically Scraps reviews from from Marketplace Review URL (Amazon, Flipkart, Shopify)

# Features
- Gets all the review data from the page by seleting predefined CSS class from HTML content of Amazon, Flipkart, Shopify
- Utilizes LLM to structure Clumsy output into JSON object
- Structured Output: Extracts and structures the review data into four fields:
Reviewer Name
Review Title
Review Body
Rating Stars

# Getting Started

## Pre-requist
- Nodejs v20.18
- ollama
- mistral 7B(ollama repository)

## Installation
1. clone the repository
`git clone https://github.com/MasterKaif/review_scrapper.git`
`cd review_scrapper`

2. `npm install`

3. Setup the ollama
- Install the ollama to your local machin refer this link `https://ollama.com/download` ollama installation
- Pull the mistral Model `ollama pull mistral`
- serve ollama server `ollama serve` or `ollama start`

4. start npm server `npm run start`
- By default, the server will run on http://localhost:3000. You can configure the port and other settings in the .env file.


## API Usage
- Make a POST request to the API endpoint with the URL of the product page you wish to scrape:
```
Get /api/reviews?url
params: `url` (url of the product page)
``` 
- The response will be a JSON object containing the extracted reviews, structured as follows:
```
{
    "reviews_count": 3,
    "reviewData": [
        {
            "reviewer_name": "John Doe",
            "review_title": "Great product!",
            "review_body": "I really enjoyed this product because...",
            "rating_stars": 5
        },
        ...
    ]
}
```

### Future Plan
- Customzing LLM call to directly extract the CSS selector from html code for dynamicity
and usability across any website
- Add Pagination Handling: 
Implement logic to navigate through all pages of reviews to ensure complete data extraction.
- To Add Agents and Tools to Optimise Structure and Quring LLM.

### Another vesion
- If you wish to use openai gpt, rather than using ollama, checkout to branch `openai`
- set you `OPEN_AI_API_KEY` and `OPENAI_MODEL` in .env file
- restart the server and call the `Get /api/reviews?url` API
    #### Note: This part is NOT TESTED Perfectly so may or may not work



