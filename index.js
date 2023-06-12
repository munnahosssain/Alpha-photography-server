const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized assess" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorize access" });
    }
    req.decoded = decode;
    next();
  });
};

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
    const studentCollection = client.db("alphaDB").collection("students");
    const instructorCollection = client.db("alphaDB").collection("instructors");
    const classesCollection = client.db("alphaDB").collection("classes");
    const myClassesCollection = client.db("alphaDB").collection("myClasses");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.get("/students", async (req, res) => {
      const result = await studentCollection.find().toArray();
      res.send(result);
    });

    app.get("/student", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/students", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exitingUser = await studentCollection.findOne(query);
      if (exitingUser) {
        return res.send({ message: "User Already Exist" });
      }
      const result = await studentCollection.insertOne(user);
      res.send(result);
    });

    app.get("/instructors", async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    });

    app.get("/homeInstructors", async (req, res) => {
      let sortOptions = { enrolled: -1 };
      const result = await instructorCollection
        .find()
        .limit(6)
        .sort(sortOptions)
        .toArray();
      res.send(result);
    });

    app.get("/student", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.post("/classes", async (req, res) => {
      const query = req.body;

      const result = await classesCollection.insertOne(query);
      res.send(result);
    });

    app.get("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    });

    app.patch("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedClasses = req.body;
      const updateClass = {
        $set: {
          ...updatedClasses,
        },
      };
      const result = await classesCollection.updateOne(query, updateClass,{upsert:true});
      res.send(result);
    });

    app.get("/myClass", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await classesCollection.find(query).toArray();
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

    app.get("/myClasses", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await myClassesCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/myClasses", async (req, res) => {
      const course = req.body;
      const result = await myClassesCollection.insertOne(course);
      res.send(result);
    });

    app.delete("/myClasses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myClassesCollection.deleteOne(query);
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
