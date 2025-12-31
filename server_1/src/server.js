require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Test Order: POST http://localhost:${PORT}/orders`);
    console.log(`Test User: POST http://localhost:${PORT}/users`);
    console.log(`Test Health: GET http://localhost:${PORT}/health`);

});