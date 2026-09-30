# 📸 SnapFind - QR Photo Finder

A SaaS platform for event photographers to organize and share photos using QR codes and AI-powered face matching.

## 🌟 Features

- **QR Code Generation** — Create unique QR codes for each event
- **AI Face Recognition** — Match guest selfies to event photos
- **Photo Management** — Upload, organize, and manage event galleries
- **Guest Experience** — Scan QR → Upload Selfie → Get Matched Photos
- **Analytics Dashboard** — Track searches, downloads, and engagement
- **Multi-tenant** — Support for multiple photographers with individual dashboards
- **Responsive Design** — Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

**Frontend:** React 18, React Router, Tailwind CSS, React Hook Form, Axios  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Multer

## 🔧 Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd qr-photo-finder

# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Start development servers (in separate terminals)
npm run dev:backend    # Backend on http://localhost:5000
npm run dev:frontend   # Frontend on http://localhost:3000
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Events
- `GET /api/events` — List events
- `POST /api/events` — Create event
- `GET /api/events/:slug` — Event details
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event

### Photos
- `POST /api/events/:id/photos/upload` — Upload photos
- `GET /api/events/:id/photos` — Get photos
- `DELETE /api/photos/:id` — Delete photo

### Public (Guest)
- `GET /api/public/events/:slug` — Public event info
- `POST /api/public/events/:slug/search` — Search by selfie

### Analytics
- `GET /api/analytics/dashboard` — Dashboard stats
- `GET /api/analytics/events/:id` — Event analytics

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values.

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret (64+ chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FACE_RECOGNITION_PROVIDER` | `aws`, `facepp`, or `local` |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:3000`) |

## 🔒 Security

- JWT authentication
- CORS protection
- Rate limiting
- Input validation
- File type validation
- Secure headers (Helmet)

## 📱 Usage

### Photographers
1. Register and log in to the dashboard
2. Create events and generate QR codes
3. Upload event photos
4. Share QR codes with attendees
5. Monitor analytics

### Guests
1. Scan the event QR code
2. Upload a selfie
3. Get your matched photos instantly
4. Download individually or in bulk
