import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminActivePage = () => {
    const navigate = useNavigate();
    const [activeBoards, setActiveBoards] = useState([]);
    const [newArea, setNewArea] = useState({ name: '', pricePerMinute: '', pricePerView: '' });
    const [message, setMessage] = useState('');

    const fetchActiveBoards = async () => {
        try {
            const response = await api.get('/areas/admin/dashboard', {
                headers: { 'Admin-Key': 'admin1234' }
            });
            setActiveBoards(response.data.activeBoard || []);
        } catch (error) {
            console.error('שגיאה בטעינת הלוחות הפעילים', error);
        }
    };

    useEffect(() => {
        fetchActiveBoards();
        
        // בונוס: אם את רוצה שהדף יתרענן לבד כל 10 שניות כדי לראות רווחים מתעדכנים מבלי ללחוץ F5
        // const interval = setInterval(fetchActiveBoards, 10000);
        // return () => clearInterval(interval);
    }, []);

    const handleAddArea = async (e) => {
        e.preventDefault();
        try {
            await api.post('/areas', {
                name: newArea.name,
                pricePerMinute: parseFloat(newArea.pricePerMinute),
                pricePerView: parseFloat(newArea.pricePerView)
            }, {
                headers: { 'Admin-Key': 'admin1234' }
            });
            setMessage('האזור נוסף בהצלחה!');
            setNewArea({ name: '', pricePerMinute: '', pricePerView: '' });
            setTimeout(() => setMessage(''), 3000);
            fetchActiveBoards(); 
        } catch (error) {
            setMessage('שגיאה בהוספת האזור.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    // --- חישובים גלובליים בזמן אמת לכרטיסיות המידע ---
    
   // 1. סך הכל פרסומות באוויר בכל האזורים
const totalActiveAdsCount = activeBoards.reduce((total, board) => {
    return total + (board.ads ? board.ads.length : 0);
}, 0);

// 2. חישוב הרווח הכללי המצטבר מכל האזורים
const globalTotalProfit = activeBoards.reduce((globalSum, board) => {
    const boardProfit = (board.ads || []).reduce((sum, ad) => sum + (ad.price || 0), 0);
    return globalSum + boardProfit;
}, 0);
    return (
        <div dir="rtl" style={{ fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', paddingBottom: '40px' }}>
            
            <div style={{ backgroundColor: '#0a192f', padding: '15px 40px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: 'white', margin: '0 0 0 30px', fontSize: '1.5rem' }}>מוניטור מערכת</h2>
                <button style={{ backgroundColor: '#d4af37', color: '#0a192f', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    פרסומות באוויר
                </button>
                <button onClick={() => navigate('/admin/pending')} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                    תור ממתינים
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
                
                {/* --- אזור כרטיסיות נתונים (KPIs) גלובלי --- */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRight: '5px solid #2ecc71' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '1.1rem', fontWeight: 'bold' }}>סך הכנסות מפרסום פעיל</p>
                        <h2 style={{ margin: 0, color: '#27ae60', fontSize: '2.5rem' }}>₪{globalTotalProfit.toFixed(2)}</h2>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRight: '5px solid #3498db' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '1.1rem', fontWeight: 'bold' }}>סה"כ קמפיינים באוויר</p>
                        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '2.5rem' }}>{totalActiveAdsCount} <span style={{ fontSize: '1rem', color: '#95a5a6' }}>פרסומות</span></h2>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRight: '5px solid #9b59b6' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '1.1rem', fontWeight: 'bold' }}>אזורי פרסום פעילים</p>
                        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '2.5rem' }}>{activeBoards.length} <span style={{ fontSize: '1rem', color: '#95a5a6' }}>אזורים</span></h2>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    
                    {/* --- הוספת אזור (סיידבר ימני) --- */}
                    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: '20px' }}>
                        <h3 style={{ marginTop: 0, color: '#0a192f' }}>+ הוספת אזור פרסום</h3>
                        {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '15px', borderRadius: '4px' }}>{message}</div>}

                        <form onSubmit={handleAddArea} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>שם האזור:</label>
                                <input type="text" required value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מחיר לדקה (₪):</label>
                                <input type="number" step="0.1" min="0" required value={newArea.pricePerMinute} onChange={e => setNewArea({...newArea, pricePerMinute: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מחיר לצפייה (₪):</label>
                                <input type="number" step="0.1" min="0" required value={newArea.pricePerView} onChange={e => setNewArea({...newArea, pricePerView: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" style={{ padding: '10px', backgroundColor: '#0a192f', color: '#d4af37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>שמור אזור</button>
                        </form>
                    </div>

                    {/* --- לוחות פרסומות פעילות --- */}
                    <div style={{ flex: 2 }}>
                        {activeBoards.length === 0 ? (
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>אין אזורים במערכת</div>
                        ) : (
                            activeBoards.map((board, index) => {
                                console.log('Board object:', board); // תוסיפי את זה
                              const ads = board.ads || [];
                               console.log('Ads found in this board:', ads); // ותוסיפי גם את זה
                               const areaTitle = board.area ? board.area.name : `אזור ${index + 1}`;
                                // חישוב רווח ספציפי לאזור הזה
                                const areaProfit = ads.reduce((sum, ad) => sum + (ad.price || 0), 0);
                                
                                return (
                                    <div key={index} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                                            <h3 style={{ margin: 0, color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ width: '12px', height: '12px', backgroundColor: '#2ecc71', borderRadius: '50%', display: 'inline-block' }}></span>
                                                {areaTitle} ({ads.length})
                                            </h3>
                                            <span style={{ backgroundColor: '#e8f8f5', color: '#117a65', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1rem', border: '1px solid #a3e4d7' }}>
                                                רווח אזור: ₪{areaProfit.toFixed(2)}
                                            </span>
                                        </div>
                                        
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'right' }}>
                                                    <th style={{ padding: '12px' }}>קוד</th>
                                                    <th style={{ padding: '12px' }}>שם הפרסומת</th>
                                                    <th style={{ padding: '12px' }}>לקוח</th>
                                                    <th style={{ padding: '12px' }}>שולם</th>
                                                    <th style={{ padding: '12px' }}>הקלקות</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ads.length === 0 ? (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>אין פרסומות באזור זה</td></tr>
                                                ) : (
                                                    ads.map(ad => (
                                                        <tr key={ad.code} style={{ borderBottom: '1px solid #eee' }}>
                                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>#{ad.code}</td>
                                                            <td style={{ padding: '12px' }}>{ad.title || 'ללא שם'}</td>
                                                            {/* במקום ad.customerId, נציג את השם */}
                                                            <td style={{ padding: '12px' }}>
                                                                {ad.customer ? ad.customer.name : 'לא ידוע'}
                                                            </td>
                                                            <td style={{ padding: '12px', fontWeight: 'bold', color: '#27ae60' }}>₪{ad.price || 0}</td>
                                                            <td style={{ padding: '12px' }}>{ad.clicksCount || 0}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminActivePage;