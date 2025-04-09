const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/number', (req, res) => {
    const randomNumber = Math.floor(Math.random() * 100);
    res.json({ number: randomNumber });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});