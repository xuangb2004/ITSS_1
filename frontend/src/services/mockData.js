// Mock data cho demo

// Mock Instructors
const mockInstructors = [
  { _id: '1', studio: 'Xiami Studio' },
  { _id: '2', studio: 'Tech Academy' },
  { _id: '3', studio: 'Design Pro' },
  { _id: '4', studio: 'Code Master' },
]

// Mock Courses
const mockCourses = [
  {
    _id: '1',
    title: 'Adobe Illustrator スクラッチコース',
    description: 'イラストレーターとしての40時間以上、今すぐプロのイラストレーターになる方法を学びましょう。',
    instructor_id: mockInstructors[0],
    price: 24.92,
    originalPrice: 30.00,
    rating: 4.5,
    reviewCount: 124,
    category: 'デザイン',
    tags: ['Adobe Illustrator', 'デザイン', 'イラストレーション'],
    thumbnail: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400',
    isRecommended: true,
    isTrending: false,
    level: 'beginner',
    duration: 40,
  },
  {
    _id: '2',
    title: 'Bootcamp Vue.Js Webフレームワーク',
    description: 'Vue.jsフレームワークでWebアプリケーションを作成する方法を学びます。',
    instructor_id: mockInstructors[0],
    price: 24.92,
    originalPrice: 30.00,
    rating: 4.5,
    reviewCount: 124,
    category: 'Webプログラミング',
    tags: ['Vue.js', 'Webプログラミング', 'フロントエンド'],
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
    isRecommended: true,
    isTrending: true,
    level: 'intermediate',
    duration: 35,
  },
  {
    _id: '3',
    title: 'デザインの基礎',
    description: 'イラストレーターとしての40時間以上、今すぐプロのイラストレーターになる方法を学びましょう。',
    instructor_id: mockInstructors[0],
    price: 24.92,
    originalPrice: 30.00,
    rating: 4.5,
    reviewCount: 124,
    category: 'デザイン',
    tags: ['デザイン', 'グラフィックデザイン', '基礎'],
    thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
    isRecommended: true,
    isTrending: false,
    level: 'beginner',
    duration: 25,
  },
  {
    _id: '4',
    title: 'Ionic - iOS, Android & Webアプリ開発',
    description: 'More than 40h Experience as Illustrator Learn how to becoming professional illustrator now.イラストレーターとしての40時間以上、今すぐプロのイラストレーターになる方法を学びましょう。',
    instructor_id: mockInstructors[0],
    price: 24.92,
    originalPrice: 30.00,
    rating: 4.5,
    reviewCount: 124,
    category: 'モバイルプログラミング',
    tags: ['Ionic', 'モバイルプログラミング', 'iOS', 'Android'],
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    isRecommended: true,
    isTrending: true,
    level: 'advanced',
    duration: 45,
  },
  {
    _id: '5',
    title: 'React Native モバイルアプリ開発',
    description: 'React Nativeを使用してiOSとAndroidの両方で動作するモバイルアプリを開発する方法を学びます。',
    instructor_id: mockInstructors[1],
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.8,
    reviewCount: 256,
    category: 'モバイルプログラミング',
    tags: ['React Native', 'モバイルプログラミング', 'iOS', 'Android'],
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    isRecommended: false,
    isTrending: true,
    level: 'intermediate',
    duration: 50,
  },
  {
    _id: '6',
    title: 'Node.js バックエンド開発',
    description: 'Node.jsとExpressを使用してスケーラブルなバックエンドアプリケーションを構築する方法を学びます。',
    instructor_id: mockInstructors[3],
    price: 34.99,
    originalPrice: 44.99,
    rating: 4.7,
    reviewCount: 189,
    category: 'バックエンド開発',
    tags: ['Node.js', 'バックエンド開発', 'Express', 'API'],
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    isRecommended: false,
    isTrending: true,
    level: 'intermediate',
    duration: 42,
  },
  {
    _id: '7',
    title: 'Adobe Photoshop マスターコース',
    description: 'プロフェッショナルな写真編集とデザインスキルを習得します。',
    instructor_id: mockInstructors[2],
    price: 27.99,
    originalPrice: 35.99,
    rating: 4.6,
    reviewCount: 203,
    category: 'デザイン',
    tags: ['Adobe Photoshop', 'デザイン', '写真編集'],
    thumbnail: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400',
    isRecommended: true,
    isTrending: false,
    level: 'beginner',
    duration: 38,
  },
  {
    _id: '8',
    title: 'Python データサイエンス入門',
    description: 'Pythonを使用したデータ分析と機械学習の基礎を学びます。',
    instructor_id: mockInstructors[1],
    price: 31.99,
    originalPrice: 41.99,
    rating: 4.9,
    reviewCount: 312,
    category: 'バックエンド開発',
    tags: ['Python', 'データサイエンス', '機械学習'],
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    isRecommended: false,
    isTrending: true,
    level: 'beginner',
    duration: 48,
  },
]

// Mock Categories
const mockCategories = [
  {
    _id: '1',
    name: 'Design',
    nameJa: 'デザイン',
    slug: 'design',
    subcategories: [
      { name: 'Illustration', nameJa: 'イラストレーション' },
      { name: 'Graphic Design', nameJa: 'グラフィックデザイン' },
      { name: 'Web Design', nameJa: 'Webデザイン' },
    ],
  },
  {
    _id: '2',
    name: 'Programming',
    nameJa: 'プログラミング',
    slug: 'programming',
    subcategories: [
      { name: 'Web Programming', nameJa: 'Webプログラミング' },
      { name: 'Mobile Programming', nameJa: 'モバイルプログラミング' },
      { name: 'Backend Development', nameJa: 'バックエンド開発' },
    ],
  },
  {
    _id: '3',
    name: 'Business & Marketing',
    nameJa: 'ビジネス&マーケティング',
    slug: 'business-marketing',
  },
  {
    _id: '4',
    name: 'Photo & Video',
    nameJa: '写真とビデオ',
    slug: 'photo-video',
  },
  {
    _id: '5',
    name: 'Writing',
    nameJa: 'ライティング',
    slug: 'writing',
  },
]

// Mock API functions
export const mockCourseService = {
  getAllCourses: async (params = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredCourses = [...mockCourses]
    
    if (params.category) {
      filteredCourses = filteredCourses.filter(
        course => course.category === params.category
      )
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filteredCourses = filteredCourses.filter(
        course =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 20
    const skip = (page - 1) * limit
    
    return {
      courses: filteredCourses.slice(skip, skip + limit),
      total: filteredCourses.length,
      page,
      totalPages: Math.ceil(filteredCourses.length / limit),
    }
  },

  getRecommendedCourses: async (limit = 4) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const recommended = mockCourses
      .filter(course => course.isRecommended)
      .map(course => ({
        ...course,
        instructor_id: mockInstructors.find(i => i._id === course.instructor_id._id),
      }))
    
    // Nếu limit được chỉ định và nhỏ hơn số lượng courses, thì slice
    // Nếu không có limit hoặc limit lớn, trả về tất cả
    const courses = limit && limit < recommended.length 
      ? recommended.slice(0, limit)
      : recommended
    
    return { courses }
  },

  getTrendingCourses: async (limit = 4) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const trending = mockCourses
      .filter(course => course.isTrending)
      .map(course => ({
        ...course,
        instructor_id: mockInstructors.find(i => i._id === course.instructor_id._id),
      }))
    
    // Nếu limit được chỉ định và nhỏ hơn số lượng courses, thì slice
    // Nếu không có limit hoặc limit lớn, trả về tất cả
    const courses = limit && limit < trending.length 
      ? trending.slice(0, limit)
      : trending
    
    return { courses }
  },

  searchCourses: async (query, params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const queryLower = query.toLowerCase()
    let filteredCourses = mockCourses.filter(
      course =>
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower) ||
        course.tags.some(tag => tag.toLowerCase().includes(queryLower))
    )
    
    if (params.category) {
      filteredCourses = filteredCourses.filter(
        course => course.category === params.category
      )
    }
    
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 20
    const skip = (page - 1) * limit
    
    return {
      courses: filteredCourses.slice(skip, skip + limit).map(course => ({
        ...course,
        instructor_id: mockInstructors.find(i => i._id === course.instructor_id._id),
      })),
      total: filteredCourses.length,
      page,
      totalPages: Math.ceil(filteredCourses.length / limit),
    }
  },

  getCourseById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const course = mockCourses.find(c => c._id === id)
    if (!course) {
      throw new Error('Course not found')
    }
    return {
      course: {
        ...course,
        instructor_id: mockInstructors.find(i => i._id === course.instructor_id._id),
      },
    }
  },
}

export const mockCategoryService = {
  getAllCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { categories: mockCategories }
  },

  getCategoryBySlug: async (slug) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const category = mockCategories.find(c => c.slug === slug)
    if (!category) {
      throw new Error('Category not found')
    }
    return { category }
  },
}

