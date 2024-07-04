const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // npm package for UUIDs

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Serve static assets from the public directory
app.use(express.static('public'));

// Route to serve notes.html
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Route to serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});

// Route to read db.json and return all notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname,  'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read data from db.json' });
            return;
        }
        try {
            const notes = JSON.parse(data);
            res.json(notes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to parse data from db.json' });
        }
    });
});

// Route to receive new note and save it to db.json
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    if (!title || !text) {
        res.status(400).json({ error: 'Please include both title and text for the note' });
        return;
    }

    fs.readFile(path.join(__dirname, 'db','db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read data from db.json' });
            return;
        }

        try {
            const notes = JSON.parse(data);
            const newNote = {
                id: uuidv4(), // Generate unique ID
                title,
                text
            };
            notes.push(newNote);

            // Write updated notes array back to db.json
            fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to write data to db.json' });
                    return;
                }
                res.json(newNote);
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to parse data from db.json' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});