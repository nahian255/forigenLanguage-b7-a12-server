const express = require('express')
const app = express()
require('dotenv').config();
const cors = require('cors')
const port = process.env.port || 3000;

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());

// console.log(process.env.DB_USER);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = "mongodb+srv://dbuserNahian2:xF1hbjSPZPg@cluster0.lyu30gb.mongodb.net/?retryWrites=true&w=majority";

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}cluster0.lyu30gb.mongodb.net/?retryWrites=true&w=majority`;

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
        const firstCollection = client.db('a-12').collection('first')
        const usersCollection = client.db('a-12').collection('users')

        app.get('/first', async (req, res) => {
            res.send(await firstCollection.find().toArray())
        })


        // get all users
        app.get('/users', async (req, res) => {
            res.send(await usersCollection.find().toArray())
        })

        // make admin
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        });

        // admin cheacking...
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const result = { admin: user?.role === 'admin' }
            res.send(result)
        })

        // save user ... 
        app.post('/user', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'alredy existe' })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        });




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World! and hello from everyone..')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})