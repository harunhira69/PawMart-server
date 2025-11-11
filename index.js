const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Correct MongoDB URI with admin authentication
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.irtmkrl.mongodb.net/?authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db('PawMart');
    const productsCollection = db.collection('Products');
    const orderCollection = db.collection('order');
    const listingsCollection = db.collection('Listings');


    console.log('✅ Connected to MongoDB → Database: PawMart');

    const collections = await db.listCollections().toArray();
    console.log('📦 PawMart Collections:', collections.map(c => c.name));

    // ------------------ ROUTES ------------------

    // Get all products
    app.get('/Products', async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();
        console.log(`✅ Sent ${products.length} products from PawMart.Products`);
        res.send(products);
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
      }
    });

    // add listing product
 app.post('/Listings', async (req, res) => {
  try {
    const listing = req.body;
    listing.createdAt = new Date();

    const result = await listingsCollection.insertOne(listing); // ✅ correct
    console.log(result)

    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add listing' });
  }
});

// show listing details
app.get('/item/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let item = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      item = await listingsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!item) {
      return res.status(404).send({ message: 'Item Not Found' });
    }

    res.send(item);
  } catch (err) {
    res.status(500).send({ message: 'Failed to Fetch' });
  }
});
// submit order

app.post('/order',async(req,res)=>{
 try{
   const order = req.body;
  // console.log(order)
  order.createdAt = new Date();
  const result = await orderCollection.insertOne(order);
  // console.log('after order insert',result)
  res.status(200).send({message:'Order placed successfully'})
 }catch(err){
  res.status(500).send({message:'Failed to Submit Oredr',err})
 }

});

// get my-order page
app.get('/order',async(req,res)=>{
     const email = req.query.email;
    console.log(email);
    if(!email)return res.status(400).send({message:'Email is required'})
  try{
 
   const orders = await orderCollection.find({buyerEmail:email}).toArray();
   console.log(orders)
   res.send(orders);
  }catch(err){
    res.send(err)
  }
})




// pets @ supplies page
app.get('/all-item',async(req,res)=>{
  try{
    const products = await productsCollection.find({}).toArray();
    const listings = await listingsCollection.find({}).toArray();

    const allItem = [...products,...listings]
    res.send(allItem)
  }catch(err){
    res.status(500).send({message:'Failed to fetch all items'})
  }
})


    // Get products by category
app.get('/Products/:category', async (req, res) => {
  const category = decodeURIComponent(req.params.category).trim();
  const products = await productsCollection
    .find({ category: category }) // exact match since names now match
    .toArray();
  res.send(products);
});

//  latest 6 listings (sorted by newest)
app.get('/recent-listings', async (req, res) => {
  try {
    const listings = await productsCollection
      .aggregate([{ $sample: { size: 6 } }])
      .toArray();

    res.send(listings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recent listings" });
  }
});



app.get('/myOrder', async (req,res)=>{
   try {
        const order = await orderCollection.find({}).toArray();
        console.log(`✅ Sent ${order.length} products from PawMart.Products`);
        res.send(order);
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
      }

})


  } catch (err) {
    console.error('🚨 MongoDB Connection Error:', err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
