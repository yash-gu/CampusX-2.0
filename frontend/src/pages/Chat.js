import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import io from 'socket.io-client';

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversationId = searchParams.get('conversation');

  useEffect(() => {
    fetchConversations();
    
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('new_message', (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setMessages(prev => [...prev, data.message]);
      }
      fetchConversations();
    });

    newSocket.on('user_typing', (data) => {
      if (data.conversationId === selectedConversation?._id && data.userId !== user.id) {
        setTypingUsers(prev => new Set(prev).add(data.userName));
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userName);
            return newSet;
          });
        }, 3000);
      }
    });

    newSocket.on('error', (data) => {
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId);
      if (conversation) {
        selectConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data.conversations);
      setLoading(false);
    } catch (error) {
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const res = await api.get(`/api/chat/${conversation._id}`);
      setMessages(res.data.conversation.messages);
      
      if (socket) {
        socket.emit('join_conversation', conversation._id);
      }
    } catch (error) {
      setError('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      socket.emit('send_message', {
        conversationId: selectedConversation._id,
        text: messageText
      });
    } catch (error) {
      setError('Failed to send message');
      setNewMessage(messageText);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && socket && selectedConversation) {
      setIsTyping(true);
      socket.emit('typing_start', { conversationId: selectedConversation._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socket && selectedConversation) {
        setIsTyping(false);
        socket.emit('typing_stop', { conversationId: selectedConversation._id });
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user.id);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bennett-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bennett-blue mb-2">Nexus</h1>
        <p className="text-gray-600">Connect with Bennett University students</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex h-96 lg:h-[600px]">
          <div className="w-full lg:w-1/3 border-r">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet. Start chatting from the marketplace!
                </div>
              ) : (
                conversations.map(conversation => {
                  const otherUser = getOtherParticipant(conversation);
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-bennett-blue rounded-full flex items-center justify-center text-white font-semibold">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage ? conversation.lastMessage.text : 'No messages yet'}
                          </p>
                        </div>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:w-2/3">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-bennett-blue rounded-full flex items-center justify-center text-white font-semibold">
                      {getOtherParticipant(selectedConversation).name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherParticipant(selectedConversation).name}
                      </h3>
                      {selectedConversation.productId && (
                        <p className="text-sm text-gray-500">
                          About: {selectedConversation.productId.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-8rem)]">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender._id === user.id
                              ? 'bg-bennett-blue text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender._id === user.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {typingUsers.size > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                          <p className="text-sm italic">
                            {Array.from(typingUsers).join(', ')} {typingUsers.size > 1 ? 'are' : 'is'} typing...
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="flex-1 input-field"
                      maxLength="500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="btn-primary disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden mt-4">
        {selectedConversation && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-bennett-blue rounded-full flex items-center justify-center text-white font-semibold">
                {getOtherParticipant(selectedConversation).name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getOtherParticipant(selectedConversation).name}
                </h3>
              </div>
            </div>
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 input-field"
                maxLength="500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-primary disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
