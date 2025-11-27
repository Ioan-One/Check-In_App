'use client';

import { useState, useEffect, use } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

interface Record {
    id: string;
    attendeeName: string;
    department?: string;
    type: string;
    timestamp: string;
}

interface Event {
    id: string;
    name: string;
    date: string;
    records: Record[];
}

export default function EventDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'IN' | 'OUT'>('IN');

    useEffect(() => {
        fetchEvent();
        const interval = setInterval(fetchEvent, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
            }
        } catch (error) {
            console.error('Failed to fetch event', error);
        } finally {
            setLoading(false);
        }
    };



    const downloadCSV = () => {
        if (!event) return;

        // Group records by attendee name and pair check-ins with check-outs
        const attendeeMap = new Map<string, Array<{ checkIn?: Date; checkOut?: Date; department?: string }>>();

        // Sort records by timestamp
        const sortedRecords = [...event.records].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        sortedRecords.forEach(record => {
            if (!attendeeMap.has(record.attendeeName)) {
                attendeeMap.set(record.attendeeName, []);
            }
            const shifts = attendeeMap.get(record.attendeeName)!;

            if (record.type === 'IN') {
                // Start a new shift
                shifts.push({
                    checkIn: new Date(record.timestamp),
                    department: record.department || undefined
                });
            } else if (record.type === 'OUT') {
                // Find the most recent shift without a check-out
                const openShift = [...shifts].reverse().find(s => s.checkIn && !s.checkOut);
                if (openShift) {
                    openShift.checkOut = new Date(record.timestamp);
                } else {
                    // Check-out without check-in (edge case)
                    shifts.push({ checkOut: new Date(record.timestamp) });
                }
            }
        });

        // Helper to escape CSV fields
        const escapeCSV = (field: string) => {
            if (field.includes(',') || field.includes('"') || field.includes('\n')) {
                return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
        };

        // Helper to calculate duration
        const calculateDuration = (checkIn?: Date, checkOut?: Date): string => {
            if (!checkIn || !checkOut) return 'N/A';
            const diffMs = checkOut.getTime() - checkIn.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        };

        const headers = ['Name', 'Department', 'Shift #', 'Check-In Date', 'Check-In Time', 'Check-Out Date', 'Check-Out Time', 'Duration'];
        const rows: string[][] = [];

        // Sort by name
        Array.from(attendeeMap.entries())
            .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
            .forEach(([name, shifts]) => {
                shifts.forEach((shift, index) => {
                    rows.push([
                        escapeCSV(name),
                        shift.department || 'N/A',
                        (index + 1).toString(),
                        shift.checkIn ? shift.checkIn.toLocaleDateString() : 'N/A',
                        shift.checkIn ? shift.checkIn.toLocaleTimeString() : 'N/A',
                        shift.checkOut ? shift.checkOut.toLocaleDateString() : 'N/A',
                        shift.checkOut ? shift.checkOut.toLocaleTimeString() : 'N/A',
                        calculateDuration(shift.checkIn, shift.checkOut)
                    ]);
                });
            });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.name.replace(/\s+/g, '_')}_attendees.csv`;
        a.click();
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!event) return <div className="p-8 text-center">Event not found</div>;

    const checkInUrl = `${window.location.origin}/checkin/${event.id}?type=IN`;
    const checkOutUrl = `${window.location.origin}/checkin/${event.id}?type=OUT`;
    const currentUrl = activeTab === 'IN' ? checkInUrl : checkOutUrl;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <Link href="/organizer" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
                        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                        <p className="text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={downloadCSV}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Export CSV
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* QR Code Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">QR Code Station</h2>

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setActiveTab('IN')}
                                className={`flex-1 py-2 rounded-md font-medium transition-colors ${activeTab === 'IN'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Check-in
                            </button>
                            <button
                                onClick={() => setActiveTab('OUT')}
                                className={`flex-1 py-2 rounded-md font-medium transition-colors ${activeTab === 'OUT'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Check-out
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                            <QRCodeSVG value={currentUrl} size={256} />
                            <p className="mt-4 text-sm text-gray-500 text-center">
                                Scan to {activeTab === 'IN' ? 'Check In' : 'Check Out'}
                            </p>
                            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-blue-500 hover:underline">
                                Open Link (for testing)
                            </a>
                        </div>
                    </div>

                    {/* Attendees List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Live Activity</h2>
                            <p className="text-sm text-gray-500">Auto-refreshing every 5s</p>
                        </div>

                        <div className="overflow-y-auto flex-1 p-0">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-4 text-sm font-medium text-gray-500">Name</th>
                                        <th className="p-4 text-sm font-medium text-gray-500">Department</th>
                                        <th className="p-4 text-sm font-medium text-gray-500">Action</th>
                                        <th className="p-4 text-sm font-medium text-gray-500">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {event.records.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{record.attendeeName}</td>
                                            <td className="p-4 text-sm text-gray-600">{record.department || '-'}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(record.timestamp).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {event.records.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">
                                                No records yet. Waiting for scans...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
