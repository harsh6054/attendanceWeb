# 📧 Attendance Email Notification System

This project is co-owned by: [@harsh6054](https://www.github.com/harsh6054) 

This is a simple **PHP-based Attendance Email Notification Project** that allows users to log in, mark attendance, and send automated email notifications. The project uses **MySQL** as the backend database and is ideal for educational or small office environments.

## 🚀 Features

- ✅ Login system with session handling
- 🧾 Attendance marking functionality
- 📬 Email notifications sent to users/admin
- 🛢️ MySQL database integration
- 🔐 Role-based login (admin/user)

## 🛠️ Technologies Used

- PHP
- MySQL
- HTML/CSS
- Bootstrap (for styling)
- PHPMailer (for email notifications)

## 🔐 Login Credentials (Default)


### Teacher Login
- **Email**: `sits_comp`
- **Password**: `co`

> ⚠️ You can change these credentials directly from the database table named `users`.

## 🗄️ Database

- The SQL file `attendance_db.sql` is included in the repo.
- Import it into your MySQL server to set up the required tables.

## 📁 Project Structure

```bash
attendance-email-notification/
├── index.php            # Login page
├── dashboard.php        # User/Admin dashboard
├── mark_attendance.php  # Attendance marking
├── send_mail.php        # Email sending logic
├── db.php               # Database connection
├── assets/              # CSS/JS files
└── attendance_db.sql    # Database file


