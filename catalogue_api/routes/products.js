const express = require('express');
const { getDB } = require('../mongoUtil');
const { authenticateToken } = require('../middlewares');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const router = express.Router();


router.post("/", async function (req, res) {
    console.log("hii")
    // anything retrieved is from req.body is a string, not number
    try {
        const { name, uom, category, price } = req.body;
        console.log(req.body)
        // Validation
        if (!name || !uom || !category || !price) {
          res.status(400).json({ message: 'Missing required fields' });
          return
        }
    
        const newProduct = { name, uom, category, price };
        const result = await getDB().collection('products').insertOne(newProduct);
        res.json(result);
    }  catch (error) {
        res.status(500).json({ message: 'Error adding new product', error: error.message });
      }

});

router.get('/', async (req, res) => {
    console.log("hello");
    try {
        const products = await getDB().collection('products').find({}).toArray();

        // Fetch and map UOMs
        const uomIds = products.map(product => product.uom && product.uom._id).filter(id => id);
        const uoms = await getDB().collection('uom').find({_id: {$in: uomIds}}).toArray();
        const uomMap = {};
        uoms.forEach(uom => uomMap[uom._id] = uom);

        // Fetch and map Categories
        const categoryIds = products.reduce((acc, product) => acc.concat(product.category || []), []);
        const categories = await getDB().collection('category').find({_id: {$in: categoryIds}}).toArray();
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



router.delete("/:id", async function (req, res) {
    try {
        const productId = req.params.id;
        const result = await getDB().collection('products').deleteOne({_id: productId});
        if (result.deleteCount === 0 ) {
            return res.status(404).json({ message:"Product not found"})
        }

        res.status(200).json({ message: "Product successfully deleted"})
    } catch (error) {
        res.status(500).json({message: 'Error deleting product', error: error.message})
    }
});


router.put("/:id", async function (req, res) { 
    try {
     const productId = req.params.id;
     const { name, uom, category, price } = req.body; 
 
     if (!name || !uom || !category || !price) {
         return res.status(400).json({ message: 'Missing required fields' });
     }
 
     const objectId = new ObjectId(productId); 
 
     const updateData = { name, uom, category, price }; 
 
     const result = await getDB().collection('products').updateOne(
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