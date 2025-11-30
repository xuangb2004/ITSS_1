const mongoose = require('mongoose')
const dotenv = require('dotenv')
const connectDB = require('../config/db')
const Course = require('../models/Course')
const Instructor = require('../models/Instructor')
const Category = require('../models/Category')
const User = require('../models/User')

dotenv.config()

const seedData = async () => {
  try {
    // Kết nối database
    await connectDB()
    console.log('✅ Connected to database')

    // Xóa dữ liệu cũ (optional - comment nếu muốn giữ lại)
    await Course.deleteMany({})
    await Instructor.deleteMany({})
    await Category.deleteMany({})
    console.log('🗑️  Cleared old data')

    // Tạo hoặc lấy user mẫu
    let demoUser = await User.findOne({ email: 'demo@example.com' })
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'hashedpassword123', // Trong thực tế cần hash
      })
    }

    // Tạo instructors
    const instructors = await Instructor.insertMany([
      {
        user_id: demoUser._id,
        studio: 'Xiami Studio',
        bio: 'Professional design studio',
        expertise: ['Design', 'Illustration'],
      },
      {
        user_id: demoUser._id,
        studio: 'Tech Academy',
        bio: 'Leading tech education platform',
        expertise: ['Programming', 'Web Development'],
      },
      {
        user_id: demoUser._id,
        studio: 'Design Pro',
        bio: 'Expert design courses',
        expertise: ['Graphic Design', 'Photoshop'],
      },
      {
        user_id: demoUser._id,
        studio: 'Code Master',
        bio: 'Advanced programming courses',
        expertise: ['Backend Development', 'Node.js'],
      },
    ])
    console.log(`✅ Created ${instructors.length} instructors`)

    // Tạo categories
    const categories = await Category.insertMany([
      {
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
        name: 'Business & Marketing',
        nameJa: 'ビジネス&マーケティング',
        slug: 'business-marketing',
      },
      {
        name: 'Photo & Video',
        nameJa: '写真とビデオ',
        slug: 'photo-video',
      },
      {
        name: 'Writing',
        nameJa: 'ライティング',
        slug: 'writing',
      },
    ])
    console.log(`✅ Created ${categories.length} categories`)

    // Tạo courses
    const courses = await Course.insertMany([
      {
        instructor_id: instructors[0]._id,
        title: 'Adobe Illustrator スクラッチコース',
        description: 'イラストレーターとしての40時間以上、今すぐプロのイラストレーターになる方法を学びましょう。',
        level: 'beginner',
        price: 24.92,
        originalPrice: 30.00,
        category: 'デザイン',
        tags: ['Adobe Illustrator', 'デザイン', 'イラストレーション'],
        rating: 4.5,
        reviewCount: 124,
        isRecommended: true,
        isTrending: false,
        duration: 40,
        thumbnail: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400',
      },
      {
        instructor_id: instructors[0]._id,
        title: 'Bootcamp Vue.Js Webフレームワーク',
        description: 'Vue.jsフレームワークでWebアプリケーションを作成する方法を学びます。',
        level: 'intermediate',
        price: 24.92,
        originalPrice: 30.00,
        category: 'Webプログラミング',
        tags: ['Vue.js', 'Webプログラミング', 'フロントエンド'],
        rating: 4.5,
        reviewCount: 124,
        isRecommended: true,
        isTrending: true,
        duration: 35,
        thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
      },
      {
        instructor_id: instructors[0]._id,
        title: 'デザインの基礎',
        description: 'イラストレーターとしての40時間以上、今すぐプロのイラストレーターになる方法を学びましょう。',
        level: 'beginner',
        price: 24.92,
        originalPrice: 30.00,
        category: 'デザイン',
        tags: ['デザイン', 'グラフィックデザイン', '基礎'],
        rating: 4.5,
        reviewCount: 124,
        isRecommended: true,
        isTrending: false,
        duration: 25,
        thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
      },
      {
        instructor_id: instructors[0]._id,
        title: 'Ionic - iOS, Android & Webアプリ開発',
        description: 'More than 40h Experience as Illustrator Learn how to becoming professional illustrator now.イラストレーターとしての40時間以上、今すぐプロのイラストレーターになる方法を学びましょう。',
        level: 'advanced',
        price: 24.92,
        originalPrice: 30.00,
        category: 'モバイルプログラミング',
        tags: ['Ionic', 'モバイルプログラミング', 'iOS', 'Android'],
        rating: 4.5,
        reviewCount: 124,
        isRecommended: true,
        isTrending: true,
        duration: 45,
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
      },
      {
        instructor_id: instructors[1]._id,
        title: 'React Native モバイルアプリ開発',
        description: 'React Nativeを使用してiOSとAndroidの両方で動作するモバイルアプリを開発する方法を学びます。',
        level: 'intermediate',
        price: 29.99,
        originalPrice: 39.99,
        category: 'モバイルプログラミング',
        tags: ['React Native', 'モバイルプログラミング', 'iOS', 'Android'],
        rating: 4.8,
        reviewCount: 256,
        isRecommended: false,
        isTrending: true,
        duration: 50,
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
      },
      {
        instructor_id: instructors[3]._id,
        title: 'Node.js バックエンド開発',
        description: 'Node.jsとExpressを使用してスケーラブルなバックエンドアプリケーションを構築する方法を学びます。',
        level: 'intermediate',
        price: 34.99,
        originalPrice: 44.99,
        category: 'バックエンド開発',
        tags: ['Node.js', 'バックエンド開発', 'Express', 'API'],
        rating: 4.7,
        reviewCount: 189,
        isRecommended: false,
        isTrending: true,
        duration: 42,
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
      },
      {
        instructor_id: instructors[2]._id,
        title: 'Adobe Photoshop マスターコース',
        description: 'プロフェッショナルな写真編集とデザインスキルを習得します。',
        level: 'beginner',
        price: 27.99,
        originalPrice: 35.99,
        category: 'デザイン',
        tags: ['Adobe Photoshop', 'デザイン', '写真編集'],
        rating: 4.6,
        reviewCount: 203,
        isRecommended: true,
        isTrending: false,
        duration: 38,
        thumbnail: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400',
      },
      {
        instructor_id: instructors[1]._id,
        title: 'Python データサイエンス入門',
        description: 'Pythonを使用したデータ分析と機械学習の基礎を学びます。',
        level: 'beginner',
        price: 31.99,
        originalPrice: 41.99,
        category: 'バックエンド開発',
        tags: ['Python', 'データサイエンス', '機械学習'],
        rating: 4.9,
        reviewCount: 312,
        isRecommended: false,
        isTrending: true,
        duration: 48,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
      },
    ])
    console.log(`✅ Created ${courses.length} courses`)

    console.log('\n🎉 Seed data completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

// Chạy seed
seedData()

