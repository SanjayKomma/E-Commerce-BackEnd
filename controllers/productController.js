const Product = require('../models/product.js');
const productController = {
    getAllProducts: async (request, response) => {
        try{
            const products = await Product.find({}).select('-__v');
            if(!products){
                return response.status(404).json({message: 'No products found'});
            }
            return response.status(200).json({message: 'All products fetched successfully', products: products});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    },
    getProductById: async (request, response) => {
        try{
            const {id} = request.params;
            const product = await Product.findById(id).select('-__v');
            if(!product){
                return response.status(404).json({message: 'Product not found'});
            }
            return response.status(200).json({message: 'Product fetched successfully', product: product});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    },
    createProduct: async (request, response) => {
        try{
            const {name, description, price, category, image} = request.body;
            const product = new Product({
                name,
                description,
                price,
                category,
                image : image || null,
                createdBy: request.userId
            });
            await product.save();
            return response.status(201).json({message: 'Product created successfully', product: product});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    },
    updateProduct: async (request, response) => {
        try{
            const {id} = request.params;
            const updates = request.body;
            const product = await Product.findByIdAndUpdate(id, updates, {new: true});
            if(!product){
                return response.status(404).json({message: 'Product not found'});
            }
            return response.status(200).json({message: 'Product updated successfully', product: product});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    },
    deleteProduct: async (request, response) => {
        try{
            const {id} = request.params;
            const product = await Product.findByIdAndDelete(id);
            if(!product){
                return response.status(404).json({message: 'Product not found'});
            }
            return response.status(200).json({message: 'Product deleted successfully'});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    }
}
module.exports = productController;