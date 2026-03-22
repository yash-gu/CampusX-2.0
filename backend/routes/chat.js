import express from 'express';
import { body, validationResult } from 'express-validator';
import Chat from '../models/Chat.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'name profilePic enrollmentNo')
    .populate('lastMessage.sender', 'name profilePic')
    .populate('productId', 'title price')
    .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.conversationId)
      .populate('participants', 'name profilePic enrollmentNo')
      .populate('messages.sender', 'name profilePic')
      .populate('productId', 'title price seller image');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to view this conversation' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/start', [
  auth,
  body('participantId').notEmpty().withMessage('Participant ID required'),
  body('productId').optional().isMongoId().withMessage('Valid product ID required'),
  body('initialMessage').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantId, productId, initialMessage } = req.body;

    if (participantId === req.user.id) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      ...(productId && { productId })
    });

    if (chat) {
      return res.status(400).json({ message: 'Conversation already exists' });
    }

    const message = {
      sender: req.user.id,
      text: initialMessage,
      timestamp: new Date()
    };

    chat = new Chat({
      participants: [req.user.id, participantId],
      messages: [message],
      lastMessage: message,
      productId: productId || null
    });

    await chat.save();
    await chat.populate('participants', 'name profilePic enrollmentNo');
    await chat.populate('messages.sender', 'name profilePic');

    res.status(201).json({ conversation: chat });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
