import express from 'express';
import { body, validationResult } from 'express-validator';
import StudyResource from '../models/StudyResource.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { courseCode, professor, resourceType, search, sortBy } = req.query;
    const filter = {};
    
    if (courseCode) {
      filter.courseCode = courseCode.toUpperCase();
    }
    
    if (professor) {
      filter.professor = { $regex: professor, $options: 'i' };
    }
    
    if (resourceType && resourceType !== 'all') {
      filter.resourceType = resourceType;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'rating') {
      sortOptions = { averageRating: -1, createdAt: -1 };
    } else if (sortBy === 'downloads') {
      sortOptions = { downloads: -1, createdAt: -1 };
    }

    const resources = await StudyResource.find(filter)
      .populate('uploader', 'name profilePic enrollmentNo')
      .populate('ratings.user', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await StudyResource.countDocuments(filter);

    res.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get study resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').trim().isLength({ min: 1, max: 300 }).withMessage('Description must be 1-300 characters'),
  body('courseCode').trim().isLength({ min: 3, max: 10 }).withMessage('Course code must be 3-10 characters'),
  body('professor').trim().isLength({ min: 1, max: 50 }).withMessage('Professor name must be 1-50 characters'),
  body('resourceType').isIn(['Notes', 'Assignment', 'Lab Report', 'Previous Paper', 'Reference Material', 'Other']).withMessage('Valid resource type required'),
  body('fileUrl').isURL().withMessage('Valid file URL required'),
  body('fileName').trim().isLength({ min: 1, max: 100 }).withMessage('File name required'),
  body('fileSize').isInt({ min: 1 }).withMessage('Valid file size required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, courseCode, professor, resourceType, fileUrl, fileName, fileSize, tags } = req.body;

    const resource = new StudyResource({
      uploader: req.user.id,
      title,
      description,
      courseCode: courseCode.toUpperCase(),
      professor,
      resourceType,
      fileUrl,
      fileName,
      fileSize,
      tags: tags || []
    });

    await resource.save();
    await resource.populate('uploader', 'name profilePic enrollmentNo');

    res.status(201).json(resource);
  } catch (error) {
    console.error('Create study resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const resource = await StudyResource.findById(req.params.id)
      .populate('uploader', 'name profilePic enrollmentNo branch year')
      .populate('ratings.user', 'name profilePic');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get study resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/rating', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating } = req.body;
    const resource = await StudyResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Remove existing rating if any
    resource.ratings = resource.ratings.filter(r => r.user.toString() !== req.user.id);

    // Add new rating
    resource.ratings.push({
      user: req.user.id,
      rating,
      timestamp: new Date()
    });

    await resource.calculateAverageRating();
    await resource.populate('ratings.user', 'name profilePic');

    res.json({
      message: 'Rating submitted successfully',
      averageRating: resource.averageRating,
      totalRatings: resource.ratings.length,
      userRating: resource.ratings.find(r => r.user.toString() === req.user.id)
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/download', async (req, res) => {
  try {
    const resource = await StudyResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({
      message: 'Download recorded',
      downloads: resource.downloads,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/courses/list', async (req, res) => {
  try {
    const courses = await StudyResource.distinct('courseCode').sort();
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/professors/list', async (req, res) => {
  try {
    const professors = await StudyResource.distinct('professor').sort();
    res.json({ professors });
  } catch (error) {
    console.error('Get professors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
