const express = require('express');
const { getDB } = require('../mongoUtil');
const { authenticateToken } = require('../middlewares');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const router = express.Router();
const COLLECTION = 'products';


app.post("/products", authenticateToken, async function (req, res) {
    // anything retrieved is from req.body is a string, not number
    try {
        const { name, uom, category, price } = req.body;
    
        // Validation
        if (!name || !uom || !category || !price) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const newProduct = { name, uom, category, price };
        const result = await db.collection('products').insertOne(newProduct);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error adding new recipe', error: error.message });
      }

});

app.get('/products', async (req, res) => {
    try {
        const products = await db.collection('products').find({}).toArray();

        // Fetch and map UOMs
        const uomIds = products.map(product => product.uom && product.uom._id).filter(id => id);
        const uoms = await db.collection('uom').find({_id: {$in: uomIds}}).toArray();
        const uomMap = {};
        uoms.forEach(uom => uomMap[uom._id] = uom);

        // Fetch and map Categories
        const categoryIds = products.reduce((acc, product) => acc.concat(product.category || []), []);
        const categories = await db.collection('category').find({_id: {$in: categoryIds}}).toArray();
        const categoryMap = {};
        categories.forEach(category => categoryMap[category._id] = category);

        // Enrich products with UOM and Category
        products.forEach(product => {
            if (product.uom && uomMap[product.uom._id]) {
                product.uom = uomMap[product.uom._id];
            }
            if (product.category) {
                product.category = product.category.map(categoryId => categoryMap[categoryId] || categoryId);
            }
        });

        res.json(products);

    } catch (error) {
        res.status(500).json({message: 'Error fetching products', error: error.message});
    }
});


/*app.get('/products/:id', async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      const product = await db.collection('products').findOne({_id: id});
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
  });*/



app.delete("/products:id", async function (req, res) {
    try {
        const productId = req.params.id;
        const result = await db.collection('products').deleteOne({_id: productId});
        if (result.deleteCount === 0 ) {
            return res.status(404).json({ message:"Product not found"})
        }

        res.status(200).json({ message: "Product successfully deleted"})
    } catch (error) {
        res.status(500).json({message: 'Error deleting product', error: error.message})
    }
});


app.put("/products/:id", async function (req, res) { 
    try {
     const productId = req.params.id;
     const { name, uom, category, price } = req.body; 
 
     if (!name || !uom || !category || !price) {
         return res.status(400).json({ message: 'Missing required fields' });
     }
 
     const objectId = new ObjectId(productId); 
 
     const updateData = { name, uom, category, price }; 
 
     const result = await db.collection('products').updateOne(
         { _id: objectId }, 
         { $set: updateData } 
     );
 
     if (result.matchedCount === 0) {
         res.status(404).json({ message: 'Product not found' });
     } else if (result.modifiedCount === 0) {
         res.status(200).json({ message: 'No changes made to the product' });
     } else {
         res.status(200).json({ message: 'Product updated successfully' });
     }
    } catch (error) {
         res.status(500).json({ message: 'Error updating product', error: error.message });
    }
 });


module.exports = router