const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ratingSchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const addressSchema = new mongoose.Schema({
  province: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  street: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { String, required: true},
  profilePicture: String,
  
  addresses: [addressSchema],
  
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },

  banDetails: {
    reason: { type: String },
    bannedUntil: { type: Date } 
  },
  sellerCancellationReason: { type: String },
  shopName: { type: String, trim: true, unique: true, sparse: true }, 
  sellerStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected', 'cancellation_pending'],
    default: 'none'
  },
}, { timestamps: true });



userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);