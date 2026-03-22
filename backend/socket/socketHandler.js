import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

    socket.userId = socket.user.id;

    socket.join(`user_${socket.userId}`);

    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Chat.findById(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation_${conversationId}`);
        socket.currentConversation = conversationId;
        
        socket.emit('joined_conversation', { conversationId });
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text } = data;

        if (!text || text.trim().length === 0) {
          socket.emit('error', { message: 'Message text is required' });
          return;
        }

        if (text.length > 500) {
          socket.emit('error', { message: 'Message cannot exceed 500 characters' });
          return;
        }

        const conversation = await Chat.findById(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
          return;
        }

        const message = {
          sender: socket.userId,
          text: text.trim(),
          timestamp: new Date()
        };

        conversation.messages.push(message);
        conversation.lastMessage = message;
        await conversation.save();

        await conversation.populate('messages.sender', 'name profilePic');

        const populatedMessage = conversation.messages[conversation.messages.length - 1];

        io.to(`conversation_${conversationId}`).emit('new_message', {
          conversationId,
          message: populatedMessage
        });

        conversation.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            io.to(`user_${participantId}`).emit('notification', {
              type: 'new_message',
              conversationId,
              sender: socket.user.name,
              message: text.trim()
            });
          }
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          isTyping: false
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user.id})`);
    });
  });
};

export default socketHandler;
