# Admin Settings System

## Overview

The admin settings system allows administrators to configure platform-wide settings including:
- Platform branding (name, description)
- Contact and support email addresses
- Upload size limits and moderation thresholds
- Feature toggles (user signups, listing creation)
- Maintenance mode with custom messaging

## Architecture

### Database Structure

Settings are stored in Firestore under:
```
adminConfig/
  └─ settings (document)
```

Audit logs are stored under:
```
auditLogs/ (collection)
  └─ {auto-generated-id} (documents)
```

### API Routes

**GET /api/admin/settings**
- Fetches current platform settings
- Returns default settings if none exist
- Requires admin authentication via session cookie

**PATCH /api/admin/settings**
- Updates platform settings
- Validates input against Zod schema
- Logs changes to audit collection
- Revalidates relevant paths
- Requires admin authentication

### Components

**SettingsForm** (`src/components/admin/SettingsForm.tsx`)
- Client-side form component
- Fetches settings on mount
- Handles form submission and validation
- Shows loading, saving, and success states
- Organized into logical sections (Platform Info, Contact, Moderation, Features, Maintenance)

**SettingsPage** (`src/app/admin/settings/page.tsx`)
- Server-rendered admin page wrapper
- Uses AdminPage layout component
- Renders SettingsForm

### Types

**PlatformSettings** (`src/lib/types.ts`)
```typescript
type PlatformSettings = {
  platformName: string;
  contactEmail: string;
  supportEmail: string;
  siteDescription: string;
  maxUploadSizeMB: number;
  moderationThresholdDays: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  enableUserSignups: boolean;
  enableListingCreation: boolean;
  updatedAt?: Timestamp;
  updatedBy?: string;
};
```

**AuditLog** (`src/lib/types.ts`)
```typescript
type AuditLog = {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes: Record<string, any>;
  timestamp?: Timestamp;
};
```

## Security

- All API endpoints verify session cookies using `adminAuth.verifySessionCookie()`
- User role is verified against the Firestore `users` collection
- Only users with `role === 'ADMIN'` can access settings
- Failed authentication returns 401; failed authorization returns 403
- All changes are logged with admin user ID and change details

## Validation

Input validation uses Zod schema enforcing:
- Platform name: 1-100 characters
- Emails: valid email format
- Site description: 10-1000 characters
- Max upload: 1-1000 MB
- Moderation threshold: 1-365 days
- Boolean fields: true/false

Validation errors are returned with field-level details.

## Audit Logging

Every successful settings update is logged to the `auditLogs` collection with:
- Admin user ID
- Timestamp
- Changed fields (old value → new value)
- Action type and entity type

## Usage

1. Navigate to `/admin/settings`
2. Form auto-loads current settings
3. Edit desired fields
4. Click "Save Settings"
5. Success toast appears on save
6. Last saved timestamp is displayed

For unsaved changes, the "Reset" button reverts form to last saved state.

## Future Enhancements

- Settings versioning/rollback capability
- Bulk settings import/export
- Scheduled maintenance windows
- Settings history viewer with change timeline
- Email template configuration
- Rate limiting and quota configuration
