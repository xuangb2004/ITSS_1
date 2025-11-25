// --- DỮ LIỆU GIẢ LẬP (MOCK DATA - 日本語) ---
const categories = [
    { name: 'プログラミング', icon: 'fa-code' }, // Lập trình
    { name: '数学', icon: 'fa-calculator' }, // Toán học
    { name: '外国語', icon: 'fa-language' }, // Ngoại ngữ
    { name: 'デザイン', icon: 'fa-pen-nib' }, // Thiết kế
    { name: 'ビジネス', icon: 'fa-chart-line' }, // Kinh doanh
    { name: 'マーケティング', icon: 'fa-bullhorn' } // Marketing
];

const courses = [
    {
        title: "フルスタックWeb開発コース",
        instructor: "田中 健太",
        image: "images/1.jpg",
        rating: 4.8,
        reviews: 120,
        category: "プログラミング"
    },
    {
        title: "実践ビジネス英語",
        instructor: "サラ・ジョンソン",
        image: "images/2.jpg",
        rating: 4.9,
        reviews: 85,
        category: "外国語"
    },
    {
        title: "UI/UXデザイン基礎",
        instructor: "佐藤 美咲",
        image: "images/3.jpg",
        rating: 4.7,
        reviews: 200,
        category: "デザイン"
    },
    {
        title: "大学数学 A1 (微積分)",
        instructor: "鈴木 博士",
        image: "images/4.jpg",
        rating: 4.5,
        reviews: 50,
        category: "数学"
    }
];

// --- HÀM RENDER ---

// 1. Render Danh mục (Categories)
const catContainer = document.getElementById('categories-container');
categories.forEach(cat => {
    catContainer.innerHTML += `
        <div class="category-card">
            <i class="fa-solid ${cat.icon} category-icon"></i>
            <h3>${cat.name}</h3>
        </div>
    `;
});

// 2. Render Khóa học (Dùng chung cho cả Phổ biến và Mới để demo)
function renderCourses(containerId, data) {
    const container = document.getElementById(containerId);
    data.forEach(course => {
        container.innerHTML += `
            <div class="course-card">
                <div class="course-thumb">
                    <img src="${course.image}" alt="${course.title}" style="width:100%; height:100%; object-fit:cover;">
                    <i class="fa-solid fa-circle-play play-icon"></i>
                </div>
                <div class="course-info">
                    <div class="course-category">${course.category}</div>
                    <h3 class="course-title">${course.title}</h3>
                    <div class="course-meta">
                        <span><i class="fa-solid fa-chalkboard-user"></i> ${course.instructor}</span>
                        <span class="rating">
                            <i class="fa-solid fa-star"></i> ${course.rating} (${course.reviews})
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Render khóa học vào 2 mục: Phổ biến và Mới nhất
renderCourses('popular-courses', courses);
renderCourses('new-courses', courses.slice(0, 2)); // Lấy 2 bài làm mẫu cho mục Mới

// --- CHỨC NĂNG TOGGLE MENU MOBILE ---
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}