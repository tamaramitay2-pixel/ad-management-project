import React, { useState } from 'react';
import api from '../services/api';

const RegisterPage = () => {
    // הגדרת המשתנים שהטופס צריך
    const [customer, setCustomer] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');

    // פונקציה ששולחת את הנתונים לשרת
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers/register', customer);
            setMessage('ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר.');
        } catch (error) {
            setMessage('שגיאה בהרשמה, אנא נסה שוב.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>הרשמה למערכת</h2>
            <form onSubmit={handleRegister}>
                <input 
                    placeholder="שם מלא" 
                    onChange={(e) => setCustomer({...customer, name: e.target.value})} 
                    required 
                /><br />
                <input 
                    type="email" 
                    placeholder="אימייל" 
                    onChange={(e) => setCustomer({...customer, email: e.target.value})} 
                    required 
                /><br />
                <input 
                    type="password" 
                    placeholder="סיסמה" 
                    onChange={(e) => setCustomer({...customer, password: e.target.value})} 
                    required 
                /><br />
                <button type="submit">הירשם</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default RegisterPage;