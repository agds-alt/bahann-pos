import { authMiddleware } from './middleware/auth';
import { type NextRequest } from 'next/server';

// MUST be static — dynamic variables not allowed
export const config = {
  matcher: [
    '/api/sales',
    '/api/stock',
    // Add other routes here manually if needed
  ],
};

export default async function middleware(request: NextRequest) {
  return authMiddleware(request);
}
