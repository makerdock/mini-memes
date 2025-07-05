# Mini Memes 🎨

A Farcaster Mini App for creating, sharing, and minting memes as NFTs. Built with Next.js, Fabric.js, and integrated with OnchainKit/MiniKit for seamless Web3 functionality.

[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTZDMTIuNDE4MyAxNiAxNiAxMi40MTgzIDE2IDhDMTYgMy41ODE3MiAxMi40MTgzIDAgOCAwQzMuNTgxNzIgMCAwIDMuNTgxNzIgMCA4QzAgMTIuNDE4MyAzLjU4MTcyIDE2IDggMTZaIiBmaWxsPSIjMDA1MkZGIi8+Cjwvc3ZnPg==)](https://base.org)
[![Farcaster](https://img.shields.io/badge/Farcaster-Frame-8B5CF6?style=flat)](https://farcaster.xyz)

## Features

- **🖼️ Meme Creation**: Choose from popular meme templates and add custom text
- **✏️ Advanced Editor**: Drag, resize, and position text with Fabric.js canvas editor
- **🔗 Farcaster Integration**: Share memes directly to your Farcaster feed
- **🪙 Zora NFT Minting**: Create and mint memes as Zora Coins (ERC-1155 NFTs) on Base blockchain
- **🚀 Token Launches**: Launch meme tokens with Clanker integration
- **💾 Profile System**: Save and manage your created memes
- **📱 Mobile Optimized**: Fully responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Canvas**: Fabric.js for meme editing
- **State Management**: Zustand
- **Web3**: 
  - OnchainKit/MiniKit for Farcaster integration
  - Wagmi & Viem for wallet connections
  - **Zora Coins SDK** for creating ERC-1155 NFT collections
  - Clanker SDK for token launches
- **Storage**: 
  - Vercel Blob for image storage
  - Supabase for meme templates and user data
  - Upstash Redis for notifications

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. Set up environment variables:

Create a `.env.local` file with the following variables:

```bash
# Frame Configuration
NEXT_PUBLIC_URL=https://mini-memes.xyz
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=mini-memes
NEXT_PUBLIC_ICON_URL=/favicon.png
NEXT_PUBLIC_IMAGE_URL=/opengraph.png
NEXT_PUBLIC_SPLASH_IMAGE_URL=/app.jpg
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#7c3aed

# Farcaster Account Association
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=

# Redis for Notifications
REDIS_URL=
REDIS_TOKEN=

# Supabase for Data Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=

# Optional: Allowed FIDs for Save Feature
NEXT_PUBLIC_ALLOWED_SAVE_FIDS=123,456,789

# Zora Platform Referrer (earns referral fees)
NEXT_PUBLIC_ZORA_REFERRER=0x2CD1353Cf0E402770643B54011A63B546a189c44
```

You can regenerate the FARCASTER Account Association environment variables by running `npx create-onchain --manifest` in your project directory.

3. Start the development server:
```bash
npm run dev
```

## Architecture

### Core Components

1. **TemplateGallery** (`components/TemplateGallery.tsx`)
   - Displays available meme templates in a responsive grid
   - Handles template selection and navigation

2. **MemeBuilder** (`components/MemeBuilder.tsx`)
   - Main orchestrator for meme creation
   - Manages text editing, sharing, and minting features
   - **Zora Integration**: Handles the `handlePostToZora()` function for NFT minting
   - Integrates with Farcaster and Clanker for additional features

3. **EditorCanvas** (`components/EditorCanvas.tsx`)
   - Fabric.js canvas implementation
   - Handles meme template background and text overlays
   - Responsive canvas sizing

### API Routes

- `/api/upload-meme`: Uploads generated memes to Vercel Blob storage
- `/api/user-memes`: CRUD operations for user's saved memes
- `/api/meme-template/[id]`: Fetches individual meme templates
- `/api/launch-token`: Records token launches via Clanker
- `/api/notify` & `/api/webhook`: Farcaster notification handling

### State Management

- **useMemeStore** (`stores/use-meme-store.ts`): Global meme creation state
- **useEditorStore** (`stores/useEditorStore.ts`): Canvas editor state

### Data Flow

1. User selects template from gallery → Navigates to `/template/[id]`
2. Template loads in EditorCanvas with predefined text boxes
3. User adds/edits text using Fabric.js interactive controls
4. Generated meme can be:
   - Shared to Farcaster with compose cast action
   - **Minted as Zora Coin NFT** (see Zora Integration below)
   - Launched as token via Clanker
   - Saved to user profile (if FID is allowed)

## Zora Integration 🌟

Mini Memes leverages **Zora's Coins SDK** to enable users to mint their memes as NFT collections on Base. Here's how it works:

### Minting Process

1. **"Coin It" Button**: Users click this button after creating their meme
2. **Metadata Creation**: The app uploads meme metadata (name, symbol, description, image) to IPFS
3. **Smart Contract Deployment**: Using `createCoin()` from Zora SDK, we deploy a new ERC-1155 NFT collection
4. **Success Modal**: Users receive a shareable Zora link to their minted collection

### Code Implementation

```typescript
// From components/MemeBuilder.tsx
import { createCoin } from '@zoralabs/coins-sdk';

const result = await createCoin(
  {
    name: data.name,
    symbol: data.symbol,
    uri: metadataUri,
    payoutRecipient: walletAddress,
    platformReferrer: '0x2CD1353Cf0E402770643B54011A63B546a189c44',
    chainId: 8453, // Base chain ID
  },
  walletClient,
  publicClient,
);
```

### Key Benefits of Zora Coins

- **Low Cost**: Affordable minting on Base L2
- **Creator Rewards**: Built-in royalty mechanism for meme creators
- **Social Features**: Collections are shareable and tradeable on Zora.co
- **Composability**: NFTs can be used in other Base/Ethereum applications

### Zora Links

After minting, users receive a link like: `https://zora.co/coin/base:0x...`

This allows them to:
- View their NFT collection
- Share with others
- Manage minting settings
- Track collection activity

### Technical Details

- **Chain**: Base (Chain ID: 8453)
- **Token Standard**: ERC-1155 (multi-token standard)
- **Metadata Storage**: IPFS via Pinata
- **UI Components**: 
  - `CoinModal.tsx`: Form for NFT details (name, symbol, description)
  - `ZoraSuccessModal.tsx`: Success state with share functionality
- **Platform Fee**: 0.000333 ETH per mint (Zora protocol fee)

## Development

### Adding New Meme Templates

1. Add template image to `public/meme-bg/`
2. Insert template record in Supabase `meme_templates` table:
   ```sql
   INSERT INTO meme_templates (template_id, image_url, text_boxes)
   VALUES (
     'template-name',
     '/meme-bg/template-image.jpg',
     '[]' -- JSON array of text box configurations
   );
   ```

### Customizing Text Defaults

Edit `lib/fabric-defaults.ts` to change default text properties:
```typescript
export function getDefaultTextBoxProps() {
  return {
    fontSize: 32,
    fontFamily: 'Impact',
    fill: 'white',
    stroke: 'black',
    strokeWidth: 2,
    // ... other properties
  };
}
```

### Deployment

1. Deploy to Vercel:
   ```bash
   vercel
   ```

2. Set environment variables in Vercel dashboard

3. Configure custom domain (optional)

4. Share your frame URL in Farcaster!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Learn More

- [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit Documentation](https://docs.base.org/builderkits/onchainkit/getting-started)
- [Farcaster Frames](https://docs.farcaster.xyz/developers/frames)
- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Zora Coins SDK](https://docs.zora.co/docs/smart-contracts/creator-tools/coins) - Used for minting meme NFTs
- [Clanker SDK](https://www.clanker.world/docs)

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/yourusername/mini-memes/issues) on GitHub.
