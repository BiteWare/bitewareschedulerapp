# Database Schema Documentation

## Overview
This document describes the database schema for the Biteware Scheduler App. The application uses Supabase (PostgreSQL) as its database.

## Tables

### roles
Stores user roles for access control.

| Column     | Type      | Constraints | Description |
|------------|-----------|-------------|-------------|
| id         | UUID      | PK          | Unique identifier |
| role_name  | TEXT      | UNIQUE, NOT NULL | Name of the role (admin/user) |

### users
Stores user account information.

| Column        | Type      | Constraints | Description |
|--------------|-----------|-------------|-------------|
| id           | UUID      | PK          | Unique identifier |
| email        | TEXT      | UNIQUE, NOT NULL | User's email address |
| password_hash | TEXT      | NOT NULL    | Hashed password |
| role_id      | UUID      | FK          | Reference to roles table |
| created_at   | TIMESTAMP | DEFAULT     | Account creation timestamp |

### projects
Stores project information.

| Column      | Type      | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | UUID      | PK          | Unique identifier |
| user_id     | UUID      | FK, CASCADE | Reference to users table |
| name        | TEXT      | NOT NULL    | Project name |
| description | TEXT      |             | Project description |
| start_date  | DATE      |             | Project start date |
| end_date    | DATE      |             | Project end date |
| created_at  | TIMESTAMP | DEFAULT     | Creation timestamp |
| updated_at  | TIMESTAMP | DEFAULT     | Last update timestamp |

### schedules
Stores scheduling information for users and projects.

| Column      | Type      | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | UUID      | PK          | Unique identifier |
| user_id     | UUID      | FK, CASCADE | Reference to users table |
| project_id  | UUID      | FK, CASCADE | Reference to projects table |
| start_time  | TIMESTAMP |             | Schedule start time |
| end_time    | TIMESTAMP |             | Schedule end time |
| recurring   | BOOLEAN   | DEFAULT     | Whether the schedule repeats |
| created_at  | TIMESTAMP | DEFAULT     | Creation timestamp |

## Relationships
- `users.role_id` → `roles.id`: Many-to-one relationship between users and roles
- `projects.user_id` → `users.id`: Many-to-one relationship between projects and users
- `schedules.user_id` → `users.id`: Many-to-one relationship between schedules and users
- `schedules.project_id` → `projects.id`: Many-to-one relationship between schedules and projects

## Notes
- CASCADE deletion is enabled for projects and schedules when related users are deleted
- Timestamps are stored in UTC
- UUIDs are used as primary keys for better distribution and security