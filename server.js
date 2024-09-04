const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// Replace with your MongoDB connection string
const uri = 'mongodb://localhost:27017';  // Use your connection string from Compass
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.single('officerIdProof'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Register Route
app.post('/register', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('railway');
        const collection = db.collection('officers');
        
        const officerData = {
            officerId: req.body.officerId,
            officerName: req.body.officerName,
            officerIdProof: req.file ? req.file.path : null,
            stationCode: req.body.stationCode,
            stationName: req.body.stationName,
            stationCity: req.body.stationCity,
            username: req.body.username,
            password: req.body.password
        };

        await collection.insertOne(officerData);
        res.send({ success: true, message: 'Officer registered successfully!' });
    } catch (error) {
        console.error('Error inserting document:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('railway');
        const collection = db.collection('officers');

        const { username, password } = req.body;

        // Check if user exists
        const officer = await collection.findOne({ username: username, password: password });

        if (officer) {
            res.send({ success: true, message: 'Login successful' });
        } else {
            res.status(401).send({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error finding document:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
