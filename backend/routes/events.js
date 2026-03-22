import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { eventType, startDate, endDate, search } = req.query;
    const filter = {};
    
    if (eventType && eventType !== 'all') {
      filter.eventType = eventType;
    }
    
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const events = await Event.find(filter)
      .populate('creator', 'name profilePic enrollmentNo')
      .populate('rsvps.user', 'name profilePic')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
  body('eventType').isIn(['Club Meeting', 'Hackathon', 'Sports Tryout', 'Workshop', 'Seminar', 'Cultural Event', 'Academic Deadline', 'Other']).withMessage('Valid event type required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('location').trim().isLength({ min: 1, max: 100 }).withMessage('Location must be 1-100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, eventType, startDate, endDate, location, maxAttendees, tags, image } = req.body;

    const event = new Event({
      creator: req.user.id,
      title,
      description,
      eventType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      maxAttendees: maxAttendees || null,
      tags: tags || [],
      image: image || ''
    });

    await event.save();
    await event.populate('creator', 'name profilePic enrollmentNo');

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name profilePic enrollmentNo branch year')
      .populate('rsvps.user', 'name profilePic');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/rsvp', [
  auth,
  body('status').isIn(['interested', 'going']).withMessage('Status must be interested or going')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove existing RSVP if any
    event.rsvps = event.rsvps.filter(rsvp => rsvp.user.toString() !== req.user.id);

    // Add new RSVP
    event.rsvps.push({
      user: req.user.id,
      status,
      timestamp: new Date()
    });

    await event.save();
    await event.populate('rsvps.user', 'name profilePic');

    const rsvpCounts = {
      interested: event.rsvps.filter(r => rsvp.status === 'interested').length,
      going: event.rsvps.filter(r => rsvp.status === 'going').length
    };

    res.json({
      message: 'RSVP successful',
      rsvpCounts,
      userRsvp: event.rsvps.find(r => rsvp.user.toString() === req.user.id)
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/calendar', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Generate ICS file content
    const icsContent = generateICSContent(event);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_')}.ics"`);
    res.send(icsContent);
  } catch (error) {
    console.error('Calendar export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function generateICSContent(event) {
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const now = new Date();
  const uid = `${event._id}@campusx.bennett.edu.in`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusX//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
DTSTAMP:${formatDate(now)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

export default router;
