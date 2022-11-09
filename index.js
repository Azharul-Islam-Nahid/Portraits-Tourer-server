const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    app.get("/limitservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const limitServices = await cursor.limit(3).toArray();
      res.send(limitServices);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));
