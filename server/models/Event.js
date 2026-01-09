const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  id: String, // e.g., "A1"
  status: { 
    type: String, 
    enum: ['available', 'booked', 'selected', 'locked'], 
    default: 'available' 
  },
  category: String,
  price: Number
});

const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  imageUrl: String,
  seats: [seatSchema] // Array of all seats for this event
});

module.exports = mongoose.model('Event', eventSchema);