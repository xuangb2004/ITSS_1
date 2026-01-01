// js/course-detail.js

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  const courseId = getQueryParam("courseId") || "1";

  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");
  const contentEl = document.getElementById("course-content");
  const messageEl = document.getElementById("message");

  try {
    const course = await getCourseDetail(courseId);

    loadingEl.style.display = "none";
    contentEl.style.display = "block";

    // ===== 基本情報 =====
    document.getElementById("course-title").textContent = course.title;
    document.getElementById("course-subtitle").textContent = course.subtitle;
    document.getElementById("course-meta").textContent =
      `レベル: ${course.level} ・ 合計時間: ${course.totalHours}時間 ・ 言語: ${course.language}`;
    document.getElementById("course-price").textContent =
      `￥${course.price.toLocaleString()}`;

    const oldPriceEl = document.getElementById("course-old-price");
    if (course.oldPrice) {
      oldPriceEl.textContent = `￥${course.oldPrice.toLocaleString()}`;
      oldPriceEl.style.display = "inline-block";
    } else {
      oldPriceEl.style.display = "none";
    }

    document.getElementById("course-thumbnail").src = course.thumbnailUrl;
    document.getElementById("course-description").textContent =
      course.description;

    // ===== 学習目標 =====
    const objList = document.getElementById("course-objectives");
    objList.innerHTML = "";
    (course.objectives || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      objList.appendChild(li);
    });

    // ===== カリキュラム =====
    const curriculumContainer = document.getElementById("course-curriculum");
    curriculumContainer.innerHTML = "";
    const isEnrolled = course.isEnrolled;

    (course.curriculum || []).forEach((section) => {
      const sectionDiv = document.createElement("div");
      sectionDiv.className = "curriculum-section";

      const h3 = document.createElement("h3");
      h3.textContent = section.title;
      sectionDiv.appendChild(h3);

      const ul = document.createElement("ul");
      section.lessons.forEach((lesson) => {
        const li = document.createElement("li");
        li.className = "lesson-item";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = lesson.title;
        li.appendChild(titleSpan);

        const durSpan = document.createElement("span");
        durSpan.className = "lesson-duration";
        durSpan.textContent = `${lesson.duration}分`;
        li.appendChild(durSpan);

        const btn = document.createElement("button");
        btn.className = "btn tiny";

        if (!isEnrolled && lesson.isPreview) {
          btn.textContent = "プレビュー";
          btn.addEventListener("click", () => {
            window.location.href = `preview.html?courseId=${course.id}&lessonId=${lesson.id}`;
          });
          li.appendChild(btn);
        } else if (isEnrolled) {
          btn.textContent = "レッスンを視聴";
          btn.addEventListener("click", () => {
            alert(`「${lesson.title}」レッスンページに移動する想定です。`);
          });
          li.appendChild(btn);
        }

        ul.appendChild(li);
      });

      sectionDiv.appendChild(ul);
      curriculumContainer.appendChild(sectionDiv);
    });

    // ===== 講師情報 =====
    document.getElementById("instructor-avatar").src =
      course.instructor.avatarUrl;
    document.getElementById("instructor-name").textContent =
      course.instructor.name;
    document.getElementById("instructor-title").textContent =
      course.instructor.title;
    document.getElementById("instructor-bio").textContent =
      course.instructor.bio;
    document.getElementById(
      "instructor-stats"
    ).textContent = `受講生 ${course.instructor.totalStudents.toLocaleString()}人 ・ コース数 ${course.instructor.totalCourses}件`;

    // ===== レビュー =====
    document.getElementById("rating-score").textContent =
      course.rating.toFixed(1);
    document.getElementById(
      "rating-detail"
    ).textContent = `${course.rating} / 5 ・ 受講生の評価 ${course.totalReviews.toLocaleString()}件`;

    const reviewsEl = document.getElementById("reviews");
    reviewsEl.innerHTML = "";
    (course.reviews || []).forEach((rv) => {
      const div = document.createElement("div");
      div.className = "review-item";
      div.innerHTML = `
        <strong>${rv.userName}</strong>
        <span class="review-rating">${rv.rating}★</span>
        <p>${rv.comment}</p>
      `;
      reviewsEl.appendChild(div);
    });

    // ===== サムネイル下のプレビューボタン =====
    if (!isEnrolled && course.previewLessonId) {
      const previewMainBtn = document.getElementById("preview-main-btn");
      previewMainBtn.style.display = "inline-block";
      previewMainBtn.addEventListener("click", () => {
        window.location.href = `preview.html?courseId=${course.id}&lessonId=${course.previewLessonId}`;
      });
    }

    // ===== アクションボタン =====
    const buyBtn = document.getElementById("btn-buy-now");
    const cartBtn = document.getElementById("btn-add-cart");
    const wishBtn = document.getElementById("btn-add-wishlist");

    buyBtn.addEventListener("click", async () => {
      messageEl.textContent = "購入手続きを処理しています...";
      try {
        const res = await buyNow(course.id);
        messageEl.textContent = "注文が作成されました。お支払いページに移動します。";
        window.location.href = `checkout.html?orderId=${res.orderId || ""}`;
      } catch (e) {
        console.error(e);
        messageEl.textContent = "購入に失敗しました。もう一度お試しください。";
      }
    });

    cartBtn.addEventListener("click", async () => {
      messageEl.textContent = "カートに追加しています...";
      try {
        await addToCart(course.id);
        messageEl.textContent = "カートに追加しました。";
        window.location.href = "cart.html";
      } catch (e) {
        console.error(e);
        messageEl.textContent = "カートに追加できませんでした。";
      }
    });

    wishBtn.addEventListener("click", async () => {
      messageEl.textContent = "ウィッシュリストに追加しています...";
      try {
        await addToWishlist(course.id);
        messageEl.textContent = "ウィッシュリストに追加しました。";
      } catch (e) {
        console.error(e);
        messageEl.textContent =
          "ウィッシュリストに追加できませんでした。";
      }
    });
  } catch (err) {
    console.error(err);
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
  }
});
