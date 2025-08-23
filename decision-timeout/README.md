# Decision Timeout

A web application that helps users make decisions quickly to combat analysis paralysis.

## Features

- **Decision Creator**: Create decisions with pros/cons and time limits
- **Auto-Decision Logic**: Automatic decision-making when timer expires
- **Decision History**: Track past decisions and success rates
- **30-Day Lock**: Prevents re-deciding on the same question
- **Time Saved Tracking**: Shows how much time you've saved

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- Framer Motion (Animations)
- React Hook Form

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

Run the SQL in `database-schema.sql` in your Supabase SQL editor to create the required tables and policies.

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Sign Up/Login**: Create an account or login to access the dashboard
2. **Create Decision**: Enter your question, add pros and cons (max 5 each)
3. **Set Timer**: Choose 5, 10, or 15 minutes for your decision window
4. **Wait or Decide**: The system will auto-decide when time runs out
5. **View History**: Track your decisions and mark them as good/bad after 30 days

## Database Schema

- `users`: User profiles
- `decisions`: Decision records with pros, cons, results, and outcomes
- `waitlist`: Email waitlist for future features

## Features in Detail

### Auto-Decision Logic
- More pros than cons = YES
- More cons than pros = NO  
- Tie = Coin flip (50/50)

### Decision Lock
- Decisions are locked for 30 days after creation
- Prevents overthinking the same decision
- Email reminder after 30 days (planned feature)

### Success Tracking
- Mark decisions as good/bad after the lock period
- View success rate and total time saved
- Historical decision analysis

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Make sure your environment variables are configured in your deployment platform.

## License

MIT License
