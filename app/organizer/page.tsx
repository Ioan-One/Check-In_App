'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Event {
    id: string;
    name: string;
    date: string;
    createdAt: string;
}

export default function OrganizerDashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName || !eventDate) return;

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: eventName, date: eventDate }),
            });

            if (res.ok) {
                setEventName('');
                setEventDate('');
                fetchEvents();
            }
        } catch (error) {
            console.error('Failed to create event', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Organizer Dashboard</h1>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Event</h2>
                    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="e.g., Charity Run 2025"
                                required
                            />
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            Create
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <h2 className="text-xl font-semibold p-6 border-b border-gray-200 text-gray-800">Your Events</h2>
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No events found. Create one above!</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {events.map((event) => (
                                <li key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <Link href={`/organizer/${event.id}`} className="flex justify-between items-center group">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {event.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(event.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-blue-500">
                                            View Details →
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
