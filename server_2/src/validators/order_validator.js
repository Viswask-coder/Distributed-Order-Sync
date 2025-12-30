const validateOrder = (req, res, next) => {
    const { user_id, amount } = req.body;

    
    if (!user_id || !amount) {
        return res.status(400).json({ 
            success: false, 
            message: "user_id and amount required" 
        });
    }

    
    if (amount <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: "amount must be positive" 
        });
    }

    next(); 
};

module.exports = { validateOrder };