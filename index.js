const express = require('express');
require('dotenv').config();
const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FIREBASE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);


const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());
const verifyFireBaseToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "Unauthorized access: no token" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.token_email = decoded.email; // attach email to request
    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return res.status(401).send({ message: "Unauthorized access: invalid token" });
  }
};



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.irtmkrl.mongodb.net/?authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get('/', (req, res) => {
  res.send('successfully connected')
})

async function run() {
  try {
    // await client.connect();

    const db = client.db('PawMart');
    const productsCollection = db.collection('Products');
    const orderCollection = db.collection('order');
    const listingsCollection = db.collection('Listings');


    // console.log('✅ Connected to MongoDB → Database: PawMart');

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

    const result = await listingsCollection.insertOne(listing); 
    console.log(result)

    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add listing' });
  }
});
// get listing product
app.get('/my-listings',async(req,res)=>{
  try{
    const email = req.query.email;
    if(!email) return res.status(400).send({message:'Email required'})
      const listings = await listingsCollection.find({email}).toArray();
      res.send(listings)
  }catch(err){
    res.status(500).send({message:'Failed to Fetch'})
  }
});
// Update My listing
app.put('/my-listings/:id',verifyFireBaseToken,async(req,res)=>{
  try{
    const id = req.params.id;
    const updateData = req.body;

    const result = await listingsCollection.findOneAndUpdate(
      {_id:new ObjectId(id)},
      {
        $set: updateData
      },
      { returnDocument:'after'}
    );
    console.log(result)
    if(result && result.value){
      res.send(result.value)
    }else{
      res.status(404).send({message:'Not Found'})
    }
  }catch(err){
    res.send(err)
  }
});

// Delete My Listing
app.delete('/my-listings/:id',verifyFireBaseToken,async(req,res)=>{
  try{
    const {id} = req.params;
    const result = await listingsCollection.deleteOne(
      {_id:new ObjectId(id)}
    );
    if(result.deletedCount>0){
      res.send({message:'Delete Successfully'})
    }else{
      res.send({message:'Not Found'})
    }

  }catch(err){
    res.status(500).send({message:'Falied To Delete Listing'})
  }
})

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
});

// delete Order
app.delete('/order/:id',async(req,res)=>{
  try{
    const {id} = req.params;
    const result = await orderCollection.deleteOne(
      {_id:new ObjectId(id)}
    );
    if(result.deletedCount>0){
      res.send({message:'Delete Successfully'})
    }else{
      res.send({message:'Not Found'})
    }

  }catch(err){
    res.status(500).send({message:'Falied To Delete Listing'})
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

module.exports = app;
