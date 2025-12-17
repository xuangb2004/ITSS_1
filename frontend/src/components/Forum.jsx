import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- HÀM HELPER: Tự động sinh màu/icon cho môn học ---
const getCategoryStyle = (index) => {
    const styles = [
        { icon: 'fa-code', color: '#0ea5e9', bg: '#e0f2fe' },      // Xanh dương
        { icon: 'fa-book', color: '#f59e0b', bg: '#fef3c7' },      // Vàng
        { icon: 'fa-flask', color: '#ec4899', bg: '#fce7f3' },     // Hồng
        { icon: 'fa-calculator', color: '#10b981', bg: '#d1fae5' }, // Xanh lá
        { icon: 'fa-pen-nib', color: '#8b5cf6', bg: '#ede9fe' },   // Tím
        { icon: 'fa-globe', color: '#6366f1', bg: '#e0e7ff' },     // Indigo
    ];
    // Lấy style xoay vòng dựa trên index hoặc id
    return styles[index % styles.length];
};

// Component Highlight
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? <span key={i} style={{ backgroundColor: "#fde047", fontWeight: "bold" }}>{part}</span> : part
      )}
    </span>
  );
};

function Forum() {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]); // <--- State chứa danh sách môn học
  const [selectedTopic, setSelectedTopic] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // State Category hiện tại ('ALL' hoặc ID môn học)
  const [currentCategory, setCurrentCategory] = useState('ALL'); 

  // Search States
  const [showSearchBar, setShowSearchBar] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData(); 
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearching(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HÀM LOAD DỮ LIỆU TỪ DB (ĐÃ SỬA ĐỂ TRÁNH LỖI) ---
  const loadInitialData = async () => {
    try {
        const [topicsData, categoriesData] = await Promise.all([
            forumService.getTopics(),
            forumService.getCategories() 
        ]);

        setTopics(topicsData);

        // --- BẮT ĐẦU ĐOẠN SỬA ---
        // Log ra để kiểm tra (bạn sẽ thấy nó in ra object {categories: Array(4)})
        console.log("Check Data:", categoriesData); 

        if (Array.isArray(categoriesData)) {
            // Trường hợp 1: API trả về mảng trực tiếp [item1, item2]
            setCategories(categoriesData);
        } else if (categoriesData && Array.isArray(categoriesData.categories)) {
            // Trường hợp 2 (CỦA BẠN): API trả về { categories: [item1, item2] }
            setCategories(categoriesData.categories);
        } else if (categoriesData && Array.isArray(categoriesData.data)) {
            // Trường hợp 3: API trả về { data: [item1, item2] }
            setCategories(categoriesData.data);
        } else {
            console.warn("Vẫn không đọc được danh sách môn học:", categoriesData);
            setCategories([]); 
        }
        // --- KẾT THÚC ĐOẠN SỬA ---

    } catch (error) {
      console.error("Error loading initial data", error);
      setCategories([]); 
    }
  };
  const handleSelectTopic = async (topicId) => {
    try {
      const data = await forumService.getTopicDetails(topicId);
      setSelectedTopic(data);
      setIsSearching(false); 
      setShowSearchBar(false);
    } catch (error) {
      console.error("Error loading details", error);
    }
  };

  // --- LOGIC LỌC BÀI VIẾT THEO MÔN HỌC ---
 const getFilteredTopics = () => {
    if (currentCategory === 'ALL') {
      return topics;
    }
    
    return topics.filter(topic => {
       return String(topic.category_id) === String(currentCategory);
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performSearch(searchQuery);
  };

  const performSearch = async (query) => {
    try {
      const results = await forumService.searchForum(query);
      setSearchResults(results);
      setIsSearching(true);
    } catch (error) {
      console.error("Search error", error);
    }
  };

  const closeSearch = () => {
    setShowSearchBar(false);
    setIsSearching(false);
    setSearchQuery("");
  };

  const handleResultClick = async (topicId, postId) => {
    try {
        const data = await forumService.getTopicDetails(topicId);
        setSelectedTopic(data);
        setIsSearching(false); 
        setShowSearchBar(false); 
        
        setTimeout(() => {
          const element = document.getElementById(`post-${postId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.style.transition = "background 0.5s";
            element.style.backgroundColor = "#fffbeb"; 
            setTimeout(() => element.style.backgroundColor = "transparent", 2000);
          }
        }, 500);
      } catch (error) {
        console.error("Redirect error", error);
      }
  };

  return (
    <div className="home-main" style={{ paddingTop: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* NÚT HOME */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '500' }}
          >
            <i className="fa-solid fa-house"></i> ホームに戻る
          </button>
        </div>

        {/* --- LAYOUT CHÍNH: CHIA 2 CỘT (SIDEBAR & CONTENT) --- */}
        <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
            
            {/* 1. SIDEBAR (DANH MỤC MÔN HỌC) */}
            <div style={{ width: '260px', flexShrink: 0, background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <button 
                    className="btn-login-primary" 
                    style={{ width: '100%', padding: '12px', marginBottom: '20px', justifyContent: 'center' }} 
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fa-solid fa-plus"></i> 新規トピック作成
                </button>

                <h3 style={{ fontSize: '14px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '10px' }}>科目 </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {/* Nút Forum Chung (ALL) */}
                    <button 
                        onClick={() => { setCurrentCategory('ALL'); setSelectedTopic(null); }}
                        style={{
                            textAlign: 'left', padding: '12px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: currentCategory === 'ALL' && !selectedTopic ? '#f0fdfa' : 'transparent',
                            color: currentCategory === 'ALL' && !selectedTopic ? '#0f766e' : '#4b5563',
                            fontWeight: currentCategory === 'ALL' && !selectedTopic ? '600' : '400',
                            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                        }}
                    >
                        <i className="fa-solid fa-layer-group" style={{ width: '20px' }}></i> すべて
                    </button>

                    {/* Danh sách các Categories từ DB (ĐÃ SỬA CHECK MẢNG) */}
                    {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map((cat, index) => {
                            const style = getCategoryStyle(index); // Lấy màu tự động
                            return (
                                <button 
                                    key={cat.id || cat.category_id} // Đảm bảo key đúng ID từ DB
                                    onClick={() => { setCurrentCategory(cat.id || cat.category_id); setSelectedTopic(null); }}
                                    style={{
                                        textAlign: 'left', padding: '12px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        background: currentCategory === (cat.id || cat.category_id) && !selectedTopic ? '#f0fdfa' : 'transparent',
                                        color: currentCategory === (cat.id || cat.category_id) && !selectedTopic ? '#0f766e' : '#4b5563',
                                        fontWeight: currentCategory === (cat.id || cat.category_id) && !selectedTopic ? '600' : '400',
                                        display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                                    }}
                                >
                                    <i className={`fa-solid ${style.icon}`} style={{ width: '20px', color: style.color }}></i> 
                                    {cat.name || cat.category_name}
                                </button>
                            );
                        })
                    ) : (
                        <p style={{fontSize: '12px', color: '#999', paddingLeft: '15px'}}>
                            {categories === null ? '読み込み中...' : 'カテゴリがありません'}
                        </p>
                    )}
                </div>
            </div>

            {/* 2. MAIN CONTENT */}
            <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '30px', minHeight: '80vh', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                
                {/* HEADER CONTENT */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px', position: 'relative' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', color: '#333', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {selectedTopic ? (
                            <span onClick={() => setSelectedTopic(null)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-arrow-left"></i> {selectedTopic.topic.title}
                            </span>
                        ) : (
                            <>
                                {currentCategory === 'ALL' 
                                    ? 'すべてのトピック' 
                                    : (Array.isArray(categories) && categories.find(c => (c.id || c.category_id) == currentCategory)?.name) || 'カテゴリー'
                                }
                            </>
                        )}
                        </h1>
                        {!selectedTopic && <p style={{ color: '#666', marginTop: '5px', fontSize: '13px' }}>
                            {currentCategory === 'ALL' ? 'コミュニティ全体のディスカッション' : '科目ごとのトピック一覧'}
                        </p>}
                    </div>

                    {/* SEARCH BAR */}
                    {!selectedTopic && (
                        <div ref={searchRef} style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                            {showSearchBar ? (
                                <div style={{ position: 'relative' }}>
                                    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input 
                                            type="text" autoFocus placeholder="キーワード..." value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #14b8a6', outline: 'none', width: '220px' }}
                                        />
                                        <button type="button" onClick={closeSearch} style={{ background: '#f3f4f6', color: '#666', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </form>
                                    {isSearching && (
                                        <div style={{ position: 'absolute', top: '110%', right: 0, width: '400px', maxHeight: '400px', overflowY: 'auto', backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid #e5e7eb', zIndex: 50 }}>
                                            {searchResults.length === 0 ? (
                                                <div style={{ padding: '15px', textAlign: 'center', color: '#888', fontSize: '13px' }}>結果が見つかりません</div>
                                            ) : (
                                                searchResults.map((result) => (
                                                    <div key={result.post_id} onClick={() => handleResultClick(result.topic_id, result.post_id)} style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdfa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                                        <div style={{ fontWeight: '600', color: '#0f766e', fontSize: '14px', marginBottom: '3px' }}><HighlightText text={result.topic_title} highlight={searchQuery} /></div>
                                                        <div style={{ fontSize: '12px', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HighlightText text={result.content} highlight={searchQuery} /></div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => setShowSearchBar(true)} style={{ background: '#f0fdfa', color: '#14b8a6', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT */}
                <div>
                    {selectedTopic ? (
                        <TopicDetailView 
                            data={selectedTopic} 
                            onRefresh={() => handleSelectTopic(selectedTopic.topic.topic_id)} 
                            onBack={() => { setSelectedTopic(null); loadInitialData(); }} // Refresh lại khi back ra
                            searchQuery={searchQuery} 
                        />
                    ) : (
                        <TopicListView 
                            topics={getFilteredTopics()} 
                            categories={categories} // <--- TRUYỀN CATEGORIES XUỐNG
                            onSelect={handleSelectTopic} 
                            onRefresh={loadInitialData}
                        />
                    )}
                </div>

            </div>
        </div>

      </div>

      {/* Modal tạo bài viết */}
      {showCreateModal && (
        <CreateTopicModal 
          categories={categories} // <--- TRUYỀN CATEGORIES VÀO MODAL
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            loadInitialData(); // Load lại data mới
            setCurrentCategory('ALL');
          }} 
        />
      )}
    </div>
  );
}

// --- TOPIC LIST VIEW ---
function TopicListView({ topics, categories, onSelect, onRefresh }) {
    const { user } = useAuth();

    const handleDeleteTopic = async (e, topicId) => {
        e.stopPropagation();
        if (window.confirm("このトピックを削除してもよろしいですか？")) {
            try { await forumService.deleteTopic(topicId); if (onRefresh) onRefresh(); } 
            catch (error) { alert("削除に失敗しました"); }
        }
    };
    
    // Tìm thông tin Category dựa trên ID
    const getCatInfo = (topicCatId) => {
        if (!Array.isArray(categories) || categories.length === 0) 
             return { name: '...', icon: 'fa-tag', color: '#999', bg: '#eee' };
        
        const foundCat = categories.find(c => String(c.category_id) === String(topicCatId));
        
        if (foundCat) {
             const index = categories.indexOf(foundCat);
             const style = getCategoryStyle(index);
             return { name: foundCat.name, ...style };
        }
        return { name: 'General', icon: 'fa-layer-group', color: '#64748b', bg: '#f1f5f9' };
    };
    console.log("Danh sách bài viết:", topics); 
    console.log("Danh sách môn học:", categories);
    return (
        <div className="topic-list">
          {topics.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <i className="fa-regular fa-folder-open" style={{ fontSize: '40px', marginBottom: '15px', color: '#d1d5db' }}></i>
                <p>トピックが見つかりません。</p>
            </div>
          ) : (
            topics.map(topic => {
                const catInfo = getCatInfo(topic.category_id); // Dùng category_id
                return (
                    <div key={topic.topic_id} onClick={() => onSelect(topic.topic_id)} style={{
                        padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', background: 'white'
                    }} className="topic-item">
                        
                        {user && user.id == topic.user_id && (
                        <button onClick={(e) => handleDeleteTopic(e, topic.topic_id)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                            <i className="fa-regular fa-trash-can"></i>
                        </button>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                            {/* TAG CATEGORY (Môn học) */}
                            <span style={{ 
                                fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', 
                                backgroundColor: catInfo.bg, color: catInfo.color 
                            }}>
                                <i className={`fa-solid ${catInfo.icon}`} style={{ marginRight: '4px' }}></i>
                                {catInfo.name}
                            </span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(topic.created_at).toLocaleDateString()}</span>
                        </div>
            
                        <h3 style={{ fontSize: '17px', color: '#334155', marginBottom: '10px', paddingRight: '30px', fontWeight: '600' }}>{topic.title}</h3>
                        
                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#6b7280' }}>
                            <span><i className="fa-regular fa-user"></i> {topic.author_name}</span>
                            <span><i className="fa-regular fa-comment"></i> {topic.reply_count} 件の返信</span>
                        </div>
                    </div>
                )
            })
          )}
        </div>
    );
}

// --- CREATE MODAL (Hiển thị danh sách môn học từ props) ---
function CreateTopicModal({ onClose, onSuccess, categories }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState(''); // Lưu ID môn học
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category_id", categoryId); // Gửi ID môn học lên server
      if (file) {
        formData.append("attachment", file);
      }
  
      try {
        await forumService.createTopic(formData);
        onSuccess();
      } catch (err) {
        alert("投稿中にエラーが発生しました");
      }
      setLoading(false);
    };
  
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '600px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#333' }}>新しいトピックを作成</h2>
          <form onSubmit={handleSubmit}>
            
            {/* SELECT CATEGORY TỪ DB (ĐÃ SỬA CHECK MẢNG) */}
            <div className="form-group-icon">
                <label>科目 (Môn học) <span style={{color: 'red'}}>*</span></label>
                <div className="input-wrapper">
                    <select 
                        required 
                        value={categoryId} 
                        onChange={e => setCategoryId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', background: 'white' }}
                    >
                        <option value="">科目を選択してください...</option>
                        {Array.isArray(categories) && categories.map(cat => (
                            <option key={cat.id || cat.category_id} value={cat.id || cat.category_id}>
                                {cat.name || cat.category_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group-icon">
              <label>タイトル <span style={{color: 'red'}}>*</span></label>
              <div className="input-wrapper">
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="例：React Routerの使い方" />
              </div>
            </div>

            <div className="form-group-icon">
              <label>詳細 <span style={{color: 'red'}}>*</span></label>
              <textarea required value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', minHeight: '150px', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }} placeholder="質問や共有したい内容を詳しく書いてください..." />
            </div>
  
            <div className="form-group-icon">
              <label>添付ファイル (任意)</label>
              <input type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'block', marginTop: '5px' }} />
            </div>
  
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: 'none', background: '#eee', borderRadius: '8px', cursor: 'pointer' }}>キャンセル</button>
              <button type="submit" className="btn-login-primary" disabled={loading} style={{ width: 'auto' }}>
                {loading ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}

// TopicDetailView giữ nguyên
function TopicDetailView({ data, onRefresh, onBack, searchQuery }) {
    const [replyContent, setReplyContent] = useState("");
    const [file, setFile] = useState(null); 
    const { user } = useAuth();
    const replyInputRef = useRef(null); 
  
    const handleReply = async (e) => {
      e.preventDefault();
      if (!replyContent.trim()) return;
      const formData = new FormData();
      formData.append("content", replyContent);
      if (file) formData.append("attachment", file);
      try { await forumService.reply(data.topic.topic_id, formData); setReplyContent(""); setFile(null); onRefresh(); } catch (error) { alert("エラーが発生しました"); }
    };
  
    const handleLike = async (postId) => { await forumService.toggleLike(postId); onRefresh(); };
    const handleDelete = async (postId, isMainPost) => {
      if (window.confirm("この投稿を削除してもよろしいですか？")) {
        try { if (isMainPost) { await forumService.deleteTopic(data.topic.topic_id); onBack(); } else { await forumService.deletePost(postId); onRefresh(); } } catch (error) { alert("削除できませんでした"); }
      }
    }
    const handleQuoteReply = (authorName) => {
      if (!user) { alert("返信するにはログインしてください"); return; }
      const mention = `@${authorName} `; setReplyContent(prev => prev.trim() ? `${prev}\n${mention}` : mention);
      if (replyInputRef.current) { replyInputRef.current.focus(); replyInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    };
    const renderAttachment = (url) => {
      if (!url) return null; const fullUrl = `http://localhost:5001${url}`; const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);
      return ( <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '8px', display: 'inline-block' }}> {isImage ? ( <img src={fullUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} /> ) : ( <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#14b8a6', textDecoration: 'none' }}> <i className="fa-solid fa-paperclip"></i> 添付ファイルを開く </a> )} </div> );
    };
  
    return (
      <div>
        <div className="posts-container">
          {data.posts.map((post, index) => {
            const isMainPost = index === 0; const isOwner = user && user.id == post.user_id;
            return (
              <div key={post.post_id} id={`post-${post.post_id}`} style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                <div style={{ width: '40px', height: '40px', background: '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#555' }}> {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'} </div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: isMainPost ? '#f0fdfa' : '#f9fafb', padding: '15px', borderRadius: '12px', position: 'relative' }}>
                    {isOwner && ( <button onClick={() => handleDelete(post.post_id, isMainPost)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }} title="削除"> <i className="fa-regular fa-trash-can"></i> </button> )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}> <strong style={{ color: '#333' }}>{post.author_name} {isMainPost && <span style={{fontSize: '11px', background: '#14b8a6', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px'}}>AUTHOR</span>}</strong> <span style={{ fontSize: '12px', color: '#999', paddingRight: isOwner ? '25px' : '0' }}>{new Date(post.created_at).toLocaleString()}</span> </div>
                    <p style={{ lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}> <HighlightText text={post.content} highlight={searchQuery} /> </p>
                    {renderAttachment(post.attachment_url)}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '15px', fontSize: '13px' }}> <button onClick={() => handleLike(post.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.is_liked ? '#e11d48' : '#666' }}> <i className={`fa-${post.is_liked ? 'solid' : 'regular'} fa-heart`}></i> {post.like_count} いいね </button> <button onClick={() => handleQuoteReply(post.author_name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}> <i className="fa-regular fa-comment-dots"></i> 返信 </button> </div>
                </div>
              </div>
            );
          })}
        </div>
        {user ? (
          <form onSubmit={handleReply} style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', background: '#14b8a6', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <i className="fa-solid fa-pen"></i> </div>
            <div style={{ flex: 1 }}>
              <textarea ref={replyInputRef} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="返信を入力してください..." style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', resize: 'vertical' }} required />
              {file && ( <div style={{ fontSize: '13px', color: '#666', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}> <i className="fa-solid fa-file"></i> {file.name} <span onClick={() => setFile(null)} style={{ cursor: 'pointer', color: '#ef4444', marginLeft: '5px' }} title="削除"> <i className="fa-solid fa-xmark"></i> </span> </div> )}
              <div style={{ marginTop: '10px', textAlign: 'right' }}> <input type="file" id="reply-file-upload" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} /> <label htmlFor="reply-file-upload" style={{ marginRight: '10px', padding: '8px 15px', border: '1px solid #ddd', background: '#f9f9f9', borderRadius: '6px', cursor: 'pointer', display: 'inline-block', fontSize: '14px' }}> <i className="fa-solid fa-paperclip"></i> ファイルを添付 </label> <button type="submit" className="btn-login-primary" style={{ width: 'auto', padding: '8px 25px' }}> 返信を投稿 </button> </div>
            </div>
          </form>
        ) : ( <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginTop: '20px' }}> ディスカッションに参加するにはログインしてください。 </div> )}
      </div>
    );
}

export default Forum;