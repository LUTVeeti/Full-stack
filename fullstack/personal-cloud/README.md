# My Cloud — Personal Cloud Storage (MERN)

I wanted to make something that I could actually use in the future so herer is a personal cloud storage app for movies, videos, pictures, and other files. I especially focused in making the user experience intuitive, with an UI that should look familiar to most users.

## Stack

- MongoDB — users, folders, file metadata
- Express + Node.js — REST API, auth, uploads, range-request video/audio streaming
- React (Vite) — Frontend
- Files are stored on local disk under `backend/uploads/` (metadata in MongoDB)

## Features implemented

- Email/password auth (JWT + bcrypt)
- Nested folders, breadcrumb navigation, sidebar folder tree
- Drag-and-drop upload (anywhere in the file view) and click-to-upload, multiple files at once, with progress toasts
- Details view (Name / Date modified / Type / Size) and large-icons grid view, like Explorer
- Image thumbnails (generated server-side with `sharp`)
- In-browser image/video/audio preview with proper HTTP range-request streaming (so you can scrub video, not just download it)
- Rename, delete (to Recycle Bin), restore, permanent delete
- Move files/folders by dragging them onto a sidebar folder or a folder row
- Search by file/folder name
- Per-user storage quota with a usage bar in the status bar
- Right-click context menus, multi-select (Ctrl/Cmd-click, Shift-click)

## Project structure

```
personal-cloud/
  backend/
    config/db.js            
    models/                 
    middleware/              
    controllers/              
    routes/                   
    uploads/                   
    server.js
    .env
  frontend/
    src/
      api/                     
      context/AuthContext.jsx
      components/              
                                
      styles/index.css         
    .env
```


### 1. Backend

```bash
cd backend
# edit .env: set MONGO_URI and a real JWT_SECRET
npm install
npm run dev        # nodemon, or `npm start` for plain node
```

The API runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

The app runs on `http://localhost:5173`. Register an account, then start creating folders and uploading files.

AI Statement:
AI (claude) was used in making this read me look clean, also it was used to debug and help with UI design.


