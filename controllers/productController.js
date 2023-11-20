const Product = require('../models/productModel');
const User = require("../models/userModel")

// Get all products
const getAllProducts = async (req, res) => {
    try {
        let query = {};
        
        // Search by product name
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by price range
        if (req.query.minPrice && req.query.maxPrice) {
            query.price = { $gte: parseFloat(req.query.minPrice), $lte: parseFloat(req.query.maxPrice) };
        } else if (req.query.minPrice) {
            query.price = { $gte: parseFloat(req.query.minPrice) };
        } else if (req.query.maxPrice) {
            query.price = { $lte: parseFloat(req.query.maxPrice) };
        }

        // Fetch products based on the constructed query
        const products = await Product.find(query);

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Add a new product
const addProduct = async (req, res) => {
    try {
        const { name, image, description, price, stock } = req.body;

        const newProduct = new Product({
            name,
            image,
            description,
            price,
            stock,
        });

        await newProduct.save();

        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Update a product by ID
const updateProductById = async (req, res) => {
    try {
        const { name, image, description, price, stock } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, image, description, price, stock },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // await updatedProduct.save();
        res.status(200).json({ message: 'Product updated successfully', updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Delete a product by ID
const deleteProductById = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// createProductReview
const createProductReview = async (req, res) => {
    try {
        const { rating, comment, userId, name } = req.body;

        const product = await Product.findById(req.params.id);

        const user = await User.findById(userId);

        if (product) {
            const alreadyReviewed = product.reviews.find((rev) => rev.user.toString() === user._id.toString());

            if (alreadyReviewed) {
                res.status(400);
                throw new Error('Product already reviewed.');
            }

            const review = {
                rating: Number(rating),
                comment,
                name,
                user: user._id,
            };

            product.reviews.push(review);

            product.numberOfReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
            await product.save();
            res.status(201).json({ message: 'Review has been saved.' });
        } else {
            res.status(404);
            throw new Error('Product not found.');
        }
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};



// removeProductReview
const removeProductReview = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        const updatedReviews = product.reviews.filter((rev) => rev._id.valueOf() !== req.params.reviewId);

        if (product) {
            product.reviews = updatedReviews;

            product.numberOfReviews = product.reviews.length;

            if (product.numberOfReviews > 0) {
                product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
            } else {
                product.rating = 1;
            }

            await product.save();
            res.status(201).json({ message: 'Review hass been removed.' });
        } else {
            res.status(404);
            throw new Error('Product not found.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProductById,
    deleteProductById,
    createProductReview,
    removeProductReview
}