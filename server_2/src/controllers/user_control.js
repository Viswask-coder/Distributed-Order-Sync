const userModel = require('../models/user_model');
const axios = require('axios');
require('dotenv').config();

//  Create a user
const registerUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        
        const result = await userModel.createUser({ name, email });
        const newUserId = result.insertId; 
        const userData = { id: newUserId, name, email };

        
            await axios.post(`${process.env.SERVER_URL}/users/receive`, userData);
            console.log(`Sync User ${newUserId}`);
     

        res.status(201).json({ 
            success: true,
             userId: newUserId,
             message: "User created & synced" });

    } catch (err) {
     if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
            success: false, 
            message: "Email already exists" 
        });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating user" });
    }
};

// Receive Sync for user
const receiveUserSync = async (req, res) => {
    try {
        console.log(`Receiving User: ${req.body.name}`);
        await userModel.syncUser(req.body);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

module.exports = { registerUser, receiveUserSync };