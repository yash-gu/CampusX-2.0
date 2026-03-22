# 🎓 CampusX - Bennett University Social Platform

A comprehensive MERN stack social platform designed exclusively for Bennett University students, featuring social networking, marketplace, real-time chat, event management, and academic resource sharing.

## ✨ Features

### 📱 **Social Features**
- **The Buzz** - Social feed with posts, likes, comments, and image uploads
- **Nexus** - Real-time chat with typing indicators and private messaging
- **Profile Management** - Customizable profiles with avatar uploads

### 🛍️ **Marketplace** 
- **Unimart** - Student-to-student marketplace for books, electronics, and more
- Product categories, search, and filtering
- Direct seller contact via integrated chat
- Image uploads for products

### 📅 **Campus Calendar**
- Event creation and management
- RSVP system (Interested/Going)
- ICS file generation for Google/Apple Calendar
- Event filtering and search

### 📚 **Study Vault**
- Peer-to-peer academic resource sharing
- Course code and professor filtering
- 5-star rating system for resources
- Download tracking and file management

### 🔐 **Security & Authentication**
- Bennett University email verification (@bennett.edu.in only)
- JWT-based authentication
- Secure password hashing with bcryptjs
- Role-based access control

## 🛠️ Tech Stack

### **Backend**
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### **Frontend**
- **React.js** with functional components
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **Tailwind CSS** for styling
- **React Context API** for state management

### **Database**
- **MongoDB** for flexible document storage
- **Collections**: Users, Posts, Products, Events, StudyResources, Chat

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/campusx.git
cd campusx
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**
```bash
# In backend directory
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

5. **Start the development servers**

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 📱 Usage

### **Registration**
1. Visit http://localhost:3000
2. Click "Get Started"
3. Register with your @bennett.edu.in email
4. Fill in your academic details (branch, year, enrollment number)

### **Key Features**
- **Social Feed**: Share updates, like and comment on posts
- **Marketplace**: Buy/sell items with the Bennett community
- **Chat**: Real-time messaging with other students
- **Calendar**: Create and RSVP to campus events
- **Study Vault**: Share and rate academic resources

## 🏗️ Project Structure

```
CampusX/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── socket/          # Socket.io handlers
│   ├── config/          # Database configuration
│   ├── uploads/         # File uploads
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context
│   │   └── utils/       # Utility functions
│   └── public/
├── docker-compose.yml   # Docker development setup
└── README.md
```

## 🐳 Docker Support

### **Development**
```bash
docker-compose up
```

### **Production**
```bash
# Build images
docker build -t campusx-backend ./backend
docker build -t campusx-frontend ./frontend

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up
```

## 🌐 Deployment

### **AWS ECS**
See [README-AWS-DEPLOYMENT.md](./README-AWS-DEPLOYMENT.md) for complete AWS deployment guide.

### **Other Platforms**
- **Vercel** (Frontend only)
- **Heroku** (Backend with MongoDB Atlas)
- **DigitalOcean** (Docker droplets)
- **Netlify** (Static frontend)

## 📊 API Documentation

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Social Feed**
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment

### **Marketplace**
- `GET /api/products` - Get products
- `POST /api/products` - Create product listing
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Chat**
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/start` - Start new conversation
- `GET /api/chat/:id` - Get conversation messages

### **Calendar**
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `PUT /api/events/:id/rsvp` - RSVP to event
- `GET /api/events/:id/calendar` - Download ICS file

### **Study Vault**
- `GET /api/study-resources` - Get study resources
- `POST /api/study-resources` - Upload resource
- `PUT /api/study-resources/:id/rating` - Rate resource
- `PUT /api/study-resources/:id/download` - Track download

## 🔧 Configuration

### **Environment Variables**

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/campusx
JWT_SECRET=your_jwt_secret_key
PORT=5001
NODE_ENV=development
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced search with AI
- [ ] Study group formation
- [ ] Campus map integration
- [ ] Attendance tracking
- [ ] Grade calculator
- [ ] Alumni network
- [ ] Internship portal

## 📞 Support

For support, please:
1. Check the [Issues](https://github.com/yourusername/campusx/issues) page
2. Create a new issue with detailed information
3. Join our [Discord](https://discord.gg/campusx) community

## 🙏 Acknowledgments

- Bennett University student community
- MERN stack community
- Open source contributors

---

**🎓 Made with ❤️ for Bennett University Students**
