# Expense Tracker

A professional, full-stack personal finance application designed to track cash flows, manage category budgets with real-time breach warning indicators, and automate recurring transactions. This system is built using a React client-side interface and a Python Flask REST API backed by a MySQL database.

---

## Technical Stack

### Frontend
* **Core Library**: React (built with Vite for fast HMR compilation)
* **Styling**: Tailwind CSS (class-based dark mode toggles)
* **Routing**: React Router DOM
* **State Management**: React Context API (Auth, Category, and Transaction scopes)
* **Data Visualization**: Recharts (Pie Chart and Bar Chart projections)

### Backend
* **Framework**: Flask (Python REST API)
* **Database Driver**: PyMySQL (Raw SQL querying with parameter binding)
* **Session Management**: Secure, server-side session cookies (SameSite Lax configuration)
* **Security**: SHA-256 cryptography with unique user-specific salts for password hashing
* **CORS Handling**: Flask-CORS with credentials enabled

### Database
* **Database Management System**: MySQL 8.x
* **Migration Handler**: Programmatic table checking and altering (automatic schema creation on server launch)

---

## Core Features

### 1. Dashboard & Financial Indicators
* **Cash Flow Aggregates**: Real-time monthly calculations of total income, expenses, and net balance.
* **Savings Index**: Tracks the current month's savings ratio with dynamic progress displays.
* **Cash Flow Charts**: Renders monthly income vs expense bar charts for the current year.
* **Custom Tooltips**: Interactive chart hover displays styled compactly to match the user's active theme.

### 2. Category Settings & Budget Targets
* **Split Category Workflow**: Separate forms for creating a category (assigning color tags and type) and setting/updating monthly spending limits.
* **Color Suggestions**: Pre-selects unused colors from a professional color palette to prevent matching color conflicts.
* **Active Alert System**: Highlights categories that have breached or are approaching (>= 80% usage) their budget limit.

### 3. Transaction Logging & Date Picker Integration
* **Intelligent Date Defaults**: Forms initialize automatically with today's date in local time format.
* **Calendar Input Integration**: Triggers native browser date pickers immediately on clicking anywhere inside the date input box.
* **Real-time Overdraft Alerts**: Checks monthly category spend on the fly and issues visual warnings if a transaction will exceed the category budget. Shows prompts if an expense drops the overall balance below zero.

### 4. Recurring Transaction Engine
* **Interval Scheduler**: Creates transaction templates with daily, weekly, or monthly intervals.
* **Background Auto-Generation**: Dynamically creates child occurrences up to today whenever a user retrieves their transactions, safely avoiding double generation.

---

## Database Schema

The database uses three primary tables:
1. **users**: Stores usernames, hashed passwords, and cryptographic salts.
2. **categories**: Stores user-configured categories with distinct types (income, expense, both), color hex values, and budget limits.
3. **transactions**: Tracks amounts, descriptions, categories, timestamps, tags, and recurrence links (`parent_recurring_id`).

---

## Installation & Setup

### Prerequisites
* Python 3.8+
* Node.js 18+
* MySQL Server 8.0+

### 1. Database Setup
1. Open your MySQL client and create a new schema named `expense_tracker`:
   ```sql
   CREATE DATABASE expense_tracker;
   ```
2. Configure the database credentials in `backend/config.py`. Ensure your DB hostname, user, password, and port match your local MySQL configuration.

### 2. Backend Setup
1. Open a terminal and navigate to the project directory:
   ```bash
   cd Sushma_Expense_Tracker
   ```
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Start the Flask application:
   ```bash
   python backend/app.py
   ```
   *The server runs at http://127.0.0.1:5000. It will automatically run the migrations and create the tables inside the `expense_tracker` database.*

### 3. Frontend Setup
1. Open a second terminal window and navigate to the project directory.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the React development environment:
   ```bash
   npm run dev
   ```
   *The interface runs at http://localhost:5173.*

---

## Author
* **Sushma Reddy**
* Indian Institute of Technology Kharagpur
* B.Tech Computer Science and Engineering
