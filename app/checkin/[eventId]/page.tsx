'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckInContent({ params }: { params: { eventId: string } }) {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'IN';

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [isNameSaved, setIsNameSaved] = useState(false);
    const [isDepartmentSaved, setIsDepartmentSaved] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');

    const departments = [
        'Resurse Umane',
        'Relatii externe',
        'Evenimente',
        'Imagine si PR'
    ];

    useEffect(() => {
        const savedName = localStorage.getItem('attendeeName');
        const savedDepartment = localStorage.getItem('attendeeDepartment');
        if (savedName) {
            setName(savedName);
            setIsNameSaved(true);
        }
        if (savedDepartment) {
            setDepartment(savedDepartment);
            setIsDepartmentSaved(true);
        }
    }, []);

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            localStorage.setItem('attendeeName', name.trim());
            setIsNameSaved(true);
        }
    };

    const handleDepartmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (department) {
            localStorage.setItem('attendeeDepartment', department);
            setIsDepartmentSaved(true);
        }
    };

    const handleCheckIn = async () => {
        setStatus('SUBMITTING');
        try {
            const res = await fetch('/api/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: params.eventId,
                    attendeeName: name,
                    department: department || null,
                    type,
                }),
            });

            if (res.ok) {
                setStatus('SUCCESS');
            } else {
                setStatus('ERROR');
                setMessage('Something went wrong. Please try again.');
            }
        } catch (error) {
            setStatus('ERROR');
            setMessage('Network error. Please try again.');
        }
    };

    const resetName = () => {
        localStorage.removeItem('attendeeName');
        localStorage.removeItem('attendeeDepartment');
        setName('');
        setDepartment('');
        setIsNameSaved(false);
        setIsDepartmentSaved(false);
    };

    if (status === 'SUCCESS') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-green-900 mb-2">Success!</h1>
                    <p className="text-green-700">
                        You have successfully checked {type === 'IN' ? 'in' : 'out'}.
                    </p>
                    <p className="mt-4 text-sm text-green-600">You can close this window.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
                    Event {type === 'IN' ? 'Check-in' : 'Check-out'}
                </h1>

                {!isNameSaved ? (
                    <form onSubmit={handleNameSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What is your name?
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Enter your full name"
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                We'll remember this on this device.
                            </p>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Continue
                        </button>
                    </form>
                ) : !isDepartmentSaved ? (
                    <form onSubmit={handleDepartmentSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select your department
                            </label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                required
                            >
                                <option value="">Choose a department...</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-gray-500">
                                We'll remember this on this device.
                            </p>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Continue
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-600 mb-2">Welcome back,</p>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{name}</h2>
                        <p className="text-sm text-gray-500 mb-8">{department}</p>

                        <button
                            onClick={handleCheckIn}
                            disabled={status === 'SUBMITTING'}
                            className={`w-full py-4 rounded-lg font-bold text-lg text-white shadow-md transition-transform active:scale-95 ${type === 'IN'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-red-600 hover:bg-red-700'
                                } ${status === 'SUBMITTING' ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {status === 'SUBMITTING' ? 'Processing...' : `Tap to Check ${type === 'IN' ? 'In' : 'Out'}`}
                        </button>

                        {status === 'ERROR' && (
                            <p className="mt-4 text-red-600 text-sm">{message}</p>
                        )}

                        <button
                            onClick={resetName}
                            className="mt-8 text-sm text-gray-400 hover:text-gray-600 underline"
                        >
                            Not {name}? Change Name/Department
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CheckInPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <CheckInContent params={{ eventId }} />
        </Suspense>
    );
}
