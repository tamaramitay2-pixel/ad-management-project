import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminPendingPage = () => {
    const navigate = useNavigate();
    const [pendingBoards, setPendingBoards] = useState([]);

    const fetchPendingBoards = async () => {
        try {
            const response = await api.get('/areas/admin/dashboard', {
                headers: { 'Admin-Key': 'admin1234' }
            });
            setPendingBoards(response.data.pendingBoard || []);
        } catch (error) {
            console.error('שגיאה בטעינת לוחות הממתינים', error);
        }
    };

    useEffect(() => {
        fetchPendingBoards();
    }, []);

    // פונקציית עזר לעיצוב התאריך
    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div dir="rtl" style={{ fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', paddingBottom: '40px' }}>
            
            <div style={{ backgroundColor: '#0a192f', padding: '15px 40px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: 'white', margin: '0 0 0 30px', fontSize: '1.5rem' }}>מוניטור מערכת</h2>
                <button onClick={() => navigate('/admin/active')} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                    פרסומות באוויר
                </button>
                <button style={{ backgroundColor: '#d4af37', color: '#0a192f', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    תור ממתינים (חלוקה לאזורים)
                </button>
            </div>

            <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
                
                {pendingBoards.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', textAlign: 'center', fontSize: '1.2rem' }}>המערכת ריקה מאזורים</div>
                ) : (
                    pendingBoards.map((board, index) => {
                       
                        const ads = board.ads || [];
                        const areaTitle = board.area ? board.area.name : `אזור ${index + 1}`;

                        return (
                            <div key={index} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
                                <h3 style={{ marginTop: 0, color: '#f39c12', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                                    <span style={{ width: '12px', height: '12px', backgroundColor: '#f39c12', borderRadius: '50%', display: 'inline-block' }}></span>
                                    {areaTitle} - ממתינים בתור ({ads.length})
                                </h3>
                                
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'right' }}>
                                            <th style={{ padding: '12px' }}>מיקום בתור</th>
                                            <th style={{ padding: '12px' }}>קוד</th>
                                            <th style={{ padding: '12px' }}>שם הפרסומת</th>
                                            <th style={{ padding: '12px' }}>לקוח</th>
                                            <th style={{ padding: '12px' }}>תאריך יצירה</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ads.length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>אין פרסומות הממתינות בתור זה</td></tr>
                                        ) : (
                                            ads.map((ad, adIndex) => (
                                                <tr key={ad.code} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#f39c12' }}>#{adIndex + 1} בתור</td>
                                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>#{ad.code}</td>
                                                    <td style={{ padding: '12px' }}>{ad.title || 'ללא שם'}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        {ad.customer ? ad.customer.name : 'לא ידוע'}
                                                    </td>
                                                    <td style={{ padding: '12px', color: '#555' }}>{formatDate(ad.creationDate)}</td>
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
    );
};

export default AdminPendingPage;