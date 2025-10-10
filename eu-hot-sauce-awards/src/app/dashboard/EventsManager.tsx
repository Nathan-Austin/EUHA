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
    <div className="mt-8 rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-amber-400">Manage Events</h2>
        <button
          onClick={openAddModal}
          className="w-full rounded-full bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 sm:w-auto sm:px-6"
        >
          Add New Event
        </button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="mt-6 min-w-full text-left text-sm">
          <thead>
            <tr className="text-white/70">
              <th className="px-3 py-2 font-medium">Image</th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Location</th>
              <th className="px-3 py-2 font-medium">Featured</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-white/10 text-white/90">
                <td className="px-3 py-2">
                  {event.image_url ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                      <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-white/20 text-xs text-white/40">
                      No image
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">{event.title}</td>
                <td className="px-3 py-2">
                  {new Date(event.event_date).toLocaleDateString()}
                  {event.end_date ? ` – ${new Date(event.end_date).toLocaleDateString()}` : ''}
                </td>
                <td className="px-3 py-2">{event.location || '—'}</td>
                <td className="px-3 py-2">{event.featured ? '⭐' : '—'}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      event.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {event.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openEditModal(event)}
                      className="text-blue-300 transition hover:text-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(event.id, event.active)}
                      className="text-yellow-300 transition hover:text-yellow-200"
                    >
                      {event.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-300 transition hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-white/50">
                  No events found. Tap "Add New Event" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:hidden">
        {events.length === 0 && (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/70">
            No events found. Tap "Add New Event" to create one.
          </div>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/90"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              {event.image_url ? (
                <div className="relative h-32 w-full overflow-hidden rounded-xl border border-white/10 sm:h-24 sm:w-32">
                  <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-white/40 sm:h-24 sm:w-32">
                  No image
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200">
                    {new Date(event.event_date).toLocaleDateString()}
                    {event.end_date ? ` – ${new Date(event.end_date).toLocaleDateString()}` : ''}
                  </span>
                  {event.featured ? (
                    <span className="rounded-full border border-amber-400/40 px-2 py-1 text-xs text-amber-200">
                      Featured
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      event.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {event.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">{event.title}</h3>
                <p className="text-xs text-white/60">{event.location || 'Location TBC'}</p>
                {event.description ? (
                  <p className="text-xs text-white/60">{event.description}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                onClick={() => openEditModal(event)}
                className="w-full rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10 sm:w-auto"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(event.id, event.active)}
                className="w-full rounded-full border border-yellow-400/40 px-4 py-2 text-sm text-yellow-200 transition hover:bg-yellow-500/10 sm:w-auto"
              >
                {event.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="w-full rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/10 sm:w-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-gray-900 p-5 shadow-2xl sm:p-8">
            <h3 className="text-xl font-semibold text-amber-400">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-white/70">Title *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingEvent?.title}
                  required
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-white/70">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingEvent?.description || ''}
                  rows={3}
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-white/70">Start Date *</label>
                  <input
                    type="date"
                    name="event_date"
                    defaultValue={editingEvent?.event_date}
                    required
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-white/70">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingEvent?.end_date || ''}
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-white/70">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent?.location || ''}
                    placeholder="City, Country"
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-white/70">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    defaultValue={editingEvent?.venue || ''}
                    placeholder="Venue name"
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-white/70">URL</label>
                <input
                  type="url"
                  name="url"
                  defaultValue={editingEvent?.url || ''}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-white/70">Event Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white file:me-4 file:rounded-full file:border-0 file:bg-amber-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-200 hover:file:bg-amber-500/30"
                />
                {editingEvent?.image_url ? (
                  <p className="mt-1 text-xs text-white/50">
                    Current image will be replaced if a new file is uploaded.
                  </p>
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={editingEvent?.featured}
                  className="h-4 w-4 rounded border-white/30 bg-black/40"
                />
                Featured Event
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                  }}
                  className="w-full rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? 'Saving…' : editingEvent ? 'Update Event' : 'Create Event'}
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
