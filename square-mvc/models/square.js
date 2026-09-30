const mongoose = require('mongoose');

const squareSchema = new mongoose.Schema(
  {
    sideLength: {
      type: Number,
      required: true,
      min: 0,
    },
    perimeter: {
      type: Number,
      required: true,
      min: 0,
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Square', squareSchema);
