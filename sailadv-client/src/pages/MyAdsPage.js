import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MyAdsPage = () => {
    const [myAds, setMyAds] = useState([]);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const user = JSON.parse(localStorage.getItem('customer'));

    useEffect(() => {
        const fetchMyAds = async () => {
            if (!user) return; 
            try {
                const response = await api.get(`/advertisements/customer/${user.id}`);
                setMyAds(response.data);
            } catch (err) {
                console.error(err);
                setError('שגיאה במשיכת הפרסומות מהשרת.');
            }
        };
        fetchMyAds();
    }, [user]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (!user) return <div style={{ padding: '20px' }}>עליך להתחבר כדי לצפות באזור האישי.</div>;

    // פונקציית התקדמות (לזמן וצפיות)
    const renderProgress = (ad) => {
        if (ad.type === 'VIEWS') return `${ad.viewsCount || 0} / ${ad.targetViews} צפיות ליעד`;
        
        if (ad.type === 'TIME') {
            if (ad.status === 'PENDING') return `ממתין... (יעד: ${ad.limitMinutes} דק')`;
            if (ad.status === 'COMPLETED') return `הסתיים (${ad.limitMinutes} / ${ad.limitMinutes} דק')`;
            if (ad.status === 'ACTIVE' && ad.creationDate) {
                const startTime = new Date(ad.creationDate);
                let minutesPassed = Math.floor((currentTime - startTime) / 60000);
                if (minutesPassed < 0) minutesPassed = 0; 
                return `${minutesPassed} / ${ad.limitMinutes} דקות עברו`;
            }
        }
        return '-';
    };

    // פונקציה שהופכת את תאריך היצירה מהשרת לתאריך קריא ויפה
    const formatDate = (dateString) => {
        if (!dateString) return 'לא ידוע';
        const d = new Date(dateString);
        return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>האזור האישי - ניהול הקמפיינים שלי</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {myAds.length === 0 && !error ? (
                <p>עדיין לא העלית פרסומות למערכת.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ccc' }}>
                            <th style={{ padding: '10px' }}>קוד</th>
                            <th style={{ padding: '10px' }}>תאריך יצירה</th>
                            <th style={{ padding: '10px' }}>שם / סוג פרסומת</th>
                            <th style={{ padding: '10px' }}>סטטוס</th>
                            <th style={{ padding: '10px' }}>התקדמות יעד</th>
                            <th style={{ padding: '10px' }}>צפיות 👁️</th>
                            <th style={{ padding: '10px' }}>הקלקות 👆</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myAds.map(ad => (
                            <tr key={ad.code} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{ad.code}</td>
                                <td style={{ padding: '10px' }}>{formatDate(ad.creationDate)}</td>
                                
                                {/* אם תוסיפי שם לפרסומת ב-Java, נציג אותו כאן: ad.title */}
                                <td style={{ padding: '10px' }}>
                                    <strong>{ad.title || 'פרסומת מותג'}</strong><br/>
                                    <small style={{ color: 'gray' }}>{ad.type === 'TIME' ? 'מבוסס זמן' : 'מבוסס צפיות'}</small>
                                </td>
                                
                                <td style={{ 
                                    padding: '10px', fontWeight: 'bold',
                                    color: ad.status === 'ACTIVE' ? '#28a745' : ad.status === 'PENDING' ? '#fd7e14' : '#6c757d' 
                                }}>
                                    {ad.status === 'ACTIVE' ? 'באוויר' : ad.status === 'PENDING' ? 'ממתין בתור' : 'הסתיים'}
                                </td>
                                
                                <td style={{ padding: '10px', color: '#007bff', fontWeight: 'bold' }}>{renderProgress(ad)}</td>
                                
                                {/* שדות צפיות והקלקות אוניברסליים לכולם! */}
                                <td style={{ padding: '10px' }}>{ad.viewsCount || 0}</td>
                                <td style={{ padding: '10px' }}>{ad.clicksCount || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyAdsPage;