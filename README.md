# EduGuard

## Description

This project is an E-Learning website developed using MongoDB for the database, Node.js/Express.js for the backend, and HTML, CSS, and JavaScript for the frontend. It provides features for students to view grades, submit assignments, and for teachers to update grades, create assignments, and view submitted assignments. The system incorporates Role-Based Access Control (RBAC) to manage user roles and permissions.

## Features

- Student Features:
  - View Grades
  - Submit Assignments
  - Registration: Students can register by creating a basic account with a simple password, and is then prompted to change the password to meet advanced rules.

- Teacher Features:
  - Update Grades
  - Create Assignments
  - View Submitted Assignments
  - User Management: Admins can see all users in the database and manipulate their roles (promote/demote).

- Admin Privileges:
  - Admins (typically teachers) have privileged roles:
    - Authority to register students into the database.
    - Manage user roles: Admins can promote/demote users based on academic responsibilities.

- Password Policy:
  - During registration, students create a basic account with a simple password.
  - Students are prompted to change their password, which must adhere to the following rules:
    - Minimum 6 characters
    - At least one uppercase letter
    - At least one numeric character
    - At least one special character

- Login Features:
  - Captcha: Implemented Node.js captcha.
  - 2FA Authentication with Email OTP for admin login for enhanced security.

- Database Security:
  - Password Hashing with salting using the bcrypt library in Node.js. Configurable number of salt rounds for password protection.

- Sessions:
  - Passport.js: Efficient session management utilizing MongoDB to store session data.
