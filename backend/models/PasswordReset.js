import mongoose from 'mongoose';

const PasswordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000) // 1 hour from now
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

PasswordResetSchema.index({ token: 1 });
PasswordResetSchema.index({ user: 1 });
// Remove duplicate expiresAt index - it's already handled by expireAfterSeconds

// Auto-delete expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PasswordReset', PasswordResetSchema);
