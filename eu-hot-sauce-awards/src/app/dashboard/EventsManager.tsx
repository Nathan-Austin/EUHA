'use client';

import { useState, useEffect } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, toggleEventActive } from './events-actions';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  venue: string | null;
  url: string | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
}

const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const data = await getEvents();
    setEvents(data);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    let result;
    if (editingEvent) {
      result = await updateEvent(editingEvent.id, formData);
    } else {
      result = await createEvent(formData);
    }

    if (result.success) {
      setShowModal(false);
      setEditingEvent(null);
      await loadEvents();
      (e.target as HTMLFormElement).reset();
    } else {
      alert(`Error: ${result.error}`);
    }

    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const result = await deleteEvent(id);
    if (result.success) {
      await loadEvents();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    const result = await toggleEventActive(id, !currentActive);
    if (result.success) {
      await loadEvents();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function openAddModal() {
    setEditingEvent(null);
    setShowModal(true);
  }

  function openEditModal(event: Event) {
    setEditingEvent(event);
    setShowModal(true);
  }

  return (
    <div className="bg-white/5 p-6 rounded-2xl mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-amber-400">Manage Events</h2>
        <button
          onClick={openAddModal}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600"
        >
          Add New Event
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Image</th>
              <th className="p-2">Title</th>
              <th className="p-2">Date</th>
              <th className="p-2">Location</th>
              <th className="p-2">Featured</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id} className="border-b border-white/10">
                <td className="p-2">
                  {event.image_url ? (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center text-white/30 text-xs">
                      No image
                    </div>
                  )}
                </td>
                <td className="p-2">{event.title}</td>
                <td className="p-2">{new Date(event.event_date).toLocaleDateString()}</td>
                <td className="p-2">{event.location || '-'}</td>
                <td className="p-2">{event.featured ? '⭐' : '-'}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${event.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                    {event.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => openEditModal(event)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(event.id, event.active)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    {event.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-white/50">
                  No events found. Click "Add New Event" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingEvent?.title}
                  required
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingEvent?.description || ''}
                  rows={3}
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="event_date"
                    defaultValue={editingEvent?.event_date}
                    required
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingEvent?.end_date || ''}
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent?.location || ''}
                    placeholder="City, Country"
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    defaultValue={editingEvent?.venue || ''}
                    placeholder="Venue name"
                    className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">URL</label>
                <input
                  type="url"
                  name="url"
                  defaultValue={editingEvent?.url || ''}
                  placeholder="https://example.com"
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Event Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-500/20 file:text-amber-200 hover:file:bg-amber-500/30"
                />
                {editingEvent?.image_url && (
                  <p className="text-xs text-white/50 mt-1">Current image will be replaced if new file is uploaded</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-white/70">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingEvent?.featured}
                    className="mr-2"
                  />
                  Featured Event
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingEvent ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
