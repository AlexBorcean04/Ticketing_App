const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/Event');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/ticket_db')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Get all events for the Admin/List view
app.get('/api/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Get a specific event for the Customer Map
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json(event);
  } catch (err) {
    res.status(404).json({ message: "Event not found" });
  }
});

app.post('/api/events', async (req, res) => {
  const newEvent = new Event(req.body);
  await newEvent.save();
  res.status(201).json(newEvent);
});

// Logic to permanently book seats
app.post('/api/events', async (req, res) => {
    try {
      const { title, date } = req.body;
      
      // Generate a default grid of 100 seats (10x10)
      const generatedSeats = [];
      for (let i = 1; i <= 100; i++) {
        generatedSeats.push({
          id: `s${i}`,
          row: Math.ceil(i / 10),
          number: i % 10 || 10,
          status: 'available',
          price: 50,
          // Calculate X and Y positions for the SVG map
          x: (i % 10 || 10) * 60 + 200, 
          y: Math.ceil(i / 10) * 50 + 100
        });
      }
  
      const newEvent = new Event({
        title,
        date: date || "2026-12-01",
        seats: generatedSeats
      });
  
      await newEvent.save();
      res.status(201).json(newEvent);
    } catch (err) {
      res.status(500).json({ message: "Error creating event", error: err });
    }
  });
// Delete an event by ID
// Add this near your other routes (like app.get or app.post)
app.delete('/api/events/:id', async (req, res) => {
    try {
      const deletedEvent = await Event.findByIdAndDelete(req.params.id);
      if (!deletedEvent) return res.status(404).send("Event not found");
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
      res.status(500).json(err);
    }
  });
io.on('connection', (socket) => {
  socket.on('select_seat', (data) => {
    socket.broadcast.emit('seat_locked', data);
  });
});

server.listen(5000, () => console.log('🚀 Server running on port 5000'));