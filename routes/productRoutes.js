const express = require('express');
const productController = require('../controllers/productController')
const auth = require("../middlewares/authMiddleware")
const admin = require("../middlewares/authMiddleware")

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id',productController.getProductById);
router.post('/',auth.authenticateUser,admin.admin,productController.addProduct);
router.put('/:id',auth.authenticateUser,admin.admin,productController.updateProductById);
router.delete('/:id',auth.authenticateUser,admin.admin,productController.deleteProductById);
router.post('/reviews/:id',auth.authenticateUser,productController.createProductReview);
router.delete('/:productId/:reviewId',auth.authenticateUser,productController.removeProductReview);

module.exports = router;