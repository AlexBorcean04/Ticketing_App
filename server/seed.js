const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect('mongodb://localhost:27017/ticket_db');

const events = [
  { title: "Rock Revolution", date: "2026-06-12", imageUrl: "https://placehold.co/600x400?text=Rock", seats: [] },
  { title: "Jazz Night", date: "2026-07-05", imageUrl: "https://placehold.co/600x400?text=Jazz", seats: [] },
  { title: "Tech Summit", date: "2026-08-20", imageUrl: "https://placehold.co/600x400?text=Tech", seats: [] }
];

// Function to generate 100 seats for each event
const generateSeats = () => {
  const seats = [];
  for (let i = 0; i < 100; i++) {
    seats.push({ id: `S${i}`, status: 'available', price: 50 });
  }
  return seats;
};

const seedDB = async () => {
  await Event.deleteMany({});
  const eventsWithSeats = events.map(e => ({ ...e, seats: generateSeats() }));
  await Event.insertMany(eventsWithSeats);
  console.log("Database Seeded!");
  process.exit();
};

seedDB();