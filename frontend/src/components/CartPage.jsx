import React from 'react';
import { useNavigate } from 'react-router-dom';

function CartPage({ cartItems = [], handleRemove, handleCheckout, totalPrice = 0 }) {
  const navigate = useNavigate();
  const API_BASE_URL = "https://itss-1-pz9y.onrender.com";

  const getImageUrl = (thumbnailPath) => {
    if (!thumbnailPath) return "https://placehold.co/400x200?text=No+Image";
    if (thumbnailPath.startsWith("http")) return thumbnailPath;
    const cleanPath = thumbnailPath.startsWith("/") ? thumbnailPath : `/${thumbnailPath}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* NÚT HOME Ở TRÊN CÙNG BÊN TRÁI */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'none', 
            border: 'none', 
            color: '#10b981', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '0'
          }}
        >
          <i className="fa-solid fa-house"></i>
          <span>ホーム (Trang chủ)</span>
        </button>
      </div>

      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>ショッピングカート</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px' }}>
          <p>カートは空です。</p>
          <button onClick={() => navigate('/')} className="btn-login-primary" style={{ width: 'auto', marginTop: '10px' }}>
            コースを探す
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.course_id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px' }}>
                {/* SỬ DỤNG HÀM getImageUrl TẠI ĐÂY */}
                <img 
                  src={getImageUrl(item.thumbnail)} 
                  alt={item.title} 
                  style={{ width: '120px', height: '70px', objectFit: 'cover', borderRadius: '4px' }} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://placehold.co/400x200?text=No+Image";
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 5px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#666' }}>講師: {item.instructor_name || "Unknown Instructor"}</p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {Number(item.price) === 0 ? '無料' : `$${Number(item.price).toFixed(2)}`}
                  </div>
                  <button onClick={() => handleRemove(item.course_id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary" style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>合計:</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
              ${totalPrice.toFixed(2)}
            </div>
            <button onClick={handleCheckout} className="btn-login-primary" style={{ width: '100%', padding: '12px' }}>
              レジに進む
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;