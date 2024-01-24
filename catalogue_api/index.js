const express = require('express');
const cors = require('cors'); // cross origin resources sharing
const { ObjectId } = require('mongodb');
const userRoutes = require("./routes/users");
const productsRoutes = require("./routes/products")
require("dotenv").config();

const app = express();

app.use(cors()); 
app.use(express.json());

const { connect } = require("./mongoUtil");
const { authenticateToken } = require('./middlewares');

const DB_NAME = process.env.DB_NAME;


async function main() {
    const db = await connect(process.env.MONGO_URL, DB_NAME);


   


    

    app.use('/products', productsRoutes)
    app.use('/users', userRoutes);

}


main();

app.listen(3000, function () {
    console.log("Server has started");
})