const express = require('express');
const { extractReviews } = require('./scrapper');
// require('dotenv').config();

const app = express();
const port = 3000;

// Endpoint to extract reviews from a product page
app.get('/api/reviews', async (req, res) => {
    const url = req.query.page;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    console.log(url)

    try {
        const reviews = await extractReviews(url);
        res.json(reviews);
    } catch (error) {
        console.error('Error extracting reviews:', error);
        res.status(500).json({ error: 'Failed to extract reviews'});
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
