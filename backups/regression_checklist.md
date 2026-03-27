# Regression Checklist (Phase 0)

Use this checklist to verify the application after each incremental refactoring step.

## 🔑 Authentication
- [ ] User can register with valid data.
- [ ] User can login and receives a cookie.
- [ ] User can logout (cookie cleared).
- [ ] Profile page correctly displays user information and purchases.
- [ ] Updating profile (name, avatar) works.
- [ ] Changing password works.

## 🎓 Courses
- [ ] Public courses are listed on the home/courses page.
- [ ] Course details (lessons, instructor) display correctly.
- [ ] Admin/Doctor can create a new course with lessons.
- [ ] Purchased course content is accessible in the "Learn" view.
- [ ] Course progress is saved (mark as completed).
- [ ] Delete course removes the record and associated files.

## 📄 Articles
- [ ] Articles list displays published items only.
- [ ] Article details (rich text content) render correctly.
- [ ] Admin/Doctor can publish/edit articles.
- [ ] Delete article works.

## 📦 Packages & Tools
- [ ] Packages list displays with file counts.
- [ ] Authenticated & Authorized user can download the ZIP package.
- [ ] Non-authorized user sees the "Access Required" pretty page.
- [ ] HTML files in packages display with watermark and security injection.

## 📅 Sessions & Bookings
- [ ] User can see doctor's available slots.
- [ ] User can book a session (Status: Pending).
- [ ] Admin can approve a booking (Status: Confirmed, link added).
- [ ] Doctor can manage their own slots (Add/Remove).

## 💳 Payments
- [ ] Manual checkout (Vodafone Cash) creates a pending purchase.
- [ ] Admin can approve a purchase, granting access to the item.
- [ ] Total revenue/stats update correctly after approval.

## 👔 Professional Dashboard
- [ ] Doctor/Specialist see their specific stats.
- [ ] "Settings" button in header navigates to the Portfolio tab.
- [ ] Portfolio updates (bio, price, link) are saved.

## 🏛️ Admin Dashboard
- [ ] Admin can see global stats and monthly charts.
- [ ] Admin can manage users (change roles, status).
- [ ] Admin can see audit logs.
