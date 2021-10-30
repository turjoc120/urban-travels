const express = require('express')
const cors = require("cors")
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const { ObjectID } = require('bson');
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express()

// middlewares 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sg7vl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    await client.connect();
    const database = client.db("urbanDB");
    const dealsCollection = database.collection("dealsCollection");
    const ordersCollection = database.collection("ordersCollection");

    // get all offers 
    app.get("/deals", async (req, res) => {
        const result = await dealsCollection.find({}).toArray()
        res.json(result)
    })

    // get a single one 
    app.get("/deals/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectID(id) }
        const result = await dealsCollection.findOne(query)
        res.json(result)
    })

    // add new one 
    app.post('/addOffers', async (req, res) => {
        const result = await dealsCollection.insertOne(req.body)
        res.json(result)
    })

    // add to booking 
    app.post('/deals/booking', async (req, res) => {
        const details = req.body;
        const result = await ordersCollection.insertOne(details)
        res.json(result)
    })

    // get users bookings 
    app.get('/mybookings/:email', async (req, res) => {
        const query = { email: req.params.email }
        const result = await ordersCollection.find(query).toArray()
        res.json(result)
    })

    // delete user booking 
    app.delete('/mybookings/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await ordersCollection.deleteOne(query)
        res.json(result)
    })

    // get all orders 
    app.get('/allorders', async (req, res) => {
        const result = await ordersCollection.find({}).toArray()
        res.json(result)
    })

    // update order status
    app.put("/booking/update/:id", async (req, res) => {
        const data = req.body
        const updateOrder = {
            $set: {
                status: data.status
            },
        }
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const options = { upsert: true };
        const result = await ordersCollection.updateOne(filter, updateOrder, options)
        res.json(result)

    })



}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.json('running the URBAN TRAVELS server')
})

app.listen(port, () => {
    console.log("listening to the port ", port);
})