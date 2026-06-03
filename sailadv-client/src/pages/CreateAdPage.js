import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CreateAdPage = () => {
    const user = JSON.parse(localStorage.getItem('customer'));

    // שלב 1 - פרטי הפרסומת
    const [areas, setAreas] = useState([]);
    const [adType, setAdType] = useState('time');
    const [areaId, setAreaId] = useState('');
    const [isFixed, setIsFixed] = useState(false);
    const [metricValue, setMetricValue] = useState('');
    const [link, setLink] = useState(''); 
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    
    // ניהול תצוגה (אשף 2 שלבים)
    const [step, setStep] = useState(1); 
    const [isPaying, setIsPaying] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await api.get('/areas');
                setAreas(response.data);
            } catch (error) {
                console.error('שגיאה בטעינת האזורים', error);
            }
        };
        fetchAreas();
    }, []);

    // חישוב המחיר בזמן אמת עם הכפלה פי 2 לבלעדיות
    let calculatedPrice = 0;
    const selectedArea = areas.find(a => a.id === parseInt(areaId));
    if (selectedArea && metricValue) {
        if (adType === 'time') {
            calculatedPrice = selectedArea.pricePerMinute * parseInt(metricValue);
        } else {
            calculatedPrice = selectedArea.pricePerView * parseInt(metricValue);
        }
        
        if (isFixed) {
            calculatedPrice = calculatedPrice * 2;
        }
    }

    const handleContinueToPayment = (e) => {
        e.preventDefault();
        if (!areaId || !metricValue || !file || !link) {
            setMessage('נא למלא את כל השדות ולבחור תמונה.');
            setMessageType('error');
            return;
        }
        setMessage('');
        setStep(2); 
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        
        setIsPaying(true);
        setMessage('מעבד נתוני אשראי מול חברת הסליקה... 🔒');
        setMessageType('info');

        const adData = {
            customer: { id: user?.id || 1 }, 
            area: { id: parseInt(areaId) },
            fixed: isFixed,
            link: link,
            title: title,
            price: calculatedPrice 
        };

        let endpoint = adType === 'time' ? '/advertisements/time' : '/advertisements/views';
        if (adType === 'time') adData.limitMinutes = parseInt(metricValue);
        else adData.targetViews = parseInt(metricValue);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('ad', new Blob([JSON.stringify(adData)], { type: 'application/json' }));

        setTimeout(async () => {
            try {
                const response = await api.post(endpoint, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                const returnedStatus = response.data;
                if (returnedStatus === 'ACTIVE') {
                    setMessage('התשלום עבר בהצלחה! קבלה נשלחה למייל. הפרסומת שלך באוויר! 🎉');
                    setMessageType('success');
                } else {
                    setMessage('התשלום עבר בהצלחה! הפרסומת שלך נכנסה לתור ותפורסם בקרוב. ⏳');
                    setMessageType('pending');
                }
                setStep(3); 
            } catch (error) {
                console.error(error);
                setMessage('שגיאה בתהליך התשלום. כרטיסך לא חויב.');
                setMessageType('error');
                setIsPaying(false);
            }
        }, 2000);
    };

    // --- עיצוב משותף לשדות הקלט כדי לשמור על מראה נקי ואחיד ---
    const inputStyle = { width: '100%', padding: '12px', border: '1px solid #dcdde1', borderRadius: '6px', backgroundColor: '#fbfcfc', fontSize: '1rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' };

    return (
        <div dir="rtl" style={{ fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px' }}>
            
            <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#0a192f', margin: '0 0 10px 0', fontSize: '2.2rem' }}>LUXURY <span style={{ color: '#d4af37' }}>ADS</span></h1>
                    <p style={{ color: '#7f8c8d', margin: 0, fontSize: '1.1rem' }}>פלטפורמת הפרסום החכמה לעסקים</p>
                </div>

                {/* ----------------- שלב 1: הזנת פרטים ----------------- */}
                {step === 1 && (
                    <>
                        <h2 style={{ color: '#0a192f', borderBottom: '2px solid #d4af37', paddingBottom: '10px', marginBottom: '20px' }}>יצירת קמפיין חדש (שלב 1/2)</h2>
                        <form onSubmit={handleContinueToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            <div>
                                <label style={labelStyle}>סוג קמפיין: </label>
                                <select value={adType} onChange={(e) => setAdType(e.target.value)} style={inputStyle}>
                                    <option value="time">תשלום לפי זמן (דקות)</option>
                                    <option value="views">תשלום לפי צפיות (כמות חשיפות)</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>בחר אזור באתר: </label>
                                <select value={areaId} onChange={(e) => setAreaId(e.target.value)} required style={inputStyle}>
                                    <option value="">-- בחר מיקום לפרסומת --</option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name} (מחיר לדקה: ₪{area.pricePerMinute} | מחיר לצפייה: ₪{area.pricePerView})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                 <label style={labelStyle}>שם הקמפיין (לזיהוי אישי): </label>
                                 <input 
                                     type="text" placeholder="לדוגמה: מבצע טיסות לקיץ 2026"
                                     value={title} onChange={(e) => setTitle(e.target.value)} required 
                                     style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    {adType === 'time' ? 'הגבלת זמן (כמה דקות להציג): ' : 'יעד צפיות (כמה חשיפות לרכוש): '}
                                </label>
                                <input 
                                    type="number" min="1" placeholder="הזן כמות..."
                                    value={metricValue} onChange={(e) => setMetricValue(e.target.value)} required 
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>קישור לאתר שלך (URL): </label>
                                <input 
                                    type="url" placeholder="https://www.your-luxury-site.com"
                                    value={link} onChange={(e) => setLink(e.target.value)} required 
                                    style={inputStyle}
                                />
                            </div>

                            {/* --- תיבת הבלעדיות המעוצבת --- */}
                            <div style={{ backgroundColor: isFixed ? '#fef9e7' : '#f8f9fa', padding: '15px 20px', borderRadius: '8px', border: isFixed ? '2px solid #d4af37' : '1px solid #e0e0e0', transition: 'all 0.3s ease' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#0a192f', fontSize: '1.1rem' }}>
                                    <input 
                                        type="checkbox" checked={isFixed}
                                        onChange={(e) => setIsFixed(e.target.checked)} 
                                        style={{ width: '22px', height: '22px', accentColor: '#d4af37' }}
                                    />
                                    רכישת חסות בלעדית לאזור זה (ללא רוטציה)
                                </label>
                                {isFixed && (
                                    <div style={{ color: '#b9770e', backgroundColor: '#fff8e1', padding: '10px 15px', borderRadius: '6px', borderRight: '4px solid #f1c40f', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '15px' }}>
                                        ⭐ בחרת במיקום פרימיום בלעדי! מחיר הקמפיין הוכפל (פי 2) כדי לשריין את האזור רק עבורך.
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={labelStyle}>העלאת קובץ באנר: </label>
                                <input 
                                    type="file" accept="image/*" 
                                    onChange={(e) => setFile(e.target.files[0])} required 
                                    style={{ ...inputStyle, padding: '10px', backgroundColor: '#fff', border: '1px dashed #b2bec3', cursor: 'pointer' }}
                                />
                            </div>

                            <div style={{ backgroundColor: '#0a192f', color: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: isFixed ? '2px solid #d4af37' : 'none', marginTop: '10px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>סה"כ לתשלום:</span>
                                <span style={{ color: '#d4af37', fontSize: '1.8rem', fontWeight: '900' }}>₪{calculatedPrice.toFixed(2)}</span>
                            </div>

                            <button type="submit" disabled={calculatedPrice === 0} style={{ padding: '18px', backgroundColor: '#d4af37', color: '#0a192f', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '8px', transition: 'background-color 0.3s' }}>
                                המשך לתשלום מאובטח 💳
                            </button>
                        </form>
                    </>
                )}

                {/* ----------------- שלב 2: קופה / תשלום ----------------- */}
                {step === 2 && (
                    <>
                        <h2 style={{ color: '#0a192f', borderBottom: '2px solid #d4af37', paddingBottom: '10px', marginBottom: '20px' }}>קופה מאובטחת (שלב 2/2)</h2>
                        <div style={{ backgroundColor: '#fdfefe', padding: '30px', borderRadius: '8px', border: '1px solid #eaecee', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}>
                            
                            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                <p style={{ margin: 0, color: '#7f8c8d' }}>סכום לחיוב</p>
                                <h3 style={{ margin: '5px 0 0 0', fontSize: '2rem', color: '#0a192f' }}>₪{calculatedPrice.toFixed(2)}</h3>
                            </div>
                            
                            <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>מספר כרטיס אשראי:</label>
                                    <input type="text" placeholder="4580 0000 0000 0000" required maxLength="16" style={inputStyle} />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={labelStyle}>תוקף (MM/YY):</label>
                                        <input type="text" placeholder="12/28" required maxLength="5" style={inputStyle} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={labelStyle}>CVV:</label>
                                        <input type="password" placeholder="123" required maxLength="3" style={inputStyle} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={labelStyle}>שם בעל הכרטיס:</label>
                                    <input type="text" placeholder="הזן שם מלא..." required style={inputStyle} />
                                </div>

                                <button type="submit" disabled={isPaying} style={{ padding: '18px', marginTop: '10px', backgroundColor: isPaying ? '#bdc3c7' : '#0a192f', color: isPaying ? '#7f8c8d' : '#d4af37', border: 'none', borderRadius: '8px', cursor: isPaying ? 'wait' : 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {isPaying ? 'מעבד נתונים...' : 'אישור ותשלום'}
                                </button>
                                
                                <button type="button" disabled={isPaying} onClick={() => setStep(1)} style={{ padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#3498db', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                                    ← חזור לתיקון פרטי הקמפיין
                                </button>
                            </form>
                        </div>
                    </>
                )}

                {/* ----------------- אזור ההודעות והסיום ----------------- */}
                {message && (
                    <div style={{ 
                        marginTop: '25px', padding: '15px 20px', borderRadius: '8px', textAlign: 'center', fontSize: '1.1rem',
                        backgroundColor: messageType === 'error' ? '#fdecea' : messageType === 'success' ? '#e8f8f5' : messageType === 'pending' ? '#fef5e7' : '#f4f6f9',
                        color: messageType === 'error' ? '#e74c3c' : messageType === 'success' ? '#27ae60' : messageType === 'pending' ? '#d35400' : '#2c3e50',
                        border: `1px solid ${messageType === 'error' ? '#e74c3c' : messageType === 'success' ? '#27ae60' : messageType === 'pending' ? '#d35400' : '#bdc3c7'}`,
                        fontWeight: 'bold'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateAdPage;