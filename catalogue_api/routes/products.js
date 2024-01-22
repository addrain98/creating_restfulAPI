const express = require('express');
const { getDB } = require('../mongoUtil');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const router = express.Router();
const COLLECTION = 'products';


app.post("/", authenticateToken, async function (req, res) {
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