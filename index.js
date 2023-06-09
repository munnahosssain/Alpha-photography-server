const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tgbgt3c.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();
    const usersCollection = client.db("alphaDB").collection("users");
    const instructorsCollection = client
      .db("alphaDB")
      .collection("instructors");
    const classesCollection = client.db("alphaDB").collection("classes");

    app.post("/users", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.insertOne(query);
      res.send(result);
    });

    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    });

    app.get("/homeInstructors", async (req, res) => {
      let sortOptions = { enrolled: -1 };
      const result = await instructorsCollection
        .find()
        .limit(6)
        .sort(sortOptions)
        .toArray();
      res.send(result);
    });

    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.get("/popularClasses", async (req, res) => {
      const sortOptions = { students: -1 };
      const result = await classesCollection
        .find()
        .limit(6)
        .sort(sortOptions)
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Alpha photography app listening on port ${port}`);
});
