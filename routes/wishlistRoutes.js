const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { isAuthenticated } = require('../middlewares/auth');

router.get('/', isAuthenticated, wishlistController.getWishlist);
router.post('/toggle', isAuthenticated, wishlistController.toggleWishlistItem);

module.exports = router;