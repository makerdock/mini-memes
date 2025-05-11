# composeCast

Open the cast composer with a suggested cast. The user will be able to modify the cast before posting it.

## Usage

```javascript
import { sdk } from '@farcaster/frame-sdk'
 
await sdk.actions.composeCast({ 
  text,
  embeds,
})
```

## Parameters

### text (optional)
**Type**: string

Suggested text for the body of the cast.

Mentions can be included using the human-writeable form (e.g. @farcaster).

### embeds (optional)
**Type**: [] | [string] | [string, string]

Suggested embeds. Max two.

### parent (optional)
**Type**: { type: 'cast'; hash: string }

Suggested parent of the cast.

### close (optional)
**Type**: boolean

Whether the app should be closed when this action is called. If true the app will be closed and the action will resolve with no result.

## Return Value

The cast posted by the user, or undefined if set to close.

## Example

```javascript
const result = await sdk.actions.composeCast({ 
  text: "I just learned how to compose a cast",
  embeds: ["https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast"]
})
```
