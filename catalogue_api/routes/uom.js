const express = require('express');
const { getDB } = require('../mongoUtil');
const { authenticateToken } = require('../middlewares');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const router = express.Router();



router.post("/uom", authenticateToken, async function (req, res) {
    // anything retrieved is from req.body is a string, not number
    try {
        const { type, description, details } = req.body;
    
        // Validation
        if (!type || !description || !details) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const newUom = { type, description, details };
        const result = await getDB().collection('uom').insertOne(newUom);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error adding new product', error: error.message });
      }

});

router.get('/uom', async (req, res) => {
    try {
        const uoms = await getDB().collection('uom').find({}).toArray();
        res.json(uoms);
    } catch (error) {
        res.status(500).json({message: 'Error fetching uom', error: error.message});
    }
});

router.delete("/uom:id", async function (req, res) {
    try {
        const uomId = req.params.id;
        const result = await getDB().collection('uom').deleteOne({_id: uomId});
        if (result.deleteCount === 0 ) {
            return res.status(404).json({ message:"UoM not found"})
        }

        res.status(200).json({ message: "UoM successfully deleted"})
    } catch (error) {
        res.status(500).json({message: 'Error deleting UoM', error: error.message})
    }
});


router.put("/uom/:id", async function (req, res) { 
    try {
     const uomId = req.params.id;
     const { type, description, details } = req.body
 
     if (!type || !description || !details) {
         return res.status(400).json({ message: 'Missing required fields' });
     }
 
     const objectId = new ObjectId(productId); 
 
     const updateData = { type, description, details }; 
 
     const result = await getDB().collection('products').updateOne(
         { _id: objectId }, 
         { $set: updateData } 
     );
 
     if (result.matchedCount === 0) {
         res.status(404).json({ message: 'UoM not found' });
     } else if (result.modifiedCount === 0) {
         res.status(200).json({ message: 'No changes made to the UoM' });
     } else {
         res.status(200).json({ message: 'UoM updated successfully' });
     }
    } catch (error) {
         res.status(500).json({ message: 'Error updating UoM', error: error.message });
    }
 });


module.exports = router