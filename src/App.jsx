import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SetCategory from './components/SetCategory'
import { CategoriesProvider } from './context/CategoryContext'
import { TransactionProvider } from './context/TransactionContext'
// import { ThemeProvider } from './context/TransactionContext'
import TransactionForm from './components/TransactionForm'
import TransactionHistory from './components/TransactionHistory'
import Dashboard from './components/Dashboard'
import Home from './components/Home'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      <BrowserRouter>
        <CategoriesProvider>
          <TransactionProvider>
            {/* <ThemeProvider> */}
            <Navbar/>
             <Routes>
              <Route path='/' element={<Home/>}></Route>
              <Route path='/dashboard' element={<Dashboard/>}></Route>
              <Route path='/transactionform' element={<TransactionForm/>}></Route>
              <Route path='/transactionhistory' element={<TransactionHistory/>}></Route>
              <Route path='/categorisation' element={<SetCategory/>}></Route>
             </Routes>
             {/* </ThemeProvider> */}
          </TransactionProvider>
        </CategoriesProvider>
      </BrowserRouter>
    </div>
  )
}

export default App