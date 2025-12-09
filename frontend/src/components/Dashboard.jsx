// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./css/Dashboard.css"; // nếu file ở src/components/css/Dashboard.css

function Dashboard() {
  const navigate = useNavigate();
  const { signout } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "customize"
  const [profile, setProfile] = useState({
    name: "",
    first_name: "",
    last_name: "",
    organization: "",
    language: "",
    website: "",
    email: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Load profile error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    const formData = new FormData();
    formData.append("first_name", profile.first_name || "");
    formData.append("last_name", profile.last_name || "");
    formData.append("organization", profile.organization || "");
    formData.append("language", profile.language || "");
    formData.append("website", profile.website || "");
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "サーバーエラーが発生しました");
      } else {
        setProfile((prev) => ({
          ...prev,
          avatar_url: data.avatar_url || prev.avatar_url,
        }));
        alert("プロフィールを更新しました");
        setActiveTab("profile");
      }
    } catch (err) {
      console.error("Update profile error", err);
      alert("サーバーエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    signout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-inner">読み込み中...</div>
      </div>
    );
  }

  const avatarSrc = profile.avatar_url
    ? `http://localhost:5001${profile.avatar_url}`
    : "https://ui-avatars.com/api/?name=User&background=14b8a6&color=ffffff";

  return (
    <div className="account-page">
      <div className="account-inner">
        <h1 className="account-title">My Account</h1>

        <div className="account-tabs">
          <button
            className={`account-tab ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            ホーム / プロフィール
          </button>
          <button
            className={`account-tab ${
              activeTab === "customize" ? "active" : ""
            }`}
            onClick={() => setActiveTab("customize")}
          >
            カスタマイズ
          </button>
          <button className="account-tab" disabled>
            アカウント
          </button>
          <button className="account-tab" disabled>
            支払い方法
          </button>
          <button className="account-tab" disabled>
            通知
          </button>
          <button className="account-tab" disabled>
            プライバシー
          </button>
        </div>

        <div className="account-avatar-wrap">
          <div className="account-avatar-circle">
            <img src={avatarSrc} alt="avatar" />
          </div>

          {activeTab === "customize" && (
            <label className="account-avatar-change">
              Thay đổi ảnh đại diện của bạn
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {activeTab === "profile" && (
          <div className="account-form account-form-view">
            <p className="account-desc">
              Trên trang này, bạn có thể <strong>xem</strong> thông tin hồ sơ của
              mình. Các giá trị hiển thị ở đây là dữ liệu đã lưu sau khi tuỳ
              chỉnh.
            </p>

            <div className="account-row">
              <div className="account-label">Tên được đặt</div>
              <div className="account-static">{profile.name || "-"}</div>
            </div>
            <div className="account-row">
              <div className="account-label">Tên</div>
              <div className="account-static">{profile.first_name || "-"}</div>
            </div>
            <div className="account-row">
              <div className="account-label">Họ</div>
              <div className="account-static">{profile.last_name || "-"}</div>
            </div>
            <div className="account-row">
              <div className="account-label">Liên kết</div>
              <div className="account-static">{profile.website || "-"}</div>
            </div>
            <div className="account-row">
              <div className="account-label">Ngôn ngữ</div>
              <div className="account-static">{profile.language || "-"}</div>
            </div>
            <div className="account-row">
              <div className="account-label">Tổ chức</div>
              <div className="account-static">
                {profile.organization || "-"}
              </div>
            </div>
            <div className="account-row">
              <div className="account-label">E-mail</div>
              <div className="account-static">{profile.email || "-"}</div>
            </div>

            <div className="account-actions">
              <button
                type="button"
                className="account-save-btn"
                onClick={() => setActiveTab("customize")}
              >
                Chỉnh sửa (mở tab Tuỳ chỉnh)
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleSignOut}
              >
                ログアウト
              </button>
            </div>
          </div>
        )}

        {activeTab === "customize" && (
          <form onSubmit={handleSave} className="account-form">
            <p className="account-desc">
              Ở tab <strong>Tuỳ chỉnh</strong>, bạn có thể nhập / thay đổi các
              trường như <strong>"Tên", "Họ", "Liên kết", "Ngôn ngữ"</strong>.
              Sau khi lưu, các giá trị này sẽ hiển thị ở tab{" "}
              <strong>Hồ sơ</strong>.
            </p>

            <div className="account-row">
              <div className="account-label">Tên</div>
              <div className="account-input">
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name || ""}
                  onChange={handleChange}
                  placeholder="Tên"
                />
              </div>
            </div>

            <div className="account-row">
              <div className="account-label">Họ</div>
              <div className="account-input">
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name || ""}
                  onChange={handleChange}
                  placeholder="Họ"
                />
              </div>
            </div>

            <div className="account-row">
              <div className="account-label">Tổ chức</div>
              <div className="account-input">
                <input
                  type="text"
                  name="organization"
                  value={profile.organization || ""}
                  onChange={handleChange}
                  placeholder="Công ty / Trường học…"
                />
              </div>
            </div>

            <div className="account-row">
              <div className="account-label">Ngôn ngữ</div>
              <div className="account-input">
                <input
                  type="text"
                  name="language"
                  value={profile.language || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: 日本語, English, Tiếng Việt"
                />
              </div>
            </div>

            <div className="account-row">
              <div className="account-label">Liên kết</div>
              <div className="account-input">
                <input
                  type="text"
                  name="website"
                  value={profile.website || ""}
                  onChange={handleChange}
                  placeholder="www.example.com"
                />
              </div>
            </div>

            <div className="account-actions">
              <button
                type="submit"
                className="account-save-btn"
                disabled={saving}
              >
                {saving ? "保存中..." : "保存"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab("profile")}
              >
                Huỷ & quay lại Hồ sơ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
