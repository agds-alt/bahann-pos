import { authMiddleware } from './middleware/auth';
import { type NextRequest } from 'next/server';

// HARUS statis — tidak boleh variabel dinamis
export const config = {
  matcher: [
    '/api/sales',
    '/api/stock',
    // Tambahkan route lain di sini secara manual jika perlu
  ],
};

export default async function middleware(request: NextRequest) {
  return authMiddleware(request);
}
