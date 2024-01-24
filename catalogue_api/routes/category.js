const express = require('express');
const { getDB } = require('../mongoUtil');
const { authenticateToken } = require('../middlewares');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const router = express.Router();
const COLLECTION = 'uom';


router.post("/category", authenticateToken, async function (req, res) {
    // anything retrieved is from req.body is a string, not number
    try {
        const { name } = req.body;
    
        // Validation
        if (!name) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const newCategory = { name };
        const result = await getDB().collection('category').insertOne(newCategory);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error adding new product', error: error.message });
      }

});

router.get('/category', async (req, res) => {
    try {
        const categories = await getDB().collection('category').find({}).toArray();
        res.json(categories);
    } catch (error) {
        res.status(500).json({message: 'Error fetching category', error: error.message});
    }
});

router.delete("/category:id", async function (req, res) {
    try {
        const categoryId = req.params.id;
        const result = await getDB().collection('category').deleteOne({_id: categoryId});
        if (result.deleteCount === 0 ) {
            return res.status(404).json({ message:"category not found"})
        }

        res.status(200).json({ message: "category successfully deleted"})
    } catch (error) {
        res.status(500).json({message: 'Error deleting category', error: error.message})
    }
});


router.put("/category/:id", async function (req, res) { 
    try {
     const categoryId = req.params.id;
     const { name } = req.body
 
     if (!name) {
         return res.status(400).json({ message: 'Missing required fields' });
     }
 
     const objectId = new ObjectId(categoryId); 
 
     const updateData = { name }; 
 
     const result = await getDB().collection('name').updateOne(
         { _id: objectId }, 
         { $set: updateData } 
     );
 
     if (result.matchedCount === 0) {
         res.status(404).json({ message: 'Category not found' });
     } else if (result.modifiedCount === 0) {
         res.status(200).json({ message: 'No changes made to the Category' });
     } else {
         res.status(200).json({ message: 'Category updated successfully' });
     }
    } catch (error) {
         res.status(500).json({ message: 'Error updating UoM', error: error.message });
    }
 });


module.exports = router