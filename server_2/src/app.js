const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/order_routes');
const userRoutes = require('./routes/user_routes');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

// Serverr Health
app.get('/', (req, res) => {
     res.send('Server 1 is running') 
    });




module.exports = app;