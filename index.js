const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000
require('dotenv').config()
const app = express()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w4nr9w8.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.use(cors())
app.use(express.json())

app.get("/", (req, res)=>{
    res.send("Coffee server is getting hotter")
})
async function run() {
  try {
      // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeesCollection = client.db("coffeedb").collection("coffees")
    const usersCollection = client.db("coffeedb").collection("users")

    app.get("/coffees", async(req,res)=>{

        const result = await coffeesCollection.find().toArray()
        res.send(result)
    })
    app.get("/coffees/:id", async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await coffeesCollection.findOne(query)
      res.send(result)
    })
    app.get("/users",async(req, res)=>{
        const result = await usersCollection.find().toArray()
        console.log(result)
        res.send(result)
    })
    app.post("/coffees", async(req, res)=>{
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeesCollection.insertOne(newCoffee)
      res.send(result)
    })

    app.post("/users", async(req, res)=>{
      const userProfile = req.body;
      const result = await usersCollection.insertOne(userProfile);
      res.send(result)
    })

    app.put("/coffees/:id", async(req,res)=>{
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const updatedCoffee = req.body
      const options = {upsert: true}
      const document = {
        $set: updatedCoffee
      }
      const result = await coffeesCollection.updateOne(filter, document, options)
      res.send(result)
    })
    app.patch("/users", async(req, res)=>{
      const {email, lastSignInTime}= req.body

      const updatedDoc = {
        $set:{
          lastSignInTime: lastSignInTime
        }
      } 
      const filter = {email:email}
      const result = await usersCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    app.delete("/coffees/:id", async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await coffeesCollection.deleteOne(query)
      console.log("deleted");
      res.send(result)
    })
    app.delete("/users/:id", async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    })
  
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
app.listen(port, ()=>{
    console.log(`app is listening on port ${port}`);
})
run().catch(console.dir);
