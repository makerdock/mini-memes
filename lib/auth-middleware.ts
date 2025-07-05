import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@farcaster/quick-auth';
import { isAdmin } from './admin';

const quickAuthClient = createClient();

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    fid: number;
    isAdmin: boolean;
  };
}

export async function authenticateAdmin(request: NextRequest): Promise<{ user: { fid: number; isAdmin: boolean } } | { error: string; status: number }> {
  try {
    const authorization = request.headers.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authorization.split(' ')[1];
    
    if (!token) {
      return { error: 'Missing token', status: 401 };
    }

    // Verify the JWT token using QuickAuth
    const payload = await quickAuthClient.verifyJwt({
      token,
      domain: process.env.NEXT_PUBLIC_URL || 'localhost:3000',
    });

    const fid = payload.sub;
    
    if (!isAdmin(fid)) {
      return { error: 'Access denied: Admin privileges required', status: 403 };
    }

    return {
      user: {
        fid,
        isAdmin: true,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Invalid token', status: 401 };
  }
}

export function withAdminAuth(handler: (request: NextRequest, user: { fid: number; isAdmin: boolean }, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await authenticateAdmin(request);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    return handler(request, authResult.user, context);
  };
}