import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// רכיב פנימי לדיווח צפייה אוטומטי
const AdImage = ({ ad, isHorizontal, handleAdClick }) => {
    const imgRef = useRef(null);
    const hasReported = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasReported.current) {
                api.get(`/advertisements/view/${ad.code}`).catch(() => {});
                hasReported.current = true;
            }
        }, { threshold: 0.5 });

        if (imgRef.current) observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [ad.code]);

    const imageUrl = `http://localhost:8080/images/media_${ad.code}.jpg`;

    return (
        <img 
            ref={imgRef}
            src={imageUrl} 
            alt={ad.title || "פרסומת"} 
            title={ad.title ? `${ad.title} - לחץ למעבר לאתר` : "לחץ למעבר"}
            onClick={() => handleAdClick(ad.code, ad.link)}
            style={{ 
                width: '100%', 
                maxHeight: isHorizontal ? '150px' : '400px', 
                objectFit: 'cover', 
                cursor: 'pointer',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
            }} 
            onError={(e) => {
                if(e.target.src.endsWith('.jpg')) {
                    e.target.src = `http://localhost:8080/images/media_${ad.code}.png`;
                }
            }}
        />
    );
};

const HomePage = () => {
    const [ads, setAds] = useState([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    useEffect(() => {
        const fetchAdvertisements = async () => {
            try {
                const response = await api.get('/advertisements/active');
                setAds(response.data);
            } catch (err) {
                console.error('שגיאה בטעינת הפרסומות', err);
            }
        };
        fetchAdvertisements();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentAdIndex((prev) => prev + 1), 10000);
        return () => clearInterval(timer);
    }, []);

    const handleAdClick = async (code, link) => {
        try { await api.get(`/advertisements/click/${code}`); } catch (err) {}
        if (link) {
            const validLink = link.startsWith('http') ? link : `https://${link}`;
            window.open(validLink, '_blank', 'noopener,noreferrer');
        }
    };

    const renderAdByArea = (areaName, isHorizontal = false) => {
    // 1. מסננים את כל הפרסומות ששייכות לאזור הזה
    const areaAds = ads.filter(a => areaMapping[a.areaId] === areaName);
    
    // 2. אם אין פרסומות לאזור הזה, לא מציגים כלום
    if (areaAds.length === 0) return null; 

    // 3. בוחרים את הפרסומת לפי האינדקס הנוכחי (הלוגיקה של ההתחלפות)
    const ad = areaAds[currentAdIndex % areaAds.length];

    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
            <span style={{ position: 'absolute', top: '-10px', right: '10px', backgroundColor: '#d4af37', color: 'white', padding: '3px 10px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 'bold', zIndex: 1, letterSpacing: '1px' }}>ממומן</span>
            <AdImage ad={ad} isHorizontal={isHorizontal} handleAdClick={handleAdClick} />
        </div>
    );
};

    const areaMapping = {
        1: 'TOP',
        3: 'RIGHT',
        4: 'LEFT',
        2: 'BOTTOM'
    };

    return (
       <div dir="rtl" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px' }}>
                
                {/* --- אזור TOP --- */}
                <div>
                    {ads.filter(a => areaMapping[a.areaId] === 'TOP')
                         .map((ad) => renderAdByArea('TOP', true))}
                </div>

                <div style={{ display: 'flex', gap: '40px', marginTop: '30px', alignItems: 'flex-start' }}>
                    <main style={{ flex: 3 }}>
                        <h2 style={{ fontSize: '2.5rem', color: '#0a192f', marginBottom: '25px', borderBottom: '4px solid #d4af37', display: 'inline-block', paddingBottom: '5px' }}>
                            דילים חמים: החיים הטובים במרחק טיסה
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                            {/* --- אזור LEFT --- */}
                            {ads.filter(a => areaMapping[a.areaId] === 'LEFT')
                                 .map((ad) => renderAdByArea('LEFT'))}

                            {/* כתבות... */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                                <img src="https://images.unsplash.com/photo-1549877452-9c387286dcb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="בודפשט" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                                <div style={{ padding: '20px' }}>
                                    <span style={{ backgroundColor: '#0a192f', color: 'white', padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px' }}>בודפשט</span>
                                    <h3 style={{ margin: '15px 0 10px 0', color: '#0a192f', fontSize: '1.4rem' }}>מלונות 5 כוכבים בחצי מחיר</h3>
                                    <button style={{ backgroundColor: '#d4af37', color: '#0a192f', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>לדילים החמים ✈️</button>
                                </div>
                            </div>
                            {/* שאר הכתבות... */}
                        </div>
                    </main>

                    <aside style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* --- אזור RIGHT --- */}
                        {ads.filter(a => areaMapping[a.areaId] === 'RIGHT')
                             .map((ad) => renderAdByArea('RIGHT'))}
                    </aside>
                </div>

                {/* --- אזור BOTTOM --- */}
                <div style={{ marginTop: '50px' }}>
                    {ads.filter(a => areaMapping[a.areaId] === 'BOTTOM')
                         .map((ad) => renderAdByArea('BOTTOM', true))}
                </div>
            </div>

            <footer style={{ backgroundColor: '#0a192f', color: '#fff', textAlign: 'center', padding: '30px 20px', marginTop: '40px' }}>
                <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#d4af37' }}>LUXURY TRAVEL DEALS © 2026</p>
                <p style={{ margin: '10px 0 0 0', color: '#bdc3c7', fontSize: '0.9rem' }}>פורטל תיירות הפרימיום והשופינג של ישראל | פלטפורמת פרסום חכמה</p>
            </footer>
        </div>
    );
};

export default HomePage;