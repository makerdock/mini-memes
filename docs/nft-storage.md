# NFT.Storage HTTP API Documentation

## Creating Collections
### Endpoint
- **Method**: POST
- **URL**: `/api/v1/collection/create_collection`
- **Auth**: API_KEY
- **Body Param**:
  - `collectionName`: Name of the collection.
  - `contractAddress`: Address of the collection. Requirements by blockchain network:
    - For EVM: contractAddress is mandatory.
    - For Multiversx, Sui, Solana, and Cardano: If no contractAddress is provided, pass a unique string.
    - For Counterparty: Use the asset name as contractAddress.
    - For XRPL: Use the issuer address as contractAddress.
    - For Xahau: Use the hooks address as contractAddress.
  - `chainID`: Blockchain ID.
  - `network`: Blockchain network (e.g., Ethereum, Solana, etc.).
- **Response**: "Collection Created"

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/collection/create_collection' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--data '{
    "contractAddress": "CONTRACT_ADDRESS_OR_RESPECTIVE_STRING",
    "collectionName": "COLLECTION_NAME",
    "chainID": "CHAIN_ID",
    "network": "NETWORK"
}'
```

## NFT.Storage Upload API
### Endpoint
- **Method**: POST
- **URL**: `/api/v1/collection/add_tokens`
- **Auth**: API_KEY
- **Body Param**:
  - `collectionID`: ID of the collection
  - `tokens`: The list of tokens to be added. This parameter is passed as a CSV file.

### CSV Requirements
The accepted structure of the CSV file depends on the blockchain network:

| Network | CSV Header | Details |
|---------|------------|---------|
| Solana | tokenAddress, cid | Each row must include a tokenAddress and cid match in separate columns. Only CSV files are accepted. |
| Sui | objectID, cid | Each row must include an objectID and cid match in separate columns. Only CSV files are accepted. |
| Other Networks | tokenID, cid | Each row must include a tokenID and cid match in separate columns. Only CSV files are accepted. |

**Note**:
- Duplicate Tokens: If a token being added is already backed up by the system, it will not be sent for deal-making again. Instead, it will be marked as a duplicate.
- CSV Format:
  - Ensure the first row in the CSV contains the header values as specified above.
  - Each subsequent row should adhere to the format corresponding to the network.

- **Response**: "Tokens added"

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/collection/add_tokens' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--form 'collectionID="COLLECTION_ID"' \
--form 'file=@"ABSOLUTE_FILE_PATH";type=application/json'
```

## Viewing Collections
### Endpoint
- **Method**: GET
- **URL**: `/api/v1/collection/list_collections`
- **Auth**: API_KEY
- **Response**: List of collections with their details

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/collection/list_collections' \
--header 'Authorization: Bearer YOUR_API_KEY'
```

## Viewing Tokens
### Endpoint
- **Method**: GET
- **URL**: `/api/v1/collection/list_tokens?collectionID=YourCollectionID&lastKey=CollectionLastKey`
- **Auth**: API_KEY
- **Query Param**:
  - `lastKey`: ID of the last fetched token
  - `collectionID`: ID of the collection

**Note**:
- The API will return only 500 tokens of the collection at a time
- Use lastKey as undefined while fetching the first page, and use lastKey as the id of the last fetched token in subsequent queries to get further tokens.

- **Response**: List of tokens of a collection

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/collection/list_tokens?collectionID=YourCollectionID&lastKey=CollectionLastKey' \
--header 'Authorization: Bearer YOUR_API_KEY'
```

## List API Keys
### Endpoint
- **Method**: GET
- **URL**: `/api/v1/auth/list_api_keys`
- **Auth**: API_KEY
- **Response**: List of API keys

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/auth/list_api_keys' \
--header 'Authorization: Bearer YOUR_API_KEY'
```

## Deleting API Key
### Endpoint
- **Method**: DELETE
- **URL**: `/api/v1/auth/remove_api_key`
- **Auth**: API_KEY
- **Response**: API key removed

### Example Request
```bash
curl --location --request DELETE 'https://preserve.nft.storage/api/v1/auth/remove_api_key?keyID=b4afc16a-301a-4c45-b369-13053779889b' \
--header 'Authorization: Bearer YOUR_API_KEY'
```

## Get User Balance
### Endpoint
- **Method**: GET
- **URL**: `/api/v1/user/get_balance`
- **Auth**: API_KEY
- **Response**: User's balance

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/user/get_balance' \
--header 'Authorization: Bearer YOUR_API_KEY'
```

## Get Deal Status
### Endpoint
- **Method**: GET
- **URL**: `/api/v1/collection/deal_status?cid=YOUR_CID`
- **Query Param**:
  - `cid`: The CID (Content Identifier) of the token
- **Response**: Deal status for the specified CID

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/collection/deal_status?cid=YOUR_CID'
```

## Retry Failed Pinning API
### Endpoint
- **Method**: GET
- **URL**: `/api/v1/collection/retry_tokens`
- **Auth**: API_KEY
- **Query Param**:
  - `tokenID`: The CID of the failed token to retry pinning.
- **Response**: "Retry initiated for the specified token"

### Example Request
```bash
curl --location 'https://preserve.nft.storage/api/v1/collection/retry_tokens?tokenID=CID' \
--header 'Authorization: Bearer YOUR_API_KEY'
```

## Delete Failed Pinning API
### Endpoint
- **Method**: DELETE
- **URL**: `/api/v1/collection/delete_tokens`
- **Auth**: API_KEY
- **Query Param**:
  - `tokenID`: The ID of the failed token to delete.
- **Response**: "Failed token deleted successfully"

### Example Request
```bash
curl --location --request DELETE 'https://preserve.nft.storage/api/v1/collection/delete_tokens?tokenID=TOKEN_ID' \
--header 'Authorization: Bearer YOUR_API_KEY'
```