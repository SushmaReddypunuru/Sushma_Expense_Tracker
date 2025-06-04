import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer} from 'recharts';

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#AF19FF', '#FF3333', '#33CC33'];

function Dashboard() {
  const { transactions } = useTransactions();

  const income = (transactions.filter((t) => t.type === 'income')).reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const expenses = (transactions.filter((t) => t.type === 'expense')).reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const balance = income - expenses;

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);


  // Pie Chart
  const pieData = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) {
        existing.value += parseFloat(t.amount);
      } else {
        acc.push({ name: t.category, value: parseFloat(t.amount) });
      }
      return acc;
    }, []);

  // Bar Chart Data
  const barData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      if (t.type === 'income') existing.income += parseFloat(t.amount);
      else existing.expense += parseFloat(t.amount);
    } else {
      acc.push({
        month,
        income: t.type === 'income' ? parseFloat(t.amount) : 0,
        expense: t.type === 'expense' ? parseFloat(t.amount) : 0,
      });
    }
    return acc;
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', border: '2px solid green', borderRadius: '8px', flex: 1 }}>
          <h3>Income</h3>
          <p style={{ color: 'green', fontWeight: 'bold' }}>₹{income.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', border: '2px solid red', borderRadius: '8px', flex: 1 }}>
          <h3>Expenses</h3>
          <p style={{ color: 'red', fontWeight: 'bold' }}>₹{expenses.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', border: '2px solid blue', borderRadius: '8px', flex: 1 }}>
          <h3>Balance</h3>
          <p style={{ color: 'blue', fontWeight: 'bold' }}>₹{balance.toFixed(2)}</p>
        </div>
      </div>


      {/* Recent Transactions */}
      <div>
        <h3>Recent Transactions</h3>
        {recent.length === 0 ? (
          <p>No recent transactions.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recent.map((t) => (
              <li
                key={t.id}
                style={{
                  borderLeft: `4px solid ${t.type === 'income' ? 'green' : 'red'}`,
                  padding: '8px',
                  marginBottom: '8px',
                  border: '1px solid #ccc',
                }}
              >
                <strong>{t.type.toUpperCase()}</strong> ₹{parseFloat(t.amount).toFixed(2)} -{' '}
                {t.category} ({new Date(t.date).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Charts Section */}
      <div style={{ marginTop: '40px' }}>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <h3 style={{ marginTop: '40px' }}>Monthly Income & Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#00C49F" />
            <Bar dataKey="expense" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
