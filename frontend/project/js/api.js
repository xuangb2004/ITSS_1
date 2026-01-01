// js/api.js

// 日本語モックデータ（バックエンド不要）
async function getCourseDetail(courseId) {
  return {
    id: courseId,
    title: "はじめてのReact入門コース",
    subtitle: "ゼロから学ぶReactとシングルページアプリケーション開発",
    description:
      "このコースでは、Reactの基礎（JSX・コンポーネント・Props・State）から、実践的なシングルページアプリケーション（SPA）の作り方までを丁寧に解説します。初心者でも安心して学べるよう、ステップバイステップで進めていきます。",
    level: "初級",
    totalHours: 12,
    language: "日本語",
    price: 4990,
    oldPrice: 11990,
    thumbnailUrl: "https://picsum.photos/800/450?random=1",
    isEnrolled: false, // true にすると「受講済み」想定
    previewLessonId: "lesson_1",
    objectives: [
      "Reactの基本概念（JSX・コンポーネント・Props・State）を理解する",
      "React Routerを使ってシングルページアプリケーションを構築できる",
      "小さなサンプルから実践的なWebアプリケーションまで自分で作成できる",
      "コンポーネント指向の考え方に慣れ、再利用しやすいUIを設計できる"
    ],
    curriculum: [
      {
        id: "sec_1",
        title: "イントロダクション",
        lessons: [
          {
            id: "lesson_1",
            title: "Reactとは？",
            duration: 10,
            isPreview: true
          },
          {
            id: "lesson_2",
            title: "開発環境の準備",
            duration: 15,
            isPreview: false
          }
        ]
      },
      {
        id: "sec_2",
        title: "Reactの基礎",
        lessons: [
          {
            id: "lesson_3",
            title: "コンポーネントとProps",
            duration: 20,
            isPreview: false
          },
          {
            id: "lesson_4",
            title: "Stateとイベントハンドリング",
            duration: 22,
            isPreview: false
          }
        ]
      }
    ],
    instructor: {
      name: "山田 太郎",
      title: "シニアフロントエンドエンジニア",
      bio: "国内外のプロジェクトで10年以上ReactやTypeScriptを使った開発に従事。現在はエンジニア育成とオンライン講座の制作を行っています。",
      avatarUrl: "https://picsum.photos/100/100?random=2",
      totalStudents: 12000,
      totalCourses: 8
    },
    rating: 4.7,
    totalReviews: 350,
    reviews: [
      {
        id: "r1",
        userName: "カイン",
        rating: 5,
        comment: "説明がとても丁寧で、Reactの全体像がよく理解できました。"
      },
      {
        id: "r2",
        userName: "ミン",
        rating: 4,
        comment: "例が分かりやすく、初心者でも無理なく進められました。"
      }
    ]
  };
}

// 以下は「API呼び出し風」のモック関数
async function addToCart(courseId) {
  console.log("カートに追加:", courseId);
  return { success: true };
}

async function addToWishlist(courseId) {
  console.log("ウィッシュリストに追加:", courseId);
  return { success: true };
}

async function buyNow(courseId) {
  console.log("今すぐ購入:", courseId);
  return { orderId: "order_123" };
}
