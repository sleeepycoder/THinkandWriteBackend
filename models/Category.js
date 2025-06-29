import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    enum: ['Technology', 'Design', 'Marketing', 'Business', 'Health', 'Travel']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    default: '#10B981' // emerald-500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for article count
categorySchema.virtual('articleCount', {
  ref: 'Article',
  localField: 'name',
  foreignField: 'category',
  count: true
});

export default mongoose.model('Category', categorySchema);