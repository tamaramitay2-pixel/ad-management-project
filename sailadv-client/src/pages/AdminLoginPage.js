import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleAdminLogin = (e) => {
        e.preventDefault();
        
        // כאן תכניסי את פרטי המנהל האמיתיים שלך
        if (username === 'admin' && password === 'admin1234') {
            const adminUser = { name: 'מנהל המערכת' };
            localStorage.setItem('admin', JSON.stringify(adminUser));
            navigate('/admin/active'); // העברה ישירה לממשק הניהול
        } else {
            alert('פרטי מנהל שגויים!');
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>כניסת מנהל מערכת בלבד</h2>
            <form onSubmit={handleAdminLogin}>
                <input type="text" placeholder="שם משתמש" onChange={(e) => setUsername(e.target.value)} required /><br />
                <input type="password" placeholder="סיסמה" onChange={(e) => setPassword(e.target.value)} required /><br />
                <button type="submit">התחבר כמנהל</button>
            </form>
        </div>
    );
};

export default AdminLoginPage;