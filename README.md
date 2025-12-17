# 💸 Expense Tracker (React)

This is a simple **Expense Tracker** built using React. It allows users to add, edit, delete, and categorize transactions like income and expenses, with persistent storage using LocalStorage.

---

## 🚀 Features

- 📥 Add new transactions (income/expense)
- ✏️ Edit and delete existing transactions
- 🔍 Search and filter by category/type/description
- 🧾 View full transaction history
- 🗃️ Add and remove custom categories
- 🔁 Support for recurring transactions
- 📊 View total income, expenses, and balance
- 💾 Data saved in LocalStorage

---

## 🗂 Folder Structure

```text
src/
├── css/
│   ├── Categorise.css
│   ├── Home.css
│   ├── TransForm.css
│   └── TransHis.css
│
├── components/
│   ├── Dashboard.jsx
│   ├── Home.jsx
│   ├── SetCategory.jsx
│   ├── TransactionForm.jsx
│   └── TransactionHistory.jsx
│
├── context/
│   ├── CategoryContext.jsx
│   └── TransactionContext.jsx
│
├── App.jsx
├── main.jsx
├── localstorage.js
└── index.html

```

---

## 🧠 Technologies Used

- React
- Context API
- React Router DOM
- LocalStorage
- Vanilla CSS (light mode styling)

---

## ⚙️ Setup Instructions

```bash
# Clone the repo
git clone <your-repo-url>
cd proj2

# Install dependencies
npm install

# Start the development server
npm run dev

# App runs at:
# http://localhost:5173

🙋‍♀️ Author
Made by Sushma Reddy
IIT Kharagpur, B.Tech CSE
