import React, { useState } from 'react';
import api from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
// בתוך LoginPage_2.js, עדכני את פונקציית ההתחברות:
const handleLogin = async (e) => {
    e.preventDefault();
    
    // זיהוי מנהל המערכת (Admin)
    if (email === 'admin' && password === 'admin1234') {
        const adminUser = { role: 'ADMIN', name: 'מנהל ראשי' };
        localStorage.setItem('admin', JSON.stringify(adminUser));
        window.location.href = '/home'; // מעבר לדף הבית כדי שה-Navbar יתעדכן
        return;
    }

    // התחברות לקוח רגיל מול השרת
    try {
        const response = await api.post(`/customers/login?email=${email}&password=${password}`);
        localStorage.setItem('customer', JSON.stringify(response.data));
        window.location.href = '/home';
    } catch (error) {
        setMessage('שגיאה: אימייל או סיסמה לא נכונים.');
    }
};

    return (
        <div style={{ padding: '20px' }}>
            <h2>התחברות למערכת</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="אימייל" onChange={(e) => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="סיסמה" onChange={(e) => setPassword(e.target.value)} required /><br />
                <button type="submit">התחבר</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default LoginPage;