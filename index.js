const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000
const cors = require('cors');

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://DB_USER:DB_PASS@cluster0.irtmkrl.mongodb.net/?appName=Cluster0";

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
   
    await client.connect();
    const database = client.db('PawMart');
    const productsCollection = database.collection('Products')

    app.get('/Products', async(req,res)=>{
     try{
      const products = await productsCollection.find({}).toArray();
      res.status(200).json(products)
     }
     catch(err){
       res.status(500).json({ error: 'Failed to fetch products' });
     }

    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
