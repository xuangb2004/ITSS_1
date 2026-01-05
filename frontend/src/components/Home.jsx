import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationDropdown from './NotificationDropdown' 
import { courseService, categoryService } from '../services/api' 
import SignUpModal from './SignUpModal'
import SignInModal from './SignInModal'
import CourseCard from './CourseCard'
import SearchBar from './SearchBar'
import InstructorSignUpModal from './InstructorSignUpModal' 

function Home() {
  const navigate = useNavigate()
  const { user, signout } = useAuth()
  
  // --- STATES ---
  // Modals
  const [showSignUp, setShowSignUp] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showInstructorSignUp, setShowInstructorSignUp] = useState(false)

  // Dữ liệu
  const [categories, setCategories] = useState([]) // Danh sách danh mục từ DB
  const [courses, setCourses] = useState([])       // Danh sách khóa học chính
  const [trendingCourses, setTrendingCourses] = useState([]) // Khóa học nổi bật
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all' hoặc ID danh mục
  const [loading, setLoading] = useState(true)

  // --- EFFECTS ---
  useEffect(() => {
    loadInitialData()
  }, [])

  // --- LOGIC TẢI DỮ LIỆU ---
  const loadInitialData = async () => {
    try {
      setLoading(true)
      // 1. Gọi song song: Lấy Danh mục + Khóa học nổi bật + Tất cả khóa học (mặc định)
      const [catData, trendingData, allCoursesData] = await Promise.all([
        categoryService.getAllCategories(),
        courseService.getTrendingCourses(4), // Lấy 4 bài top trending
        courseService.getAllCourses('all')   // Lấy danh sách mặc định
      ])
      
      // Cập nhật State (Tùy theo cấu trúc trả về của API mà .categories hoặc lấy trực tiếp)
      setCategories(catData.categories || catData || [])
      setTrendingCourses(trendingData.courses || trendingData || [])
      setCourses(allCoursesData.courses || allCoursesData || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- LOGIC LỌC DANH MỤC ---
  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    try {
        // Nếu chọn 'all' -> Gọi API lấy tất cả, ngược lại gọi theo ID
        const data = await courseService.getAllCourses(categoryId);
        setCourses(data.courses || []);
    } catch (error) {
        console.error("Lỗi lọc khóa học:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- LOGIC KHÁC ---
  const handleBecomeInstructorClick = (e) => {
    e.preventDefault();
    if (user) {
      if (user.role === 'instructor') {
        alert("Bạn đã là giảng viên rồi!");
        navigate('/dashboard');
      } else {
        alert("Bạn đang đăng nhập với tài khoản học viên. Hãy đăng ký tài khoản giảng viên mới.");
      }
    } else {
      setShowInstructorSignUp(true);
    }
  };

  return (
    <div className="home-wrapper">
      {/* --- HEADER --- */}
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <i className="fa-solid fa-leaf"></i>
            <span>MyCourse.io</span>
          </div>
          
          <SearchBar />

          <div className="nav-actions">
            <button className="nav-btn" onClick={handleBecomeInstructorClick}>
              インストラクターになる
            </button>
            
            <button className="nav-icon" onClick={() => navigate('/forum')} title="フォーラム">
              <i className="fa-solid fa-comments"></i>
            </button>

            {user ? (
              <>
                <div className="nav-icon-wrapper">
                  <button className="nav-icon" onClick={() => navigate('/cart')}>
                    <i className="fa-solid fa-cart-shopping"></i>
                  </button>
                </div>
                <NotificationDropdown />
                <div className="user-avatar-wrapper">
                  <button className="user-avatar" onClick={() => navigate('/dashboard')}>
                    {user.name ? <div className="avatar-initials">{user.name.charAt(0).toUpperCase()}</div> : <i className="fa-solid fa-user"></i>}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="nav-btn btn-login" onClick={() => setShowSignIn(true)}>ログイン</button>
                <button className="nav-btn btn-signup" onClick={() => setShowSignUp(true)}>新規登録</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="home-main">
        {/* HERO SECTION */}
        <div className="hero-section">
          <div className="hero-images">
             {/* Giữ nguyên ảnh static hoặc thay bằng ảnh động nếu muốn */}
             <div className="hero-image-item"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300" alt="Learning" /></div>
             <div className="hero-image-item"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300" alt="Workspace" /></div>
             <div className="hero-image-item"><img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300" alt="Film" /></div>
             <div className="hero-image-item"><img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300" alt="Business" /></div>
          </div>
          <div className="hero-content">
            <h1>毎日新しいことを学ぼう。</h1>
            <h2>プロフェッショナルになり、世界へ羽ばたこう。</h2>
          </div>
        </div>

        {/* CATEGORY TABS (ĐỘNG) */}
        <div className="category-filters">
          {/* Nút All */}
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            すべて 
          </button>

          {/* Render danh mục từ DB */}
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              className={`filter-btn ${selectedCategory === cat.category_id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.category_id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* TRENDING SECTION (Chỉ hiện khi đang ở tab All) */}
        {selectedCategory === 'all' && trendingCourses.length > 0 && (
          <section className="courses-section">
            <div className="section-header">
              <h2>トレンドのコース </h2>
              <p>コミュニティで最も人気のあるコースです。</p>
            </div>
            <div className="courses-grid">
               {trendingCourses.map((course) => (
                  <CourseCard key={course.course_id} course={course} />
               ))}
            </div>
          </section>
        )}

        {/* MAIN COURSES LIST (Thay đổi theo filter) */}
        <section className="courses-section">
          <div className="section-header">
            <h2>
                {selectedCategory === 'all' 
                    ? "おすすめのコース " 
                    : "検索結果 "}
            </h2>
          </div>
          
          {loading ? (
            <div className="loading" style={{textAlign:'center', padding:'40px'}}>読み込み中...</div>
          ) : (
            <div className="courses-grid">
              {courses.length > 0 ? (
                courses.map((course) => (
                  // CourseCard đã sửa ở bước trước sẽ tự xử lý ảnh
                  <CourseCard key={course.course_id} course={course} />
                ))
              ) : (
                <p className="no-courses" style={{textAlign:'center', gridColumn:'1/-1', color:'#666'}}>
                    このカテゴリにはまだコースがありません。
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      {/* --- MODALS --- */}
      {showSignUp && <SignUpModal isOpen={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} />}
      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} />}
      {showInstructorSignUp && <InstructorSignUpModal isOpen={showInstructorSignUp} onClose={() => setShowInstructorSignUp(false)} onSwitchToSignIn={() => { setShowInstructorSignUp(false); setShowSignIn(true); }} />}
    </div>
  )
}

export default Home