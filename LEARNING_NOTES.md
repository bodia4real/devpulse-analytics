# Learning Notes

Quick reference for concepts learned during development.

---

## Database Connections

**Q: Difference between @supabase/supabase-js and postgres.js?**
- **Supabase client**: HTTP API, uses API keys, good for frontend/client-side, has auth/storage/real-time
- **postgres.js**: Direct PostgreSQL, uses DB credentials, good for backend, faster, full SQL support
- **Use both**: `postgres.js` for backend queries, `@supabase/supabase-js` for auth/storage/real-time

---

## Backend Dependencies

**Q: What are cors, helmet, and zod used for?**
- **cors**: Allows frontend to call API from different domain (Cross-Origin Resource Sharing). Without it, browser blocks requests from different origins
- **helmet**: Security middleware - sets HTTP headers to protect against common attacks (XSS, clickjacking, etc.)
- **zod**: Schema validation library - validates request data (body, params, query) before processing. TypeScript-first, catches errors early

**Q: Why can't I use zod() as middleware like cors() or helmet()?**
- **zod is NOT middleware** - it's a validation library, not Express middleware
- **cors/helmet**: Are middleware functions - you call them with `app.use(cors())`
- **zod**: You use it to create schemas and validate data in your route handlers
- **Error fix**: Remove `app.use(zod())` - use zod in routes to validate request data instead

**Q: Do I need zod if my database schema is correct?**
- **Database schema ≠ API validation** - they're different things
- **Database schema**: Validates data going INTO database (what you store)
- **zod**: Validates data coming FROM users (what they send to your API)
- **Why you need both**: Users can send wrong/malicious data - you must validate BEFORE it reaches database
- **Example**: User sends `{email: "not-an-email", age: "not-a-number"}` - zod catches this, database schema never sees bad data

**Q: Do I need dotenv in server.ts? Where do I load .env file?**
- **Load dotenv ONCE at the very top** - before any other imports that use process.env
- **Best place**: Create `src/config/index.ts` - load dotenv there, export config
- **Why**: Other files (database.ts, etc.) need env vars too - load once, use everywhere
- **Don't load in server.ts**: If database.ts loads it first, that's fine, but better to have one config file

**Q: What's the difference between config/index.ts and server.ts? Why separate them?**
- **config/index.ts**: Configuration file - loads .env, exports config values, validates env vars. Used by MANY files
- **server.ts**: Application file - sets up Express server, routes, middleware. Only runs when server starts
- **Why separate**: 
  - **Reusability**: database.ts, test files, other modules all need config - not just server.ts
  - **Separation of concerns**: Config logic ≠ Server logic
  - **Testing**: Can import config without starting the server
  - **Organization**: Config is infrastructure, server is application code

**Q: Best practices for error handling middleware in Express/TypeScript?**
- **Signature**: `(err, req, res, next) => {}` - 4 parameters (Express knows it's error handler)
- **Placement**: Must be LAST middleware, after all routes
- **Error types**: Handle different errors differently (validation, database, auth, unknown)
- **Status codes**: Use appropriate HTTP codes (400, 401, 404, 500, etc.)
- **Response format**: Consistent JSON structure `{ error: string, message?: string, stack?: string }`
- **Security**: Never expose stack traces in production, only in development
- **Logging**: Log all errors (with full details) but don't send full details to client
- **Custom errors**: Create custom error classes with status codes for better handling
- **Async errors**: Use wrapper or express-async-errors to catch async route errors


**Q: What is asyncHandler and why do we need it?**
- **Problem**: Express doesn't catch errors from async functions automatically - they become unhandled promise rejections
- **Solution**: asyncHandler wraps async route handlers to catch errors and pass them to Express error handler
- **How it works**: Returns a function that calls your async function, catches any errors, and calls `next(err)` to pass error to error handler
- **TypeScript syntax**: `type AsyncFunction = (req, res, next) => Promise<any>` - defines a function type that returns a Promise
- **Why 3 files instead of 1**: 
  - `errors.ts` - Custom error classes (reusable, can throw anywhere in code)
  - `errorHandler.ts` - Middleware that catches errors (runs at end of request pipeline)
  - `asyncHandler.ts` - Wrapper to catch async errors (used when defining routes)
- **Alternative**: Could be 1 file, but separation = better organization, reusability, and easier to test

**Q: When do I use asyncHandler vs just errorHandler?**
- **errorHandler**: ALWAYS runs at the end - it's the final destination for ALL errors (sync or async). You don't call it manually, Express calls it automatically when you use `next(err)`
- **asyncHandler**: Only needed when defining ASYNC routes. Wraps async functions to catch errors and pass them to errorHandler
- **Sync routes**: Express catches errors automatically, just call `next(err)` or throw - errorHandler will catch it
- **Async routes**: MUST use asyncHandler (or try-catch) to catch errors and pass to errorHandler
- **Summary**: errorHandler = always there (final destination), asyncHandler = helper for async routes only

**Q: What is a logger and why do we need request logging middleware?**
- **Logger**: Tool that records events/information (errors, requests, debug info) - helps you understand what's happening in your app
- **Request logging middleware**: Logs every HTTP request that comes to your API
- **What to log**: Method (GET/POST), URL, status code, response time, timestamp, IP address
- **Why useful**: 
  - **Debugging**: See what requests are being made
  - **Monitoring**: Track API usage, slow endpoints, errors
  - **Security**: See suspicious requests, track who's accessing what
  - **Analytics**: Understand user behavior, popular endpoints
- **Best practices**: 
  - Log before request (method, URL, IP)
  - Log after response (status code, duration)
  - Don't log sensitive data (passwords, tokens)
  - Use different log levels (info, error, warn)

---

## Concepts

*Add new concepts here as you learn them.*

---

*Last Updated: 2024-12-19*
