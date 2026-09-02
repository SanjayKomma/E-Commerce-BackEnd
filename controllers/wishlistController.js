const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const wishlistController = {
    getWishlist: async (request, response) => {
        try{
            const userId = request.userId;
            let wishlist = await Wishlist.findOne({user: userId}).populate('products', '-__v');
            if(!wishlist){
                wishlist = await Wishlist.create({user: userId, products: []});
            }
            return response.status(200).json({message: 'Wishlist retrieved successfully', wishlist});
        }
        catch(error){
            return response.status(500).json({message: 'Internal Server Error', error: error.message});
        }
    },
    toggleWishlistItem: async (request, response) => {
        try {
            const userId = request.userId;
            const { productId } = request.body;

            const product = await Product.findById(productId);
            if (!product) {
                return response.status(404).json({ message: 'Product not found' });
            }

            let wishlist = await Wishlist.findOne({ user: userId });
            if (!wishlist) {
                wishlist = new Wishlist({ user: userId, products: [] });
            }

            const existsIndex = wishlist.products.findIndex(
                (id) => id.toString() === productId.toString()
            );

            let action = '';
            if (existsIndex > -1) {
                wishlist.products.splice(existsIndex, 1);
                action = 'removed';
            } else {
                wishlist.products.push(productId);
                action = 'added';
            }

            await wishlist.save();
            await wishlist.populate('products', '-__v');

            return response.status(200).json({
                message: `Product ${action} from wishlist successfully`,
                wishlist,
                action
            });
        } catch (error) {
            return response.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}
module.exports = wishlistController;