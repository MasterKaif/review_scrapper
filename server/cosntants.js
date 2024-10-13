require("dotenv").config();

const amazon_review_class = "a-section review aok-relative";
const flipkart_review_class = "RcXBOT";
const shopify_review_class = "max-w-[360px] flex shrink-0 cursor-pointer snap-start snap-always scroll-mx-space-16 rounded-radius-12 border-[1px] border-solid border-border-image p-space-16 md:w-full md:max-w-none md:border-none md:p-space-0 w-[calc(100vw-theme(spacing[space-64]))]";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL

module.exports = {
    amazon_review_class,
    flipkart_review_class,
    shopify_review_class,
    OPENAI_API_KEY,
    OPENAI_MODEL
};