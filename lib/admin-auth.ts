import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@farcaster/quick-auth';
import { isAdmin } from './admin';

const quickAuthClient = createClient();

export async function verifyAdminAuth(request: NextRequest): Promise<{ fid: number } | null> {
  try {
    const authorization = request.headers.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.split(' ')[1];
    
    if (!token) {
      return null;
    }

    // Verify the JWT token using QuickAuth
    const payload = await quickAuthClient.verifyJwt({
      token,
      domain: process.env.NEXT_PUBLIC_URL || 'localhost:3000',
    });

    const fid = payload.sub;
    
    if (!isAdmin(fid)) {
      return null;
    }

    return { fid };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAdminAuth(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const auth = await verifyAdminAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    return handler(request, context);
  };
}