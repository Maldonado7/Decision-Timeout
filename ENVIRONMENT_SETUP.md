# Environment Setup Guide

## Overview
This document describes the environment configuration for the Decision Timeout application, which uses Clerk for authentication and Supabase for data storage.

## Required Environment Variables

### Clerk Authentication
```bash
# Clerk public key (safe to expose to client)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Clerk secret key (server-side only, keep secure)
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### Supabase Database
```bash
# Supabase public URL (safe to expose to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous key (safe to expose to client, has limited permissions)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Environment File Setup

### Development (.env.local)
Create a `.env.local` file in the project root with all the required variables listed above.

### Production
Set these environment variables in your production hosting environment:
- Vercel: Add in Project Settings > Environment Variables
- Netlify: Add in Site Settings > Environment Variables  
- Other platforms: Follow their specific documentation

## Database Schema Migration

### For New Installations
Run the main schema file:
```sql
-- Apply database-schema.sql in your Supabase SQL editor
```

### For Existing Installations (Migration from Supabase Auth to Clerk)
1. **Backup your data first!**
2. Run the migration script:
```sql
-- Apply migration-clerk-compatibility.sql in your Supabase SQL editor
```

## Verification Steps

### 1. Environment Variables Check
All variables should be present and accessible:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_`
- ✅ `CLERK_SECRET_KEY` starts with `sk_`
- ✅ `NEXT_PUBLIC_SUPABASE_URL` is a valid HTTPS URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` is a JWT token

### 2. Database Schema Check
Verify your Supabase database has:
- ✅ `decisions` table with `user_id` as TEXT (not UUID)
- ✅ Appropriate indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Basic RLS policies (application-level auth via Clerk)

### 3. Integration Test
When signed in, visit: `/api/test/integration`
This will run comprehensive tests to verify:
- ✅ Clerk authentication works
- ✅ Supabase database connection works
- ✅ Decision creation/retrieval works
- ✅ User statistics calculation works

## Key Changes for Clerk Integration

### Database Changes
1. **User ID Format**: Changed from UUID to TEXT to accommodate Clerk's string-based user IDs
2. **No Users Table**: Removed custom users table since Clerk handles user management
3. **Simplified RLS**: Row Level Security policies are simplified since authentication is handled at the application layer

### Authentication Flow
1. **Client-Side**: Clerk handles all authentication UI and token management
2. **Server-Side**: Uses `auth()` from `@clerk/nextjs/server` to get current user ID
3. **Database Access**: All database operations are scoped to the authenticated user

## Security Considerations

### Application-Level Security
- All API routes check for authentication before processing
- User isolation is enforced in all database queries
- Input validation with Zod schemas
- Rate limiting implemented for all endpoints
- XSS protection via input sanitization

### Environment Security
- Never commit `.env.local` to version control
- Use different keys for development and production
- Regularly rotate secret keys
- Monitor for unusual access patterns

### Database Security
- Row Level Security (RLS) enabled as backup
- Database operations scoped to user ID
- No direct database access from client
- All mutations go through validated API routes

## Troubleshooting

### Common Issues

**Authentication not working:**
- Check Clerk keys are correct and for the right environment
- Verify domain is added to Clerk's allowed origins
- Check browser console for detailed error messages

**Database connection issues:**
- Verify Supabase URL and anon key are correct
- Check if database is paused (free tier limitation)  
- Review Supabase dashboard for connection errors

**API errors:**
- Check server logs for detailed error messages
- Verify rate limiting isn't being triggered
- Ensure request data matches Zod validation schemas

**Migration issues:**
- Always backup data before running migrations
- Test migrations on a copy of production data first
- Check for foreign key constraints that need updating

## Development Workflow

1. **Local Development:**
   ```bash
   npm run dev
   ```

2. **Run Tests:**
   ```bash
   npm run test
   ```

3. **Build Check:**
   ```bash
   npm run build
   ```

4. **Integration Test:**
   Visit `/api/test/integration` when signed in

## Production Deployment

1. Set environment variables in hosting platform
2. Run database migrations if needed
3. Deploy application
4. Test authentication flow
5. Run integration tests
6. Monitor logs for errors

---

**Last Updated:** $(date)
**Database Schema Version:** Clerk-compatible (TEXT user_id)
**Authentication Provider:** Clerk
**Database Provider:** Supabase