import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventId, attendeeName, department, type } = body;

        if (!eventId || !attendeeName || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const record = await prisma.record.create({
            data: {
                eventId,
                attendeeName,
                department: department || null,
                type,
            },
        });

        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
    }
}
