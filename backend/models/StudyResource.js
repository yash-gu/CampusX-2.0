import mongoose from 'mongoose';

const StudyResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    maxlength: [10, 'Course code cannot exceed 10 characters'],
    uppercase: true
  },
  professor: {
    type: String,
    required: [true, 'Professor name is required'],
    maxlength: [50, 'Professor name cannot exceed 50 characters']
  },
  resourceType: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: ['Notes', 'Assignment', 'Lab Report', 'Previous Paper', 'Reference Material', 'Other']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  downloads: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }]
}, {
  timestamps: true
});

StudyResourceSchema.index({ courseCode: 1, createdAt: -1 });
StudyResourceSchema.index({ professor: 1, createdAt: -1 });
StudyResourceSchema.index({ uploader: 1, createdAt: -1 });
StudyResourceSchema.index({ averageRating: -1 });
StudyResourceSchema.index({ 'ratings.user': 1 });

StudyResourceSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  return this.save();
};

export default mongoose.model('StudyResource', StudyResourceSchema);
