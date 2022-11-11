const express = require("express");
const cors = require("cors");
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
async function run() {
  try {
    const serviceCollection = client
      .db("portraitsTourer")
      .collection("services");

    const reviewCollection = client.db("portraitsTourer").collection("reviews");

    app.get("/limitservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const limitServices = await cursor.limit(3).toArray();
      res.send(limitServices);
    });

    app.post("/allservices", async (req, res) => {
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

    // single review email filter

    app.get("/reviews", async (req, res) => {
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
  } finally {
  }
}

run().catch((err) => console.error(err));
