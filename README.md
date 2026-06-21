# Smart HRMS (HR Management System)

[![Backend CI](https://github.com/yogesh-naik2003/SMART-HR-MANAGEMENT-SYSTEM/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/yogesh-naik2003/SMART-HR-MANAGEMENT-SYSTEM/actions/workflows/backend-ci.yml)

## Project Overview
Smart HRMS is an AI-powered human resources management system designed to streamline hiring, employee management, payroll, and core HR operations efficiently.

## Features
- **Employee Management:** Manage staff profiles and records.
- **Attendance & Leave:** Tracking and approvals.
- **Payroll:** Automated calculation and slips.
- **AI Integration:** Enhanced resume parsing and smart recommendations.

## Architecture
- **Frontend:** Modern Web UI (React/Next.js/Vite)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Cache / Queues:** Redis (BullMQ)
- **AI Service:** Python / OpenAI (planned)

## Tech Stack
- **Node.js, Express**
- **PostgreSQL, Redis**
- **Docker, Docker Compose**
- **Jest, Supertest**
- **ESLint**

## Setup Instructions
1. Clone the repository: `git clone https://github.com/yogesh-naik2003/SMART-HR-MANAGEMENT-SYSTEM.git`
2. Create your `.env` files based on the `.env.example`.
3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. Or run the backend locally:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## API Docs
*(Coming soon via Swagger)*

## Screenshots
*(Add screenshots of the application here)*