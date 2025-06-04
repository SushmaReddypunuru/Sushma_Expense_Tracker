import React from 'react'
import {Link} from 'react-router-dom';
import '../compon css/Home.css'


function Home() {
    return (
        <div className='home-container'>
            <h1>Welcome</h1>
            <h3>Smart spending starts here.</h3>
            <Link to="/dashboard"><button>Dashboard</button></Link>
            <Link to="/transactionform"><button>Transaction Form</button></Link>
            <Link to="/transactionhistory"><button>Transaction History</button></Link>
            <Link to="/categorisation"><button>SetCategory</button></Link>
        </div>
    )
}

export default Home