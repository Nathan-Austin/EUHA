
'use client';

// Mock data until backend is connected
const mockEvents = [
  { id: '1', title: 'Berlin Chili Fest', date: '2025-12-06', location: 'Berlin' },
  { id: '2', title: 'Judging Weekend', date: '2026-04-11', location: 'Online' },
];

const EventsManager = () => {
  return (
    <div className="bg-white/5 p-6 rounded-2xl mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-amber-400">Manage Events</h2>
        <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
          Add New Event
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Date</th>
              <th className="p-2">Location</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockEvents.map(event => (
              <tr key={event.id} className="border-b border-white/10">
                <td className="p-2">{event.title}</td>
                <td className="p-2">{event.date}</td>
                <td className="p-2">{event.location}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-400 hover:text-blue-300">Edit</button>
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsManager;
