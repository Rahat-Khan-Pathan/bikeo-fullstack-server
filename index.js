const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const objectId = require("mongodb").ObjectId;

// Set MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2spjz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const run = async () => {
    try {
        await client.connect();
        const database = client.db("bikeo");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const reviewsCollection = database.collection("reviews");
        const contactsCollection = database.collection("contacts");
        const userssCollection = database.collection("users");

        // Add product by admin
        app.post("/addService", async (req, res) => {
            const data = req.body;
            const result = productsCollection.insertOne(data);
            res.json({ res: " " });
        });
        // Get all products
        app.get("/products", async (req, res) => {
            const divide = req.query.numbers;
            const allOffers = await productsCollection
                .find({})
                .limit(parseInt(divide));
            const convertedOffers = await allOffers.toArray();
            res.json(convertedOffers);
        });
        // Get all reviews
        app.get("/reviews", async (req, res) => {
            const allOffers = await reviewsCollection.find({});
            const convertedOffers = await allOffers.toArray();
            res.json(convertedOffers);
        });
        // Check admin
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const result = await userssCollection.findOne({ userEmail: email });
            let admin = null;
            if (result?.role === "admin") admin = true;
            else if (result?.role === "user") admin = false;
            if (admin !== null) res.json({ admin: admin });
        });
        // update user
        app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { userEmail: user.userEmail };
            const check = await userssCollection.findOne(filter);
            if (check === null) {
                const options = { upsert: true };
                const updateDoc = { $set: user };
                const result = await userssCollection.updateOne(
                    filter,
                    updateDoc,
                    options
                );
                res.json(result);
            }
        });
        // Add admin
        app.put("/users/admin", async (req, res) => {
            const email = req.body.email;
            const filter = { userEmail: email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userssCollection.updateOne(filter, updateDoc);
            res.json(result.modifiedCount);
        });
        // Get clicked product details
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const searchedOffer = await productsCollection.findOne({
                _id: objectId(id),
            });
            res.json(searchedOffer);
        });
        // Insert new booking
        app.post("/bookProduct", async (req, res) => {
            const data = req.body;
            const result = await ordersCollection.insertOne(data);
            res.json(result.acknowledged);
        });
        // Insert new review
        app.post("/addReview", async (req, res) => {
            const data = req.body;
            const result = await reviewsCollection.insertOne(data);
            res.json(result.acknowledged);
        });
        //check if an offer is booked or not
        app.get("/bookProduct", async (req, res) => {
            const userEmail = req.query.userEmail;
            const id = req.query.id;
            if (userEmail != undefined && id !== "undefined") {
                const result = await ordersCollection.findOne({
                    userEmail: userEmail,
                    productId: id,
                });
                if (result) res.json({ res: " " });
                else res.json({ res: "" });
            }
        });
        // Get my orders
        app.get("/allOrders/:userEmail", async (req, res) => {
            const userEmail = req.params.userEmail;
            const result = await ordersCollection.find({
                userEmail: userEmail,
            });
            const convertedOrders = await result.toArray();
            res.json(convertedOrders);
        });
        // Delete a booking
        app.delete("/allOrders", async (req, res) => {
            const deleteId = req.body.deleteId;
            const result = await ordersCollection.deleteOne({
                _id: objectId(deleteId),
            });
            res.json({ res: " " });
        });
        // Delete a product
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const result = await productsCollection.deleteOne({
                _id: objectId(id),
            });
            res.json({ res: " " });
        });
        // Get all orders
        app.get("/allOrders", async (req, res) => {
            const result = await ordersCollection.find({});
            const convertedOrders = await result.toArray();
            res.json(convertedOrders);
        });
        // Update status of a booking by admin
        app.put("/allOrders", async (req, res) => {
            const updateId = req.body.updateId;
            const status = req.body.status;
            const filter = { _id: objectId(updateId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status,
                },
            };
            const result = await ordersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json({ res: " " });
        });
        // Insert contact message
        app.post("/contact", async (req, res) => {
            const contactData = req.body;
            const result = await contactsCollection.insertOne(contactData);
            res.json({ res: " " });
        });
    } finally {
        // client.close();
    }
};
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Node server opened");
});
app.listen(port, () => {
    console.log("Listening", port);
});

module.exports = app;
