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
        res.json(products);

        const uoms = await db.collection('uom').find({}).toArray();
        const uomMap = {};

        for (let i = 0; i < uoms.length; i++) {
            const uom = uoms[i];
            uomMap[uom._id] = uom;
        }

        for (let j = 0; j < products.length; j++) {
            const product = products[j];
            if (product.uom && uomMap[product.uom._id]) {
                product.uom = uomMap[product.uom._id];
            }
        }

        const categories = await db.collection('category').find({}).toArray();
        const categoryMap = {};

        for (let i = 0; i< categories.length; i++) {
            const category = categories[i];
            categoryMap[category._id] = category;
        }

        for (let j = 0; j < products.length; j++) {
            const products = products[j];
            if(Array.isArray(products.categories)) {
                products.categories = products.categories.map(categoryId => {
                    return categoryMap[categoryId] || categoryId;
                })
            }
        }

    res.json(products);

    }catch (error) {
        res.status(500).json({message:'Error fetching products', error:error.message})
    }
});

app.get('/products/:id', async (req, res) => {
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
  });



app.delete("/food/:foodRecordId", async function (req, res) {
    const results = await db.collection(COLLECTION).deleteOne({
        '_id': new ObjectId(req.params.foodRecordId)
    })
    res.json({
        results
    });
})


app.put("/food/:foodRecordId", async function (req, res) {
    // anything retrieved is from req.body is a string, not number
    const foodName = req.body.foodName;
    const calories = req.body.calories;
    let tags = req.body.tags;
    if (tags) {
        // check if tags is already an array or a string?
        if (!Array.isArray(tags)) {
            tags = [tags];
        }
    } else {
        // if tag is undefined set to an empty array (meaning no tags selected)
        tags = [];
    }

    const results = await db.collection(COLLECTION).updateOne({
        "_id": new ObjectId(req.params.foodRecordId)
    }, {
        "$set": {
            "foodName": foodName,
            "calories": Number(calories),
            "tags": tags
        }
    });


    res.json(results);
})

app.post("/food/:foodid/note", async function (req, res) {
    const foodId = req.params.foodid;
    const noteContent = req.body.noteContent;
    const response = await db.collection(COLLECTION)
        .updateOne({
            "_id": new ObjectId(foodId)
        }, {
            "$push": {
                "notes": {
                    '_id': new ObjectId(),
                    'content': noteContent
                }
            }
        })
    res.json({
        results: response
    })

})

app.get("/food/:foodid", async function (req, res) {
    const foodRecord = await findFoodByID(req.params.foodid);
    res.json({foodRecord})
});

app.delete("/food/:foodid/note/:noteid", async function (req, res) {
    const { foodid, noteid } = req.params;
    // const foodid = req.params.foodid;
    // const noteid = req.params.noteid;

    const results = await db.collection(COLLECTION).updateOne({
        "_id": new ObjectId(foodid)
    }, {
        '$pull': {
            "notes": {
                "_id": new ObjectId(noteid)
            }
        }
    })

    res.json({
        results
    })
})


app.put('/food/:foodid/note/:noteid', async function (req, res) {

    const { foodid, noteid } = req.params;
    const results = await db.collection(COLLECTION)
        .updateOne({
            '_id': new ObjectId(foodid),
            'notes._id': new ObjectId(noteid)
        }, {
            '$set': {
                'notes.$.content': req.body.noteContent
            }
        })

    res.json({
        results
    })
});

module.exports = router