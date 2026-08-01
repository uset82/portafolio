<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/project-bolt-qrmollebakken-supabase/blob/main/project/docs/app-documentation.md; checkedOn: 2026-07-31; redactions: 1 -->

# QR Møllebakken Art Gallery - Documentation

## Overview
QR Møllebakken Art Gallery is a digital platform designed for Møllebakken school that bridges the gap between classroom art activities and parent engagement. The application enables teachers to upload student artwork and allows parents to view their children's creations through secure QR code access.

## Core Features

### 1. User Access System

#### Teacher Portal
- Secure upload interface for student artwork
- Support for multiple media types (images, videos, audio)
- Real-time upload progress tracking
- Student portfolio management
- Recent uploads gallery view
- Storage quota monitoring per student

#### Parent Portal
- QR code-based authentication
- Personalized gallery view of their child's artwork
- Offline viewing capability
- Chronological artwork timeline

### 2. Media Support & Limitations

#### Images
- Maximum 3 images per student
- Supported formats: PNG, JPG, GIF
- Size limit: 10MB per image
- Automatic image optimization

#### Videos
- Maximum 1 video per student
- Duration limit: 20 seconds
- Size limit: 50MB
- Automatic format validation

#### Audio
- Maximum 1 audio recording per student
- Duration limit: 1 minute
- Size limit: 10MB
- Built-in playback controls

### 3. Technical Features

#### Security
- Firebase Authentication integration
- Secure QR code generation
- Parent-specific access control
- Environment variable configuration
- Secure file storage

#### Performance
- Progressive image loading
- Optimized media delivery
- Upload progress tracking
- Automatic retry mechanisms
- Error handling and validation

#### Offline Support
- Offline authentication
- Cached media access
- Automatic synchronization
- Network status monitoring

## How It Works

### 1. Teacher Upload Process
1. Teacher selects a student from the dropdown
2. Chooses media type (image/video/audio)
3. Enters title and optional description
4. Uploads media file
5. Real-time progress tracking
6. Automatic quota validation
7. Success/error notifications

### 2. Parent Access Process
1. Parent receives unique QR code
2. Scans QR code using the application
3. Automatic authentication
4. Redirected to personal gallery
5. Views child's artwork chronologically

### 3. Media Management
- Unique file naming using UUID
- Organized storage structure
- Automatic file type validation
- Size and duration checks
- Quota enforcement

### 4. Storage Structure
```
students/
  ├── [student-name]/
  │   ├── images/
  │   │   ├── [timestamp]-[uuid].jpg
  │   │   ├── [timestamp]-[uuid].png
  │   ├── videos/
  │   │   └── [timestamp]-[uuid].mp4
  │   └── audio/
  │       └── [timestamp]-[uuid].mp3
```

## Student Management
Currently supporting 18 students with individual portfolios and storage quotas.

## Technical Implementation

### Frontend Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React icons

### Backend Services (Firebase)
- Authentication
- Cloud Firestore
- Cloud Storage
- Security Rules

### Key Components
1. `UploadForm`: Handles media upload with progress tracking
2. `MediaViewer`: Universal media display component
3. `QRScanner`: QR code scanning functionality
4. `NetworkStatus`: Online/offline state monitoring

### Error Handling
- Network failure recovery
- Upload retry mechanism
- Quota violation prevention
- Format validation
- Size restriction enforcement

## Security Considerations
1. Authenticated access only
2. Secure QR code generation
3. Parent-specific access control
4. File type validation
5. Size restrictions
6. Storage quota enforcement

## Best Practices
1. Progressive enhancement
2. Responsive design
3. Error feedback
4. Loading states
5. Offline support
6. Accessibility

## Future Enhancements
1. Multi-language support
2. Parent commenting system
3. Teacher annotation tools
4. Advanced media editing
5. Bulk upload capability
6. Enhanced analytics
7. Exhibition mode

## Environment Setup
Required environment variables:
```env
VITE_FIREBASE_API_KEY=
[REDACTED credential-like value]
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Common Issues
1. Upload failures
   - Check file size limits
   - Verify network connection
   - Confirm file type support

2. QR Code scanning
   - Ensure good lighting
   - Hold device steady
   - Check camera permissions

3. Media playback
   - Verify file format support
   - Check network connection
   - Confirm browser compatibility

### Error Messages
- Network errors: Check internet connection
- Upload failures: Verify file size and type
- Authentication errors: Validate QR code
- Storage quota: Check student limits

## Support
For technical support or feature requests, please contact the development team or create an issue in the project repository.
