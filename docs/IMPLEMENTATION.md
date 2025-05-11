# Meme Generator Farcaster Mini App - Implementation Document

## Overview
A mini app that allows Farcaster users to create, share, and mint memes directly within the Farcaster ecosystem.

## User Flow

### 1. Meme Selection Screen
- Grid gallery of popular meme templates
- Search functionality to find specific memes
- "Recent" section for frequently used templates
- Pagination to browse through all available templates

### 2. Meme Editor Screen
- Dynamic text box placement based on template
- Text formatting options (size, color, font)
- Ability to add additional text boxes
- Option to adjust text box positions
- Preview button to navigate to next screen

### 3. Preview & Share Screen
- Full preview of the created meme
- Sharing options:
  - Post to Farcaster feed with one-click
  - Mint as NFT on Zora
  - Request DM delivery

## Technical Implementation

### Frontend Components
- Template Gallery Component (responsive grid)
- Meme Editor Component (canvas-based)
- Text Overlay Manager (handles text positioning)
- Preview Component
- Action Buttons Component (post/mint/DM)

### Backend Services
- Meme Template Database (with metadata for text placement)
- Image Generation Service
- Farcaster Integration Service
- Zora Minting Service
- DM Delivery Service

### API Endpoints
- GET /templates - Retrieve available meme templates
- POST /generate - Generate meme with provided text
- POST /post - Post to Farcaster
- POST /mint - Mint on Zora
- POST /dm - Send as DM

## Integration Details

### Farcaster Integration
- Use Farcaster's Frame API to embed the mini app
- Authenticate users via Farcaster authentication
- Post directly to user's feed with appropriate permissions

### Zora Integration
- Connect to Zora API for NFT minting
- Handle wallet connection (likely via WalletConnect)
- Set default minting parameters with user override options

### DM Delivery
- Generate and store image on server
- Use Farcaster's DM API to deliver image to user
- Include option for sharing link to regenerate the meme

## Data Models

### Meme Template
```json
{
  "id": "string",
  "name": "string",
  "imageUrl": "string",
  "textAreas": [
    {
      "id": "string",
      "x": "number",
      "y": "number",
      "size": "number",
      "defaultText": "string"
    }
  ]
}
```

### User Meme
```json
{
  "id": "string",
  "templateId": "string",
  "userId": "string",
  "textOverlays": [
    {
      "areaId": "string",
      "text": "string",
      "font": "string",
      "size": "number",
      "color": "string",
      "x": "number",
      "y": "number",
    }
  ],
  "createdAt": "timestamp",
  "imageUrl": "string"
}
```

## Implementation Phases

- Template gallery and selection
- Basic text editing and positioning
- Preview generation
- Farcaster posting
- Zora minting integration
- DM delivery
