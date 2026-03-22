# Contributing to CampusX

Thank you for your interest in contributing to CampusX! This guide will help you get started with contributing to this Bennett University social platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB 6.0+ installed
- Git installed
- Basic knowledge of React, Node.js, and MongoDB

### Setting Up Your Development Environment

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/campusx.git
   cd campusx
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/campusx.git
   ```

3. **Install Dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Set Up Environment Variables**
   ```bash
   # In backend directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 📋 Development Guidelines

### Code Style
- Use ES6+ syntax
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-updates` - Documentation

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(auth): add email verification
fix(chat): resolve message ordering issue
docs(readme): update installation guide
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🐛 Bug Reports

### Before Creating a Bug Report
- Check existing issues
- Try to reproduce on latest version
- Gather relevant information

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Node.js version: [e.g., 18.17.0]

## Additional Context
Screenshots, logs, etc.
```

## ✨ Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you thought of

## Additional Context
Mockups, examples, etc.
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for 80%+ code coverage

### Test Structure
```
backend/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
frontend/
├── src/
│   ├── __tests__/
│   └── components/
│       └── __tests__/
```

## 📝 Documentation

### Documentation Types
- **Code Comments**: Explain complex logic
- **API Documentation**: Document endpoints
- **Component Documentation**: Props and usage
- **Setup Guides**: Installation and configuration

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI components
- Keep documentation up-to-date

## 🎯 Development Workflow

1. **Create Issue**: Discuss the change in an issue
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Make Changes**: Implement your feature/fix
4. **Test**: Ensure all tests pass
5. **Document**: Update relevant documentation
6. **Commit**: Follow commit message guidelines
7. **Push**: `git push origin feature/your-feature`
8. **Pull Request**: Create PR with detailed description

## 📊 Pull Request Process

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] All tests pass

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
Add screenshots for UI changes

## Additional Notes
Any additional context
```

## 🔍 Code Review Guidelines

### For Reviewers
- Check for code quality and style
- Verify functionality matches requirements
- Ensure tests are adequate
- Check for security vulnerabilities
- Verify documentation is updated

### For Contributors
- Respond to feedback promptly
- Make requested changes
- Explain complex decisions
- Be open to suggestions

## 🚀 Release Process

### Version Bumping
- `patch`: Bug fixes (1.0.1 → 1.0.2)
- `minor`: New features (1.0.1 → 1.1.0)
- `major`: Breaking changes (1.0.1 → 2.0.0)

### Release Steps
1. Update version numbers
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

## 📞 Getting Help

### Resources
- [React Documentation](https://reactjs.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community
- GitHub Issues: Ask questions
- GitHub Discussions: General discussion
- Discord Chat: Real-time help

## 📄 Project Structure

```
CampusX/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── socket/          # Socket.io handlers
│   ├── config/          # Configuration files
│   └── tests/           # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/       # Utility functions
│   │   └── __tests__/    # Frontend tests
│   └── public/           # Static assets
├── docs/                # Documentation
└── scripts/             # Build and deployment scripts
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Mobile responsiveness improvements
- [ ] Performance optimization
- [ ] Security enhancements
- [ ] Test coverage improvements

### Medium Priority
- [ ] New feature implementations
- [ ] UI/UX improvements
- [ ] Documentation enhancements
- [ ] Bug fixes

### Low Priority
- [ ] Code refactoring
- [ ] Dependency updates
- [ ] Tooling improvements

## 💡 Tips for Success

1. **Start Small**: Begin with simple issues or documentation
2. **Ask Questions**: Don't hesitate to ask for clarification
3. **Learn Continuously**: Stay updated with best practices
4. **Be Patient**: Code review takes time
5. **Collaborate**: Work with others on complex features

## 📜 Code of Conduct

Please be respectful and professional in all interactions. We're here to create a positive and inclusive environment for all contributors.

---

Thank you for contributing to CampusX! Your efforts help make this platform better for Bennett University students. 🎓
