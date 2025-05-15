# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start Development Server**: `pnpm dev` or `npm run dev`
- **Build Project**: `pnpm build` or `npm run build`
- **Start Production Server**: `pnpm start` or `npm run start`
- **Lint Code**: `pnpm lint` or `npm run lint`

## Project Architecture

Mini-memes is a Farcaster Mini App for creating, sharing, and potentially minting memes as NFTs. It's built using Next.js, React, and OnchainKit/MiniKit integration.

### Core Components

1. **MemeGenerator (`components/meme-generator.tsx`)**: Main orchestrator that manages:
   - Template selection
   - Text editing
   - Meme generation
   - Sharing/minting options

2. **MemeEditor (`components/meme-editor.tsx`)**: Handles the canvas editing experience:
   - Places text on meme templates
   - Supports draggable text positioning
   - Manages text properties (size, position)
   - Creates the final meme image

3. **MemeTemplateSelector (`components/meme-template-selector.tsx`)**: Displays available meme templates in a grid gallery

4. **Draggable Text Features**:
   - `components/draggable-text-box.tsx`: Handles text positioning
   - `components/draggable-text-input.tsx`: Manages text input

5. **Share/Mint Options**:
   - Share to Farcaster (using Frame SDK)
   - Mint to Zora (integration in progress)

### State Management

- Uses Zustand for global state management
- Main store in `lib/stores/use-meme-store.ts`
- Manages selected template, text items, generated meme, and active tabs

### API Endpoints

- `/api/upload-meme/route.ts`: Handles meme image uploads to Vercel Blob
- `/api/notify/route.ts`: Handles Farcaster notifications
- `/api/webhook/route.ts`: Webhook endpoint for Farcaster integrations

### Data Services

- **Meme Templates**: Defined in `lib/meme-templates.ts`
- **Redis Integration**: `lib/redis.ts` for storing notification preferences
- **Notification System**: 
  - `lib/notification.ts`: Core notification functions
  - `lib/notification-client.ts`: Client-side notification utilities

### External Integrations

- **Farcaster**: Frame SDK integration for sharing and notifications
- **Vercel Blob**: For storing generated meme images
- **Upstash Redis**: For notification handling
- **Zora**: For NFT minting (in progress)

## Workflow

1. User selects a meme template from the gallery
2. User adds and positions text on the meme
3. User generates the final meme
4. User can share to Farcaster or mint as NFT

## Environmental Variables

Important environment variables required for the app to function:

```
# Required for Frame metadata
NEXT_PUBLIC_URL=
NEXT_PUBLIC_VERSION=
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=
NEXT_PUBLIC_ICON_URL=
NEXT_PUBLIC_IMAGE_URL=
NEXT_PUBLIC_SPLASH_IMAGE_URL=
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=

# Required to allow users to add your frame
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=

# Required for webhooks and background notifications
REDIS_URL=
REDIS_TOKEN=
```

These variables enable frame metadata, account association for notifications, and Redis-backed storage for notifications.