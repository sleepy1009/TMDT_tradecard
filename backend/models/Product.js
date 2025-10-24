const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  category: { 
    type: String, 
    required: true, 
    enum: ['pokemon', 'yugioh', 'boardgame', 'other'] 
  },
  condition: { 
    type: String, 
    required: true, 
    enum: ['new', 'like-new', 'used', 'damaged'] 
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  status: {
    type: String,
    required: true,
    enum: ['active', 'sold', 'hidden_by_seller', 'removed_by_admin'],
    default: 'active'
  },

  saleType: { 
    type: String, 
    required: true, 
    enum: ['buy-now', 'auction'] 
  },
  price: { type: Number, required: true }, 

  auctionEndDate: { type: Date },
  currentBid: { type: Number },
  bids: [bidSchema],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  tags: [String],
  stock: { type: Number, default: 1 },

}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);