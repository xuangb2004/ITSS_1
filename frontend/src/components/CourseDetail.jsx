import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService, cartService, enrollmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './css/CourseDetail.css';

// 1. ĐỊNH NGHĨA LINK BACKEND
const API_BASE_URL = "https://itss-1-pz9y.onrender.com";

const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// 2. HÀM XỬ LÝ ẢNH (Đã sửa)
const getImageUrl = (path) => {
    // Nếu không có ảnh -> Trả về ảnh mặc định
    if (!path) return "https://placehold.co/400x200?text=No+Image";
    
    // Nếu là link online (http/https) -> Giữ nguyên
    if (path.startsWith('http')) return path;

    // Nếu là đường dẫn file (/uploads/...) -> Ghép link Backend vào
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // State cho Reviews
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load Course Info
        const courseData = await courseService.getCourseById(id);
        setCourse(courseData.course);
        setProgress(courseData.progress || 0);
        setCompletedLessons(courseData.completedMap || []);
        setIsEnrolled(courseData.isEnrolled || false);

        if(courseData.course.curriculum && courseData.course.curriculum.length > 0) {
            setActiveLesson(courseData.course.curriculum[0]);
        }

        // Load Reviews
        const reviewsData = await courseService.getReviews(id);
        setReviews(reviewsData.reviews || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { alert("ログインしてください"); return; }
    try {
      await cartService.addToCart(course.course_id);
      alert("カートに追加しました！");
    } catch (err) { alert(err.response?.data?.message || "カート追加エラー"); }
  };

  const handleMarkComplete = async () => {
    if (!user || !activeLesson) return;
    try {
        const res = await courseService.markLessonComplete({
            lessonId: activeLesson.lesson_id,
            courseId: course.course_id
        });
        setProgress(res.progress);
        if (!completedLessons.includes(activeLesson.lesson_id)) {
            setCompletedLessons([...completedLessons, activeLesson.lesson_id]);
        }
    } catch (err) { console.error(err); }
  };

  const handleBuyNow = async () => {
    if (!user) { alert("ログインしてください"); return; }
    const isFree = Number(course.price) === 0;
    const confirmMessage = isFree ? `無料で登録してください。 "${course.title}"?` : `コースを購入する "${course.title}"?`;
    if (window.confirm(confirmMessage)) {
      try {
        await enrollmentService.enroll(course.course_id);
        alert("登録が完了しました！");
        window.location.reload(); 
      } catch (err) { alert(err.response?.data?.message || "登録エラー"); }
    }
  };

  // Xử lý gửi bình luận
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    try {
        await courseService.addReview(course.course_id, { rating, comment: newComment });
        // Reload reviews
        const reviewsData = await courseService.getReviews(course.course_id);
        setReviews(reviewsData.reviews || []);
        setNewComment("");
        setRating(5);
        alert("レビューをありがとうございます！");
    } catch (err) {
        alert("レビューの送信中にエラーが発生しました: " + (err.response?.data?.message || err.message));
    }
  }

  if (loading) return <div className="loading" style={{textAlign: 'center', padding: '50px'}}>読み込み中...</div>;
  if (!course) return <div style={{textAlign: 'center', padding: '50px'}}>コースが見つかりません</div>;

  const isFree = Number(course.price) === 0;
  const priceDisplay = isFree ? "無料" : `$${Number(course.price).toFixed(2)}`;

  return (
    <div className="course-detail-container">
      {/* ... (PHẦN HERO GIỮ NGUYÊN) ... */}
      <div className="hero" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="hero-left" style={{ flex: 1, minWidth: '300px' }}>
          <h1>{course.title}</h1>
          <p className="hero-subtitle">{course.description}</p>
          <div className="hero-meta">
            <span>レベル： {course.level || 'Beginner'}</span> • 
            <span> 更新日： {new Date(course.created_at).toLocaleDateString()}</span>
          </div>
          
          {user && isEnrolled && (
            <div style={{width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', margin: '15px 0', border: '1px solid rgba(255,255,255,0.2)'}}>
                <div style={{width: `${progress}%`, background: '#10b981', height: '100%', borderRadius: '4px', transition: 'width 0.5s'}}></div>
                <p style={{color: '#10b981', fontSize: '13px', marginTop: '5px', textAlign: 'right', fontWeight: 'bold'}}>{progress}% 完了</p>
            </div>
          )}
          
          <div className="video-section" style={{marginTop: '20px'}}>
             {isEnrolled ? (
                 <>
                    {activeLesson && getYouTubeId(activeLesson.video_url) ? (
                        <div className="video-player-wrapper" style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000'}}>
                           <iframe style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} src={`https://www.youtube.com/embed/${getYouTubeId(activeLesson.video_url)}`} title={activeLesson.title} frameBorder="0" allowFullScreen></iframe>
                        </div>
                    ) : (
                        <div style={{ padding: '60px 20px', background: '#1f2937', color: '#9ca3af', borderRadius: '8px', textAlign: 'center' }}><p>視聴するレッスンを選択してください。</p></div>
                    )}
                    {activeLesson && (
                       <div style={{marginTop: '15px', display: 'flex', justifyContent: 'flex-end'}}>
                           <button onClick={handleMarkComplete} disabled={completedLessons.includes(activeLesson.lesson_id)} style={{ padding: '10px 20px', background: completedLessons.includes(activeLesson.lesson_id) ? '#10b981' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                               {completedLessons.includes(activeLesson.lesson_id) ? <><i className="fa-solid fa-check"></i> 完了</> : "完了としてマークします。"}
                           </button>
                       </div>
                    )}
                 </>
             ) : (
                 <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                     {/* 3. ẢNH PREVIEW (Đã áp dụng getImageUrl) */}
                     <img 
                        src={getImageUrl(course.thumbnail)} 
                        alt="Preview" 
                        style={{ width: '100%', filter: 'brightness(0.7)' }} 
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x450?text=Preview" }} 
                     />
                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white' }}>
                         <i className="fa-solid fa-lock" style={{ fontSize: '30px', marginBottom:'10px' }}></i>
                         <h3>このコースはまだロック解除されていません。</h3>
                     </div>
                 </div>
             )}
          </div>
        </div>

        <div className="hero-right" style={{ width: '350px', flexShrink: 0 }}>
          <div className="course-card-sidebar" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {/* 4. ẢNH SIDEBAR (Đã áp dụng getImageUrl) */}
            <img 
                src={getImageUrl(course.thumbnail)} 
                alt={course.title} 
                style={{ width: '100%', borderRadius: '8px', marginBottom: '15px', aspectRatio: '16/9', objectFit: 'cover' }} 
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x200?text=No+Image" }} 
            />
            {isEnrolled ? (
                 <div style={{ textAlign: 'center', padding: '20px 0' }}>
                     <div style={{ fontSize: '40px', color: '#10b981', marginBottom: '10px' }}><i className="fa-solid fa-circle-check"></i></div>
                     <h3 style={{ color: '#065f46', margin: '0' }}>登録済み</h3>
                 </div>
            ) : (
                 <div className="course-card-body">
                    <div className="course-detail-price" style={{ color: isFree ? '#16a34a' : '#111827', fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>{priceDisplay}</div>
                    <div className="course-card-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {isFree ? <button className="btn primary" onClick={handleBuyNow} style={{background: '#16a34a', padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>登録する</button> : 
                        <><button className="btn primary" onClick={handleBuyNow} style={{background: '#2563eb', padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>今すぐ購入</button>
                        <button className="btn secondary" onClick={handleAddToCart} style={{background: '#f3f4f6', padding: '12px', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>カートに追加</button></>}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="course-main-content" style={{ marginTop: '40px' }}>
        <div className="content-col" style={{ width: '100%' }}>
          
          {/* NỘI DUNG BÀI HỌC */}
          <section className="block-section" style={{marginBottom: '40px'}}>
            <h2>内容</h2>
            <div className="curriculum">
              {course.curriculum && course.curriculum.length > 0 ? (
                course.curriculum.map((lesson, index) => (
                  <div key={lesson.lesson_id} className={`lesson-item ${activeLesson?.lesson_id === lesson.lesson_id ? 'active' : ''}`} onClick={() => isEnrolled ? setActiveLesson(lesson) : alert("ぜひコースをご購入ください！")} style={{ cursor: isEnrolled ? 'pointer' : 'not-allowed', background: activeLesson?.lesson_id === lesson.lesson_id ? '#eff6ff' : 'transparent', padding: '12px', borderBottom: '1px solid #f3f4f6', opacity: isEnrolled ? 1 : 0.6 }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <i className={activeLesson?.lesson_id === lesson.lesson_id ? "fa-solid fa-circle-play" : "fa-regular fa-circle-play"} style={{color: '#2563eb'}}></i>
                        <span style={{flex: 1, fontWeight: '500'}}>役職 {index + 1}: {lesson.title}</span>
                        {completedLessons.includes(lesson.lesson_id) && <i className="fa-solid fa-circle-check" style={{color: '#10b981'}}></i>}
                    </div>
                  </div>
                ))
              ) : <p>まだレッスンがありません。</p>}
            </div>
          </section>

          {/* --- KHU VỰC BÌNH LUẬN / ĐÁNH GIÁ (MỚI) --- */}
          <section className="block-section" id="reviews">
            <h2 style={{borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>評価 ({reviews.length})</h2>
            
            {/* Form nhập bình luận (Chỉ hiện nếu đã đăng ký) */}
            {isEnrolled && (
                <div style={{ marginBottom: '30px', background: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
                    <h4 style={{margin: '0 0 10px 0'}}>あなたの評価を書く</h4>
                    <form onSubmit={handleSubmitReview}>
                        <div style={{marginBottom: '10px'}}>
                            <label style={{marginRight: '10px', fontWeight: 'bold'}}>評価する：</label>
                            <select value={rating} onChange={e => setRating(e.target.value)} style={{padding: '5px', borderRadius: '4px'}}>
                                <option value="5">⭐⭐⭐⭐⭐ (素晴らしい)</option>
                                <option value="4">⭐⭐⭐⭐ (良い)</option>
                                <option value="3">⭐⭐⭐ (普通)</option>
                                <option value="2">⭐⭐ (悪い)</option>
                                <option value="1">⭐ (非常に悪い)</option>
                            </select>
                        </div>
                        <textarea 
                            value={newComment} 
                            onChange={e => setNewComment(e.target.value)} 
                            placeholder="Chia sẻ cảm nghĩ của bạn về khóa học..." 
                            style={{width: '100%', minHeight: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '10px'}}
                            required
                        />
                        <button type="submit" className="btn primary" style={{background: '#2563eb', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>評価を送信</button>
                    </form>
                </div>
            )}

            {/* Danh sách bình luận */}
            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p style={{color: '#666', fontStyle: 'italic'}}>まだ評価がありません。</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.review_id} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                <div style={{width: '32px', height: '32px', background: '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#555'}}>
                                    {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <strong style={{fontSize: '14px'}}>{review.user_name || '匿名ユーザー'}</strong>
                                    <div style={{fontSize: '12px', color: '#f59e0b'}}>
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fa-star ${i < review.rating ? "fa-solid" : "fa-regular"}`}></i>
                                        ))}
                                    </div>
                                </div>
                                <span style={{marginLeft: 'auto', fontSize: '12px', color: '#999'}}>{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <p style={{margin: '5px 0 0 42px', color: '#333', fontSize: '14px'}}>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default CourseDetail;