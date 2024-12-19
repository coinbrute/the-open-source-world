const mongoose = require('mongoose');

const geocodeSchema = new mongoose.Schema({
  location: { type: String, unique: true, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // Expires after 30 days
});

module.exports = mongoose.model('Geocode', geocodeSchema);