import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, enrollmentService } from '../services/api';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const items = await cartService.getCart();
      setCartItems(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId) => {
    if(!window.confirm("カートから削除しますか?")) return;
    try {
      await cartService.removeFromCart(courseId);
      setCartItems(prev => prev.filter(item => item.course_id !== courseId));
    } catch (err) {
      alert("エラーが発生しました");
    }
  };

  const handleCheckout = async () => {
    if(cartItems.length === 0) return;
    if(!window.confirm(`Thanh toán ${cartItems.length} khóa học?`)) return;
    
    try {
      // Giả lập mua từng khóa (trong thực tế nên có API checkout bulk)
      for (const item of cartItems) {
        await enrollmentService.enroll(item.course_id);
      }
      alert("購入が成功しました！");
      navigate('/my-courses');
    } catch (err) {
      alert("購入に失敗しました");
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>カートを読み込み中...</div>;

 return (
  <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
    
    {/* --- NÚT HOME Ở TRÊN CÙNG BÊN TRÁI --- */}
    <div style={{ marginBottom: '20px' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'none', 
          border: 'none', 
          color: '#10b981', // Màu xanh lá chủ đạo của logo
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
        {/* Danh sách items */}
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.course_id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px' }}>
              {/* --- SỬA HIỂN THỊ ẢNH TẠI ĐÂY --- */}
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

        {/* Tổng tiền */}
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