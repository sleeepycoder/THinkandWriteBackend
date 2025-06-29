import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarkedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for follower count - Fixed to handle undefined arrays
userSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count - Fixed to handle undefined arrays
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from output - Enhanced to handle virtual field errors
userSchema.methods.toJSON = function() {
  try {
    const userObject = this.toObject();
    delete userObject.password;
    
    // Ensure virtual fields are properly calculated
    if (!userObject.followerCount && typeof userObject.followerCount !== 'number') {
      userObject.followerCount = this.followers ? this.followers.length : 0;
    }
    if (!userObject.followingCount && typeof userObject.followingCount !== 'number') {
      userObject.followingCount = this.following ? this.following.length : 0;
    }
    
    return userObject;
  } catch (error) {
    console.error('Error in User toJSON:', error);
    // Return a safe fallback object
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      bio: this.bio || '',
      followerCount: 0,
      followingCount: 0,
      isVerified: this.isVerified || false,
      role: this.role || 'user',
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
};

export default mongoose.model('User', userSchema);