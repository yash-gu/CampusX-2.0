import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['Club Meeting', 'Hackathon', 'Sports Tryout', 'Workshop', 'Seminar', 'Cultural Event', 'Academic Deadline', 'Other']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  rsvps: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['interested', 'going'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ creator: 1, createdAt: -1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ 'rsvps.user': 1 });

export default mongoose.model('Event', EventSchema);
