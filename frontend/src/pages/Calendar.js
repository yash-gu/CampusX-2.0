import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [filters, setFilters] = useState({
    eventType: 'all',
    search: ''
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'Club Meeting',
    startDate: '',
    endDate: '',
    location: '',
    maxAttendees: '',
    tags: [],
    image: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.eventType !== 'all') params.append('eventType', filters.eventType);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/api/events?${params}`);
      setEvents(res.data.events);
      setLoading(false);
    } catch (error) {
      setError('Failed to load events');
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/events', {
        ...newEvent,
        startDate: new Date(newEvent.startDate),
        endDate: new Date(newEvent.endDate),
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : null,
        tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      setEvents([res.data, ...events]);
      setNewEvent({
        title: '',
        description: '',
        eventType: 'Club Meeting',
        startDate: '',
        endDate: '',
        location: '',
        maxAttendees: '',
        tags: [],
        image: ''
      });
      setShowEventForm(false);
    } catch (error) {
      setError('Failed to create event');
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      const res = await api.put(`/api/events/${eventId}/rsvp`, { status });
      setEvents(events.map(event => 
        event._id === eventId ? {
          ...event,
          rsvps: [...event.rsvps.filter(r => r.user._id !== user.id), res.data.userRsvp]
        } : event
      ));
    } catch (error) {
      setError('Failed to RSVP');
    }
  };

  const handleDownloadCalendar = async (eventId) => {
    try {
      window.open(`/api/events/${eventId}/calendar`, '_blank');
    } catch (error) {
      setError('Failed to download calendar file');
    }
  };

  const eventTypes = ['Club Meeting', 'Hackathon', 'Sports Tryout', 'Workshop', 'Seminar', 'Cultural Event', 'Academic Deadline', 'Other'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRSVPCounts = (event) => {
    const interested = event.rsvps.filter(r => r.status === 'interested').length;
    const going = event.rsvps.filter(r => r.status === 'going').length;
    return { interested, going };
  };

  const getUserRSVP = (event) => {
    return event.rsvps.find(r => r.user._id === user.id);
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
        <h1 className="text-3xl font-bold text-bennett-blue mb-2">Campus Calendar</h1>
        <p className="text-gray-600">Events, deadlines, and activities at Bennett University</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={filters.eventType}
                  onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Events</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search events..."
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="btn-primary w-full lg:w-auto"
          >
            {showEventForm ? 'Cancel' : 'Create Event'}
          </button>
        </div>
      </div>

      {showEventForm && (
        <div className="mb-6">
          <form onSubmit={handleCreateEvent} className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Create Event</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="input-field"
                  placeholder="Event title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                  className="input-field"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="input-field"
                  placeholder="Event location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees (Optional)</label>
                <input
                  type="number"
                  value={newEvent.maxAttendees}
                  onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
                  className="input-field"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Describe your event..."
                maxLength="500"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={newEvent.tags}
                onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                className="input-field"
                placeholder="e.g., coding, workshop, cse"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
              <ImageUpload
                onImageUpload={(imageUrl) => setNewEvent({ ...newEvent, image: imageUrl })}
                existingImage={newEvent.image}
                placeholder="Upload Event Image"
              />
            </div>
            <button type="submit" className="mt-4 btn-primary">
              Create Event
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No events found. Create the first event!</p>
          </div>
        ) : (
          events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              currentUser={user}
              onRSVP={handleRSVP}
              onDownloadCalendar={handleDownloadCalendar}
            />
          ))
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, currentUser, onRSVP, onDownloadCalendar }) => {
  const { interested, going } = event.rsvps.reduce((acc, rsvp) => {
    acc[rsvp.status === 'interested' ? 'interested' : 'going']++;
    return acc;
  }, { interested: 0, going: 0 });

  const userRSVP = event.rsvps.find(r => r.user._id === currentUser.id);
  const isPast = new Date(event.endDate) < new Date();

  return (
    <div className="card overflow-hidden">
      {event.image && (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <img
            src={event.image}
            alt={event.title}
            className="max-h-full max-w-full object-contain"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 flex-1">{event.title}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {event.eventType}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium">📅</span>
            <span className="ml-2">{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium">📍</span>
            <span className="ml-2">{event.location}</span>
          </div>
          {event.maxAttendees && (
            <div className="flex items-center">
              <span className="font-medium">👥</span>
              <span className="ml-2">{going}/{event.maxAttendees} going</span>
            </div>
          )}
        </div>

        {event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {event.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>👍 {interested} interested</span>
            <span>✅ {going} going</span>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          {!isPast && (
            <>
              {userRSVP?.status === 'going' ? (
                <button
                  onClick={() => onRSVP(event._id, 'interested')}
                  className="flex-1 btn-secondary text-sm"
                >
                  Switch to Interested
                </button>
              ) : userRSVP?.status === 'interested' ? (
                <button
                  onClick={() => onRSVP(event._id, 'going')}
                  className="flex-1 btn-primary text-sm"
                >
                  Switch to Going
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onRSVP(event._id, 'interested')}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Interested
                  </button>
                  <button
                    onClick={() => onRSVP(event._id, 'going')}
                    className="flex-1 btn-primary text-sm"
                  >
                    Going
                  </button>
                </>
              )}
            </>
          )}
          
          <button
            onClick={() => onDownloadCalendar(event._id)}
            className="btn-secondary text-sm px-3"
            title="Add to Calendar"
          >
            📅
          </button>
        </div>

        <div className="mt-3 flex items-center text-xs text-gray-500">
          <div className="w-6 h-6 bg-bennett-blue rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
            {event.creator.name.charAt(0).toUpperCase()}
          </div>
          <span>Created by {event.creator.name}</span>
        </div>
      </div>
    </div>
  );
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default Calendar;
