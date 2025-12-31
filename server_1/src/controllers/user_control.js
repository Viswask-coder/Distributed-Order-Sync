const userModel = require('../models/user_model');
const axios = require('axios');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

//  Create a user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const result = await userModel.createUser({ name, email, password:hashedPassword });
        const newUserId = result.insertId; 
        const userData = { id: newUserId, name, email, password:hashedPassword };

        
            await axios.post(`${process.env.SERVER_URL}/users/receive`, userData);
            console.log(`Sync User ${newUserId}`);
     

        res.status(201).json({ 
            success: true,
             userId: newUserId,
             message: "User created & synced" });

    } catch (err) {
     if (err.code === 'ERR_DUP_ENTRY') {
        return res.status(409).json({ 
            success: false, 
            message: "Email already exists" 
        });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating user" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error logging in" });
    }
}

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

module.exports = { registerUser, loginUser, receiveUserSync };