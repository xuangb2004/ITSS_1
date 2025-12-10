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
    if(!window.confirm("Xóa khỏi giỏ hàng?")) return;
    try {
      await cartService.removeFromCart(courseId);
      setCartItems(prev => prev.filter(item => item.course_id !== courseId));
    } catch (err) {
      alert("Lỗi xóa");
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
      alert("Thanh toán thành công!");
      navigate('/my-courses');
    } catch (err) {
      alert("Lỗi thanh toán");
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Đang tải giỏ hàng...</div>;

  return (
    <div style={{maxWidth: '1000px', margin: '40px auto', padding: '0 20px'}}>
      <h1 style={{fontSize: '28px', marginBottom: '20px'}}>ショッピングカート</h1>
      
      {cartItems.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px'}}>
          <p>カートは空です。</p>
          <button onClick={() => navigate('/')} className="btn-login-primary" style={{width: 'auto', marginTop: '10px'}}>
            コースを探す
          </button>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px'}}>
          {/* Danh sách items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.course_id} style={{display: 'flex', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px'}}>
                <img src={item.thumbnail} alt={item.title} style={{width: '120px', height: '70px', objectFit: 'cover', borderRadius: '4px'}} />
                <div style={{flex: 1}}>
                  <h3 style={{fontSize: '16px', margin: '0 0 5px'}}>{item.title}</h3>
                  <p style={{fontSize: '13px', color: '#666'}}>講師: {item.instructor_name}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 'bold', marginBottom: '5px'}}>
                    {Number(item.price) === 0 ? '無料' : `$${Number(item.price).toFixed(2)}`}
                  </div>
                  <button onClick={() => handleRemove(item.course_id)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px'}}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="cart-summary" style={{background: '#f9fafb', padding: '20px', borderRadius: '8px', height: 'fit-content'}}>
            <h3 style={{fontSize: '18px', marginBottom: '15px'}}>合計:</h3>
            <div style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#333'}}>
              ${totalPrice.toFixed(2)}
            </div>
            <button onClick={handleCheckout} className="btn-login-primary" style={{width: '100%', padding: '12px'}}>
              レジに進む
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;