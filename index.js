const express = require('express');
const app = express();
const port = 5000;
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());


// datbase connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.22xo3dn.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // databse collection
    const database = client.db("hospitalDB");
    const departmentsCollection = database.collection("departments");


    // GET: get all departments
    app.get("/api/departments", async (req, res) => {
      try {
        const result = await departmentsCollection.find().toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch departments", error });
      }
    });

    // POST : add department to the databse
    app.post("/api/departments", async (req, res) => {
      try {
        const department = req.body;
        console.log(department)
        const result = await departmentsCollection.insertOne(department);
        res.status(201).json({
          message: "Department added successfully",
          data: result,
        });
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to add department", error });
      }
    });

    // PUT: update a specific department 
    app.put("/api/departments/:id", async (req, res) => {
      const depId = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(depId) };
      const updated = await departmentsCollection.updateOne(query, {
        $set: {
          name: updateData.name,
          description: updateData.description,
          status: updateData.status,
        },
      });
      res.status(200).json({ message: "Department updated successfully!", data: updated });
    })


    // DELETE: delete specific item 
    app.delete("/api/departments/:id", async (req, res) => {
      const depId = req.params.id;
      console.log(depId)
      const query = { _id: new ObjectId(depId) };
      const result = await departmentsCollection.deleteOne(query);
      res.status(200).json({
        message: "Department deleted successfully",
        data: result,
      });

    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// root layout
app.get('/', (req, res) => {
  res.send('Server running successfully .....!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
