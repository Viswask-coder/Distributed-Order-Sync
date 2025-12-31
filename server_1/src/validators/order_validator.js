const validateOrder = (req, res, next) => {
    const { user_id, amount, product_ids } = req.body;

    // user_id is always required
    if (!user_id) {
        return res.status(400).json({ 
            success: false, 
            message: "user_id is required" 
        });
    }

    // Either amount OR product_ids must be provided
    if (!amount && !product_ids) {
        return res.status(400).json({ 
            success: false, 
            message: "Either amount or product_ids is required" 
        });
    }

    // If amount is provided, it must be positive
    if (amount !== undefined && amount <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: "amount must be positive" 
        });
    }

    // If product_ids is provided, it must be a non-empty array
    if (product_ids !== undefined) {
        if (!Array.isArray(product_ids)) {
            return res.status(400).json({ 
                success: false, 
                message: "product_ids must be an array" 
            });
        }
        if (product_ids.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "product_ids cannot be empty" 
            });
        }
    }

    next(); 
};

module.exports = { validateOrder };