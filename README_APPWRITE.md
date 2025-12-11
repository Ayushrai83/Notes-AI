# Appwrite Integration Setup

## Quick Start

### 1. Create Appwrite Project
- Go to [Appwrite Console](https://cloud.appwrite.io) and create a new project
- Copy the **Project ID** from Settings

### 2. Enable Authentication
- Go to **Auth** > **Settings**
- Enable **Email/Password** authentication

### 3. Create Database & Collection
- Go to **Databases** > Create Database (copy the **Database ID**)
- Create a Collection named `notes` (copy the **Collection ID**)
- Add these attributes to the collection:

| Attribute | Type   | Size | Required |
|-----------|--------|------|----------|
| title     | String | 255  | Yes      |
| content   | String | 50000| Yes      |
| userId    | String | 255  | Yes      |
| createdAt | String | 255  | Yes      |
| updatedAt | String | 255  | Yes      |

### 4. Set Collection Permissions
- Go to Collection **Settings** > **Permissions**
- Add permission for **Users** role with:
  - Create, Read, Update, Delete (all checked)
- Or for document-level permissions, enable them in settings

### 5. Create Indexes (Required)
- Go to Collection > **Indexes**
- Create index on `userId` (Type: Key)
- Create index on `updatedAt` (Type: Key)
- (Optional) Create FullText index on `content` for server-side search

### 6. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.local .env.local
```

Fill in your values:
```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<your-project-id>
VITE_APPWRITE_DB_ID=<your-database-id>
VITE_APPWRITE_COLLECTION_ID=<your-collection-id>
```

### 7. Restart Dev Server
```bash
npm run dev
```

## Switching Modes

- **Appwrite Mode**: Set all `VITE_APPWRITE_*` variables in `.env.local`
- **LocalStorage Mode**: Remove or comment out the variables

The app automatically falls back to localStorage if Appwrite is not configured.

## Security Notes

⚠️ **Never expose admin API keys in client code**
- The Appwrite JS SDK uses the public project ID only
- For privileged operations, use Appwrite Server SDK in a backend/serverless function
- Document-level permissions ensure users can only access their own notes

## Troubleshooting

- **CORS errors**: Add your app URL to Appwrite Console > Settings > Platforms
- **Permission denied**: Check collection permissions allow Users role
- **Missing attributes**: Ensure all 5 attributes exist with correct types
