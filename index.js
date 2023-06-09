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
        const instructorClassCollection = client.db('a-12').collection('instructorClass')
        const adminAprovClassCollection = client.db('a-12').collection('adminAprovClass')
        const selectedClassCollection = client.db('a-12').collection('selectedClass')

        // app.get('/first', async (req, res) => {
        //     res.send(await firstCollection.find().toArray())
        // })


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
        });

        // make Instractor ... 
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'instructor'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        });

        //  Instractor cheacking
        app.get('/users/instructor/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const result = { instructor: user?.role === 'instructor' }
            res.send(result)
        });

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

        // save instructor class... 
        app.post('/insturctor-class', async (req, res) => {
            const insturctorClass = req.body
            const result = await instructorClassCollection.insertOne(insturctorClass)
            res.send(result);
        });

        //get all instructor class in manageUser (admin)
        app.get('/manage-classes', async (req, res) => {
            res.send(await instructorClassCollection.find().toArray())
        });

        //get instructor class by email...
        app.get('/manage-classes/:email', async (req, res) => {
            const email = req.params.email
            console.log(email);
            const query = { instructorEmail: email }
            const result = await instructorClassCollection.find(query).toArray()
            res.send(result)
        })

        // save admin aproved class... 
        app.post('/admin-aprove-class', async (req, res) => {
            const adminClass = req.body
            const result = await adminAprovClassCollection.insertOne(adminClass)
            res.send(result);
        });

        // get all clss that approved by admin
        app.get('/approved-classes', async (req, res) => {
            res.send(await adminAprovClassCollection.find().toArray())
        });

        // selected classes by studernt
        app.post('/class-selected', async (req, res) => {
            const selectClass = req.body;
            const result = await selectedClassCollection.insertOne(selectClass)
            res.send(result);
        });

        // get all selected classes
        app.get('/class-selected/:email', async (req, res) => {
            const email = req.params.email
            const query = { userEmail: email }
            res.send(await selectedClassCollection.find(query).toArray())
        });



        //delete a  selected class
        app.delete('/class/:id', async (req, res) => {
            const id = req.params.id
            console.log('why not', id);
            const query = { _id: new ObjectId(id) }
            const result = await selectedClassCollection.deleteOne(query)
            res.send(result);
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