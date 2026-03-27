# API Documentation (Baseline - Phase 0)

This document records the exact state of the PsychoClub API to ensure 1:1 parity after refactoring.

## 🔐 Authentication & Profile

### `POST /api/auth/register`
- **Body**: `{ name, email, password, phone }`
- **Response**: `{ user: { id, name, email, role, avatar } }`
- **Cookie**: `token` (jwt)

### `POST /api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user: { id, name, email, role, avatar } }`
- **Cookie**: `token` (jwt)

### `POST /api/auth/logout`
- **Response**: `{ success: true }`
- **Action**: Clears `token` cookie.

### `GET /api/auth/me`
- **Auth**: Required (Token)
- **Response**: `{ user: { id, name, email, role, phone, avatar }, purchases }`

### `PUT /api/auth/profile`
- **Auth**: Required (Token)
- **Body**: `{ name, email, phone, avatar }`
- **Response**: Updated user object.

### `PUT /api/auth/password`
- **Auth**: Required (Token)
- **Body**: `{ currentPassword, newPassword }`
- **Response**: `{ message: "تم تحديث كلمة المرور بنجاح" }`

---

## 📚 Courses

### `GET /api/courses`
- **Public**
- **Response**: Array of published courses with instructor info and lessons.

### `POST /api/courses`
- **Auth**: Admin or Doctor (with permission)
- **Body**: `{ title, description, price, isFree, duration, category, level, thumbnail, lessons, whatYouLearn, requirements }`
- **Response**: Created course object.

### `GET /api/courses/:slug`
- **Public**
- **Response**: Single course object with lessons.

### `GET /api/courses/:slug/learn`
- **Auth**: Required + Purchase/Admin
- **Response**: `{ course, progress }`

### `POST /api/courses/progress`
- **Auth**: Required
- **Body**: `{ courseId, lessonId, completed }`
- **Response**: `{ success: true, progress }`

### `DELETE /api/courses/:id`
- **Auth**: Admin or Doctor
- **Response**: `{ success: true }`

---

## 📄 Articles

### `GET /api/articles`
- **Public**
- **Response**: Array of published articles.

### `GET /api/articles/:slug`
- **Public**
- **Response**: Single article object.

### `POST /api/articles`
- **Auth**: Admin or Doctor
- **Body**: `{ title, excerpt, coverImage, contentRichText, tags, category }`
- **Response**: Created article object.

### `DELETE /api/articles/:id`
- **Auth**: Admin or Doctor
- **Response**: `{ success: true }`

---

## 📦 Packages (Tools)

### `GET /api/packages`
- **Public**
- **Response**: Array of published packages.

### `GET /api/packages/:id`
- **Public**
- **Response**: Single package with file list.

### `GET /api/packages/:id/download`
- **Auth**: Required + Purchased/Admin
- **Response**: ZIP file stream.

### `POST /api/admin/packages`
- **Auth**: Admin
- **Body**: `{ title, description, price, coverImage }`

---

## 👨‍⚕️ Professional & Admin

### `GET /api/doctor/me`
- **Auth**: Doctor/Admin
- **Response**: Doctor profile with reviews count.

### `GET /api/doctor/stats`
- **Auth**: Doctor/Admin
- **Response**: Statistics for the dashboard.

### `GET /api/admin/stats`
- **Auth**: Admin
- **Response**: Global platform stats.

### `GET /api/admin/users`
- **Auth**: Admin
- **Response**: List of all users.

---

## 💬 Forum

### `GET /api/forum/posts`
- **Public**
- **Query**: `categoryId`, `search`, `sort`
- **Response**: List of forum threads.

### `POST /api/forum/posts`
- **Auth**: Required
- **Body**: `{ title, body, categoryId }`

---

## Roles & Permissions Matrix

| Role | Access Level |
| :--- | :--- |
| **GUEST** | Read public courses, articles, packages, forum. |
| **USER** | Same as Guest + Book sessions, buy courses, post in forum, rate doctors. |
| **DOCTOR** | Same as User + Manage own portfolio/slots, write articles/courses (if permitted). |
| **SPECIALIST** | Identical to DOCTOR role logic in `server.ts`. |
| **SUPERVISOR** | Manage articles. Restricted from courses/slots by default. |
| **ADMIN** | Full access to all management APIs, users, stats, and audit logs. |
| **SUPER ADMIN** | (admin@psychoclub.space) Can modify roles of other Admins. |
