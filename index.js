const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("portraits tourer server is running");
});

app.listen(port, () => {
  console.log(`portraits tourer server running on ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pepm1no.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client
      .db("portraitsTourer")
      .collection("services");

    const reviewCollection = client.db("portraitsTourer").collection("reviews");

    app.post("/jwt", verifyJWT, (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.get("/limitservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const limitServices = await cursor.limit(3).toArray();
      res.send(limitServices);
    });

    app.post("/allservices", verifyJWT, async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const allServices = await cursor.toArray();
      res.send(allServices);
    });

    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // all review get

    app.post("/reviews", verifyJWT, async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // single review email filter

    app.get("/reviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const allReviews = await cursor.toArray();
      res.send(allReviews);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id: id };
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    // delete method

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = reviewCollection.deleteOne(query);
      res.send(result);
    });

    // update method

    // app.patch('/reviews/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const message = req.params.message;
    //   const query = { _id: ObjectId(id) };
    //   const updateDocument = {
    //     $set: {
    //       message: message,
    //     },
    //   };
    //   const result = await reviewCollection.updateOne(query, updateDocument);
    //   res.send(result);
    // });
  } finally {
  }
}

run().catch((err) => console.error(err));
