import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    
    // משיכת המשתמש המחובר מהזיכרון המקומי
    const admin = JSON.parse(localStorage.getItem('admin'));
    const customer = JSON.parse(localStorage.getItem('customer'));
    
    // זיהוי מי מחובר כרגע
    const isLoggedIn = admin || customer;
    const isAdmin = admin !== null;

    const handleLogout = () => {
        // מחיקת נתוני ההתחברות
        localStorage.removeItem('admin');
        localStorage.removeItem('customer');
        navigate('/login');
    };

    return (
        <nav className="main-navbar">
            <div className="nav-brand" onClick={() => navigate('/')}>
                <span className="brand-title">LUXURY</span>
                <span className="brand-subtitle">TRAVEL DEALS</span>
            </div>

            <ul className="nav-links">
                {/* קישורים כלליים וקטגוריות שעברו מה-HomePage */}
                 <li onClick={() => navigate('/home')}>ראשי</li>
                 <li className="nav-item">מלונות יוקרה במבצע</li>
                 <li className="nav-item">אאוטלטים ומותגי על</li>
                 <li className="nav-item">מחלקות עסקים</li>
                {/* --- קישורים למנהל בלבד --- */}
                {isAdmin && (
                    <>
                        <li className="admin-link" onClick={() => navigate('/admin/active')}>מוניטור פעילים</li>
                        <li className="admin-link" onClick={() => navigate('/admin/pending')}>תור ממתינים</li>
                    </>
                )}

                {/* --- קישורים ללקוח בלבד --- */}
                {customer && !isAdmin && (
                    <>
                        <li onClick={() => navigate('/create-ad')}>השקת קמפיין</li>
                        <li onClick={() => navigate('/my-ads')}>הפרסומות שלי</li>
                    </>
                )}

                {/* --- אזור התחברות / ניתוק --- */}
                {!isLoggedIn ? (
                   <>
                       <li className="login-btn" onClick={() => navigate('/login ')}>התחברות</li>
                       <li className="register-btn" onClick={() => navigate('/register')}>הרשמה</li>
                  </>
                ) : (
                    <li className="logout-btn" onClick={handleLogout}>
                        התנתק ({isAdmin ? 'מנהל' : customer.name || 'לקוח'})
                    </li>
                )}
                {/* הוספת קישור נסתר למנהל */}
             {!isLoggedIn && (
               <li 
                 style={{ fontSize: '0.7rem', color: '#555', cursor: 'pointer', marginTop: '10px' }} 
                 onClick={() => navigate('/admin/login')}
              >
                 כניסת מנהל
             </li>
             )}
            </ul>
        </nav>
    );
};

export default Navbar;