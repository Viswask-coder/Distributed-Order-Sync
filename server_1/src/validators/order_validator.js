const validateOrder = (req, res, next) => {
    const { user_id, amount } = req.body;

    //  Check if fields exist
    if (!user_id || !amount) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing required fields: user_id and amount" 
        });
    }

    //  amount not be negative
    if (amount <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Amount must be greater than 0" 
        });
    }

    next(); 
};

module.exports = { validateOrder };