# Gaming Cafe Website

A full-stack website for a gaming cafe, built with React and Node.js.

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Multi-language support (English, Azerbaijani, Russian)

**Backend**
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- JWT authentication with OTP verification
- Nodemailer for email

## Features

- Homepage with sections: hero, about, cases, gallery, FAQ, directions, partners
- User authentication (register, login, OTP email verification)
- Case opening system with promo codes
- User cabinet / profile page
- Admin panel for content management
- Food menu page
- Fully responsive, mobile-friendly

## Getting Started

### Requirements

- Node.js 18+
- MongoDB (local or Atlas)

### Install

```bash
npm run install:all
```

### Configure

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Build for production

```bash
npm run build
```

## Deployment

The project includes Dockerfiles for both frontend and backend, and a `docker-compose.yml` for running everything together.

```bash
docker compose up --build
```

## License

MIT
