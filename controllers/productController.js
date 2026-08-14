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
    },
    getProducts: async (request, response) => {
        try{
            const {name, keyword, category, minPrice, maxPrice, sortBy, page, limit} = request.query;
            const query = {};
            if(keyword){
                query.$or = [
                    {name : {$regex : keyword, $options: 'i'}},
                    {description : {$regex : keyword, $options: 'i'}}
                ];
            }
            if(category){
                query.category = category;
            }
            if(minPrice || maxPrice){
                query.price = {};
                if(minPrice) query.price.$gte = Number(minPrice);
                if(maxPrice) query.price.$lte = Number(maxPrice);
            }
            let sortOptions = {createdAt: -1};
            if(sortBy === 'price_asc') sortOptions = {price: 1};
            if(sortBy === 'price_desc') sortOptions = {price: -1};
            if(sortBy === 'rating') sortOptions = {rating: -1};
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;
            const totalDocuments = await Product.countDocuments(query);
            const products = await Product.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum);
            return response.status(200).json({products, page:pageNum, pages: Math.ceil(totalDocuments/limitNum), totalDocuments});
        }
        catch(error){
            return response.status(500).json({message: 'Internal server error', error: error.message});
        }
    }
}
module.exports = productController;