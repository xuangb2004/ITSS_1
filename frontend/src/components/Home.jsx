import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationDropdown from './NotificationDropdown' 
import { courseService, categoryService } from '../services/api' // Import API thật
import SignUpModal from './SignUpModal'
import SignInModal from './SignInModal'
import CourseCard from './CourseCard'
import SearchBar from './SearchBar'
import InstructorSignUpModal from './InstructorSignUpModal' // <--- Import Modal Giảng viên

function Home() {
  const navigate = useNavigate()
  
  // States cho Modals
  const [showSignUp, setShowSignUp] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showInstructorSignUp, setShowInstructorSignUp] = useState(false) // <--- State mới cho modal giảng viên

  // States dữ liệu
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('すべてのおすすめ')
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [trendingCourses, setTrendingCourses] = useState([])
  const [filteredRecommended, setFilteredRecommended] = useState([])
  const [filteredTrending, setFilteredTrending] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  const { user, signout } = useAuth()
  
  const handleSignOut = () => {
    signout()
    navigate('/')
    window.location.reload()
  }

  // Hàm xử lý khi bấm nút "Trở thành giảng viên"
  const handleBecomeInstructorClick = (e) => {
    e.preventDefault();
    if (user) {
      if (user.role === 'instructor') {
        alert("Bạn đã là giảng viên rồi!");
        navigate('/dashboard');
      } else {
        alert("Bạn đang đăng nhập với tài khoản học viên. Hãy đăng ký tài khoản giảng viên mới hoặc liên hệ admin.");
      }
    } else {
      // Chưa đăng nhập -> Mở modal đăng ký giảng viên
      setShowInstructorSignUp(true);
    }
  };

  useEffect(() => {
    loadData()
  }, [])

  // Filter courses khi selectedCategory thay đổi
  useEffect(() => {
    filterCoursesByCategory()
  }, [selectedCategory, recommendedCourses, trendingCourses])

  const loadData = async () => {
    try {
      setLoading(true)
      const [recommended, trending, categoriesData] = await Promise.all([
        courseService.getRecommendedCourses(100), 
        courseService.getTrendingCourses(100), 
        categoryService.getAllCategories()
      ])
      
      setRecommendedCourses(recommended.courses || [])
      setTrendingCourses(trending.courses || [])
      setCategories(categoriesData.categories || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCoursesByCategory = () => {
    const categoryMap = {
      'すべてのおすすめ': null,
      'View All': null,
      'Adobe Illustrator': 'Adobe Illustrator',
      'Adobe Photoshop': 'Adobe Photoshop',
      'デザイン': 'デザイン',
      'Webプログラミング': 'Webプログラミング',
      'モバイルプログラミング': 'モバイルプログラミング',
      'バックエンド開発': 'バックエンド開発',
    }

    const categoryToFilter = categoryMap[selectedCategory]

    // Filter recommended courses
    if (categoryToFilter === null) {
      setFilteredRecommended(recommendedCourses)
    } else if (categoryToFilter === 'Adobe Illustrator' || categoryToFilter === 'Adobe Photoshop') {
      setFilteredRecommended(
        recommendedCourses.filter(course =>
          course.tags && course.tags.some(tag => tag.includes(categoryToFilter))
        )
      )
    } else {
      setFilteredRecommended(
        recommendedCourses.filter(course => course.category === categoryToFilter)
      )
    }

    // Filter trending courses
    if (categoryToFilter === null) {
      setFilteredTrending(trendingCourses)
    } else if (categoryToFilter === 'Adobe Illustrator' || categoryToFilter === 'Adobe Photoshop') {
      setFilteredTrending(
        trendingCourses.filter(course =>
          course.tags && course.tags.some(tag => tag.includes(categoryToFilter))
        )
      )
    } else {
      setFilteredTrending(
        trendingCourses.filter(course => course.category === categoryToFilter)
      )
    }
  }

  const categoryFilters = [
    'すべてのおすすめ',
    'Adobe Illustrator',
    'Adobe Photoshop',
    'デザイン',
    'Webプログラミング',
    'モバイルプログラミング',
    'バックエンド開発',
    'View All'
  ]

  return (
    <div className="home-wrapper">
      <header className="navbar">
        <div className="navbar-content">
          <div 
            className="logo" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-leaf"></i>
            <span>MyCourse.io</span>
          </div>
          
          {user && (
            <div className="browse-dropdown">
              <button className="browse-btn">
                ブラウズへ
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              <div className="browse-menu">
                <div className="browse-menu-item">すべてのコース</div>
                <div className="browse-menu-item">カテゴリー</div>
                <div className="browse-menu-item">インストラクター</div>

                <div
                  className="browse-menu-item"
                  onClick={() => navigate('/my-courses')}
                >
                  マイコース
                </div>
              </div>
            </div>
          )}

          
          <SearchBar />

          <div className="nav-actions">
            {/* NÚT ĐĂNG KÝ GIẢNG VIÊN ĐÃ ĐƯỢC GẮN SỰ KIỆN */}
            <button className="nav-btn" onClick={handleBecomeInstructorClick}>
              インストラクターになる
            </button>
            
            <button 
              className="nav-icon" 
              onClick={() => navigate('/forum')}
              title="フォーラム"
            >
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
                    {user.name ? (
                      <div className="avatar-initials">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <i className="fa-solid fa-user"></i>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="nav-btn btn-login" onClick={() => setShowSignIn(true)}>
                  ログイン
                </button>
                <button className="nav-btn btn-signup" onClick={() => setShowSignUp(true)}>
                  新規登録
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="hero-section">
          <div className="hero-images">
            <div className="hero-image-item">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300" alt="Learning" />
            </div>
            <div className="hero-image-item">
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300" alt="Workspace" />
            </div>
            <div className="hero-image-item">
              <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300" alt="Film" />
            </div>
            <div className="hero-image-item">
              <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300" alt="Business" />
            </div>
            <div className="hero-image-item">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300" alt="Team" />
            </div>
            <div className="hero-image-item">
              <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300" alt="Writing" />
            </div>
          </div>
          <div className="hero-content">
            <h1>毎日新しいことを学ぼう。</h1>
            <h2>プロフェッショナルになり、世界へ羽ばたこう。</h2>
          </div>
        </div>

        <div className="category-filters">
          {categoryFilters.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(category)
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <section className="courses-section">
          <div className="section-header">
            <h2>あなたの興味に基づいたおすすめ</h2>
            <p>あなたにぴったりのコンテンツ、おすすめのトップピックです。</p>
          </div>
          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : (
            <div className="courses-grid">
              {filteredRecommended.length > 0 ? (
                filteredRecommended.map((course) => (
                  <CourseCard key={course.course_id || course._id} course={course} />
                ))
              ) : (
                <p className="no-courses">おすすめのコースがありません</p>
              )}
            </div>
          )}
        </section>

        <section className="courses-section">
          <div className="section-header">
            <h2>トレンドのコース</h2>
            <p>あなたにぴったりのコンテンツ、おすすめのトップピックです。</p>
          </div>
          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : (
            <div className="courses-grid">
              {filteredTrending.length > 0 ? (
                filteredTrending.map((course) => (
                  <CourseCard key={course.course_id || course._id} course={course} />
                ))
              ) : (
                <p className="no-courses">トレンドのコースがありません</p>
              )}
            </div>
          )}
        </section>
      </main>

      {/* --- CÁC MODALS --- */}
      
      {showSignUp && (
        <SignUpModal 
          isOpen={showSignUp} // Đảm bảo truyền đúng prop isOpen
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => {
            setShowSignUp(false)
            setShowSignIn(true)
          }}
        />
      )}

      {showSignIn && (
        <SignInModal 
          isOpen={showSignIn} // Đảm bảo truyền đúng prop isOpen
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false)
            setShowSignUp(true)
          }}
        />
      )}

      {/* MODAL ĐĂNG KÝ GIẢNG VIÊN */}
      {showInstructorSignUp && (
        <InstructorSignUpModal
          isOpen={showInstructorSignUp}
          onClose={() => setShowInstructorSignUp(false)}
          onSwitchToSignIn={() => {
            setShowInstructorSignUp(false)
            setShowSignIn(true)
          }}
        />
      )}
    </div>
  )
}

export default Home