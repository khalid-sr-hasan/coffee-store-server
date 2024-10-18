require("dotenv").config();
// const express = require("express");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// coffeeStore
// vVr5ojFB4s6sl7xC

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xoels.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("coffeeStoreDB");
        const coffeeCollection = database.collection("coffeeCollection");
        const userCollection = client.db("coffeeStoreDB").collection("user");

        // create get method to get all data from database
        app.get("/coffees", async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // create get method to get single data from database
        app.get("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        });

        //create coffee info with post method
        app.post("/coffees", async (req, res) => {
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee);
            console.log("coffeeCollection", newCoffee);
            res.send(result);
        });

        // create update method
        app.put("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const coffeesInfo = req.body;
            console.log(coffeesInfo);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            const updateCoffeesInfo = {
                $set: {
                    ...coffeesInfo,
                },
            };
            const result = await coffeeCollection.updateOne(
                filter,
                updateCoffeesInfo,
                options
            );

            res.send(result);
        });

        // create delete method
        app.delete("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log(id);
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        });

        // get user apis collection

        // get user all data
        app.get("/users", async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // create user post method
        app.post("/users", async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.send(result);
        });

        // user update patch method
        app.patch("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: {
                    lastLogAt: user.lastLogAt,
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);

            res.send(result);
        });

        // create user delete method
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("coffee store is running");
});

app.listen(port, () => {
    console.log("server is running PORT :", port);
});
