# QR Check-in App

A volunteer event management system with QR code check-in/check-out functionality.

## Features

- 📋 **Organizer Dashboard**: Create events, generate QR codes, view live attendance
- 📱 **Attendee Check-in**: Scan QR codes to check in/out (name saved locally)
- 📊 **CSV Export**: Download attendance reports with shift tracking and duration calculation
- 🔄 **Real-time Updates**: Live attendance table auto-refreshes every 5 seconds
- 🗑️ **Event Management**: Delete events and associated records

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Prisma)
- **Styling**: TailwindCSS
- **QR Generation**: qrcode.react
- **Hosting**: Vercel

## Deployment Instructions

> **Note**: This repository is configured for a specific deployment. To use this app for your own events, you need to deploy your own instance with your own database.

### Prerequisites

1. A [GitHub](https://github.com) account
2. A [Vercel](https://vercel.com) account
3. A PostgreSQL database (free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres))

### Setup Steps

1. **Fork this repository** to your own GitHub account

2. **Create a PostgreSQL database**:
   - Sign up for [Neon](https://neon.tech) (recommended for free tier)
   - Create a new project
   - Copy the connection string (looks like `postgresql://user:password@host/database`)

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with GitHub
   - Click "Add New Project"
   - Import your forked repository
   - Add environment variable:
     - **Key**: `DATABASE_URL`
     - **Value**: Your PostgreSQL connection string
   - Deploy!

4. **Initialize the database**:
   - Vercel will automatically run migrations on first deploy
   - Your database tables will be created automatically

5. **Access your app**:
   - Vercel will give you a URL (e.g., `your-app.vercel.app`)
   - Go to `/organizer` to create events and generate QR codes

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
echo 'DATABASE_URL="your-postgresql-connection-string"' > .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### For Organizers:
1. Go to `/organizer`
2. Create a new event
3. Click on the event to view QR codes
4. Display or print the QR codes at your event location
5. Monitor live check-ins
6. Export attendance data as CSV

### For Attendees:
1. Scan the QR code at the event
2. Enter your name (saved on your device)
3. Tap "Check In" or "Check Out"

## Database Schema

```prisma
model Event {
  id        String   @id @default(cuid())
  name      String
  date      DateTime
  createdAt DateTime @default(now())
  records   Record[]
}

model Record {
  id           String   @id @default(cuid())
  eventId      String
  attendeeName String
  type         String   // "IN" or "OUT"
  timestamp    DateTime @default(now())
  event        Event    @relation(fields: [eventId], references: [id])
}
```

## Security Notes

- This app uses an honor system - volunteers self-report their names
- QR codes are public URLs - anyone with the link can check in
- For production use, consider adding:
  - Pre-registered volunteer lists
  - Geolocation verification
  - Time-based access controls
  - Organizer authentication

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
