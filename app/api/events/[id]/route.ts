import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                records: {
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete all records associated with the event first
        await prisma.record.deleteMany({
            where: { eventId: id },
        });

        // Then delete the event
        await prisma.event.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
