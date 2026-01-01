import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- HÀM HELPER ---
const getCategoryStyle = (index) => {
    const styles = [
        { icon: 'fa-code', color: '#0ea5e9', bg: '#e0f2fe' },
        { icon: 'fa-book', color: '#f59e0b', bg: '#fef3c7' },
        { icon: 'fa-flask', color: '#ec4899', bg: '#fce7f3' },
        { icon: 'fa-calculator', color: '#10b981', bg: '#d1fae5' },
        { icon: 'fa-pen-nib', color: '#8b5cf6', bg: '#ede9fe' },
        { icon: 'fa-globe', color: '#6366f1', bg: '#e0e7ff' },
    ];
    return styles[index % styles.length];
};

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
  const [categories, setCategories] = useState([]); 
  const [selectedTopic, setSelectedTopic] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('ALL'); 
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

  const loadInitialData = async () => {
    try {
        const [topicsData, categoriesData] = await Promise.all([
            forumService.getTopics(),
            forumService.getCategories() 
        ]);
        setTopics(topicsData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        else if (categoriesData?.categories && Array.isArray(categoriesData.categories)) setCategories(categoriesData.categories);
        else if (categoriesData?.data && Array.isArray(categoriesData.data)) setCategories(categoriesData.data);
        else setCategories([]); 
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

 const getFilteredTopics = () => {
    if (currentCategory === 'ALL') return topics;
    return topics.filter(topic => String(topic.category_id) === String(currentCategory));
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
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '500' }}>
            <i className="fa-solid fa-house"></i> ホームに戻る
          </button>
        </div>

        <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
            {/* 1. SIDEBAR */}
            <div style={{ width: '260px', flexShrink: 0, background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <button className="btn-login-primary" style={{ width: '100%', padding: '12px', marginBottom: '20px', justifyContent: 'center' }} onClick={() => setShowCreateModal(true)}>
                    <i className="fa-solid fa-plus"></i> 新規トピック作成
                </button>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '10px' }}>科目 </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button onClick={() => { setCurrentCategory('ALL'); setSelectedTopic(null); }} style={{ textAlign: 'left', padding: '12px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentCategory === 'ALL' && !selectedTopic ? '#f0fdfa' : 'transparent', color: currentCategory === 'ALL' && !selectedTopic ? '#0f766e' : '#4b5563', fontWeight: currentCategory === 'ALL' && !selectedTopic ? '600' : '400', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
                        <i className="fa-solid fa-layer-group" style={{ width: '20px' }}></i> すべて
                    </button>
                    {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map((cat, index) => {
                            const style = getCategoryStyle(index);
                            return (
                                <button key={cat.id || cat.category_id} onClick={() => { setCurrentCategory(cat.id || cat.category_id); setSelectedTopic(null); }} style={{ textAlign: 'left', padding: '12px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentCategory === (cat.id || cat.category_id) && !selectedTopic ? '#f0fdfa' : 'transparent', color: currentCategory === (cat.id || cat.category_id) && !selectedTopic ? '#0f766e' : '#4b5563', fontWeight: currentCategory === (cat.id || cat.category_id) && !selectedTopic ? '600' : '400', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
                                    <i className={`fa-solid ${style.icon}`} style={{ width: '20px', color: style.color }}></i> {cat.name || cat.category_name}
                                </button>
                            );
                        })
                    ) : (
                        <p style={{fontSize: '12px', color: '#999', paddingLeft: '15px'}}>カテゴリがありません</p>
                    )}
                </div>
            </div>

            {/* 2. MAIN CONTENT */}
            <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '30px', minHeight: '80vh', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px', position: 'relative' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', color: '#333', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {selectedTopic ? (
                            <span onClick={() => setSelectedTopic(null)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-arrow-left"></i> {selectedTopic.topic.title}
                            </span>
                        ) : (
                            <> {currentCategory === 'ALL' ? 'すべてのトピック' : (Array.isArray(categories) && categories.find(c => (c.id || c.category_id) == currentCategory)?.name) || 'カテゴリー'} </>
                        )}
                        </h1>
                        {!selectedTopic && <p style={{ color: '#666', marginTop: '5px', fontSize: '13px' }}>{currentCategory === 'ALL' ? 'コミュニティ全体のディスカッション' : '科目ごとのトピック一覧'}</p>}
                    </div>

                    {!selectedTopic && (
                        <div ref={searchRef} style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                            {showSearchBar ? (
                                <div style={{ position: 'relative' }}>
                                    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input type="text" autoFocus placeholder="キーワード..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #14b8a6', outline: 'none', width: '220px' }} />
                                        <button type="button" onClick={closeSearch} style={{ background: '#f3f4f6', color: '#666', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-xmark"></i></button>
                                    </form>
                                    {isSearching && (
                                        <div style={{ position: 'absolute', top: '110%', right: 0, width: '400px', maxHeight: '400px', overflowY: 'auto', backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid #e5e7eb', zIndex: 50 }}>
                                            {searchResults.length === 0 ? <div style={{ padding: '15px', textAlign: 'center', color: '#888', fontSize: '13px' }}>結果が見つかりません</div> : searchResults.map((result) => (
                                                <div key={result.post_id} onClick={() => handleResultClick(result.topic_id, result.post_id)} style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdfa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                                    <div style={{ fontWeight: '600', color: '#0f766e', fontSize: '14px', marginBottom: '3px' }}><HighlightText text={result.topic_title} highlight={searchQuery} /></div>
                                                    <div style={{ fontSize: '12px', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HighlightText text={result.content} highlight={searchQuery} /></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : <button onClick={() => setShowSearchBar(true)} style={{ background: '#f0fdfa', color: '#14b8a6', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><i className="fa-solid fa-magnifying-glass"></i></button>}
                        </div>
                    )}
                </div>

                <div>
                    {selectedTopic ? (
                        <TopicDetailView 
                            data={selectedTopic} 
                            categories={categories} // <--- TRUYỀN CATEGORIES VÀO ĐÂY
                            onRefresh={() => handleSelectTopic(selectedTopic.topic.topic_id)} 
                            onBack={() => { setSelectedTopic(null); loadInitialData(); }} 
                            searchQuery={searchQuery} 
                        />
                    ) : (
                        <TopicListView topics={getFilteredTopics()} categories={categories} onSelect={handleSelectTopic} onRefresh={loadInitialData} />
                    )}
                </div>
            </div>
        </div>
      </div>
      {showCreateModal && <CreateTopicModal categories={categories} onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); loadInitialData(); setCurrentCategory('ALL'); }} />}
    </div>
  );
}

function TopicListView({ topics, categories, onSelect, onRefresh }) {
    const { user } = useAuth();
    const handleDeleteTopic = async (e, topicId) => {
        e.stopPropagation();
        if (window.confirm("このトピックを削除してもよろしいですか？")) {
            try { await forumService.deleteTopic(topicId); if (onRefresh) onRefresh(); } catch (error) { alert("削除に失敗しました"); }
        }
    };
    const getCatInfo = (topicCatId) => {
        if (!Array.isArray(categories) || categories.length === 0) return { name: '...', icon: 'fa-tag', color: '#999', bg: '#eee' };
        const foundCat = categories.find(c => String(c.category_id) === String(topicCatId));
        if (foundCat) {
             const index = categories.indexOf(foundCat);
             const style = getCategoryStyle(index);
             return { name: foundCat.name, ...style };
        }
        return { name: 'General', icon: 'fa-layer-group', color: '#64748b', bg: '#f1f5f9' };
    };
    return (
        <div className="topic-list">
          {topics.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}><i className="fa-regular fa-folder-open" style={{ fontSize: '40px', marginBottom: '15px', color: '#d1d5db' }}></i><p>トピックが見つかりません。</p></div> : topics.map(topic => {
                const catInfo = getCatInfo(topic.category_id);
                return (
                    <div key={topic.topic_id} onClick={() => onSelect(topic.topic_id)} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', background: 'white' }} className="topic-item">
                        {user && user.id == topic.user_id && <button onClick={(e) => handleDeleteTopic(e, topic.topic_id)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><i className="fa-regular fa-trash-can"></i></button>}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', backgroundColor: catInfo.bg, color: catInfo.color }}><i className={`fa-solid ${catInfo.icon}`} style={{ marginRight: '4px' }}></i>{catInfo.name}</span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(topic.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontSize: '17px', color: '#334155', marginBottom: '10px', paddingRight: '30px', fontWeight: '600' }}>{topic.title}</h3>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#6b7280' }}>
                            <span><i className="fa-regular fa-user"></i> {topic.author_name}</span>
                            <span><i className="fa-regular fa-comment"></i> {topic.reply_count} 件の返信</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

function CreateTopicModal({ onClose, onSuccess, categories }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault(); setLoading(true);
      const formData = new FormData();
      formData.append("title", title); formData.append("content", content); formData.append("category_id", categoryId);
      if (file) formData.append("attachment", file);
      try { await forumService.createTopic(formData); onSuccess(); } catch (err) { alert("投稿中にエラーが発生しました"); }
      setLoading(false);
    };
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '600px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#333' }}>新しいトピックを作成</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group-icon"><label>科目 (Môn học) <span style={{color: 'red'}}>*</span></label><div className="input-wrapper"><select required value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', background: 'white' }}><option value="">科目を選択してください...</option>{Array.isArray(categories) && categories.map(cat => (<option key={cat.id || cat.category_id} value={cat.id || cat.category_id}>{cat.name || cat.category_name}</option>))}</select></div></div>
            <div className="form-group-icon"><label>タイトル <span style={{color: 'red'}}>*</span></label><div className="input-wrapper"><input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="例：React Routerの使い方" /></div></div>
            <div className="form-group-icon"><label>詳細 <span style={{color: 'red'}}>*</span></label><textarea required value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', minHeight: '150px', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }} placeholder="質問や共有したい内容を詳しく書いてください..." /></div>
            <div className="form-group-icon"><label>添付ファイル (任意)</label><input type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'block', marginTop: '5px' }} /></div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}><button type="button" onClick={onClose} style={{ padding: '10px 20px', border: 'none', background: '#eee', borderRadius: '8px', cursor: 'pointer' }}>キャンセル</button><button type="submit" className="btn-login-primary" disabled={loading} style={{ width: 'auto' }}>{loading ? '投稿中...' : '投稿する'}</button></div>
          </form>
        </div>
      </div>
    );
}

// --- TOPIC DETAIL VIEW (ĐÃ SỬA: Hiển thị Tên môn học thay vì ID) ---
function TopicDetailView({ data, categories, onRefresh, onBack, searchQuery }) {
    const [replyContent, setReplyContent] = useState("");
    const [file, setFile] = useState(null); 
    const { user } = useAuth();
    const replyInputRef = useRef(null); 
    const mainPost = data.posts.length > 0 ? data.posts[0] : null;
    const comments = data.posts.length > 1 ? data.posts.slice(1) : [];

    // Hàm lấy tên môn học
    const getCatName = (id) => {
        if (!categories || categories.length === 0) return "";
        const cat = categories.find(c => String(c.category_id) === String(id));
        return cat ? cat.name : "General";
    }

    const handleReply = async (e) => {
      e.preventDefault(); if (!replyContent.trim()) return;
      const formData = new FormData(); formData.append("content", replyContent);
      if (file) formData.append("attachment", file);
      try { await forumService.reply(data.topic.topic_id, formData); setReplyContent(""); setFile(null); onRefresh(); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100); } catch (error) { alert("エラーが発生しました"); }
    };
    const handleLike = async (postId) => { await forumService.toggleLike(postId); onRefresh(); };
    const handleDelete = async (postId, isMainPost) => {
      if (window.confirm(isMainPost ? "Chủ đề này và toàn bộ bình luận sẽ bị xóa?" : "Xóa bình luận này?")) {
        try { if (isMainPost) { await forumService.deleteTopic(data.topic.topic_id); onBack(); } else { await forumService.deletePost(postId); onRefresh(); } } catch (error) { alert("Xóa thất bại"); }
      }
    }
    const handleQuoteReply = (authorName) => {
      if (!user) { alert("Vui lòng đăng nhập"); return; }
      const mention = `@${authorName} `; setReplyContent(prev => prev.trim() ? `${prev}\n${mention}` : mention);
      if (replyInputRef.current) { replyInputRef.current.focus(); replyInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    };
    const renderAttachment = (url) => {
      if (!url) return null; const fullUrl = `http://localhost:5001${url}`; const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);
      return ( <div style={{ marginTop: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block' }}> {isImage ? ( <img src={fullUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', display:'block' }} /> ) : ( <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', textDecoration: 'none', fontWeight: '500' }}> <i className="fa-solid fa-paperclip"></i> Tải xuống tệp đính kèm </a> )} </div> );
    };
  
    if (!mainPost) return <div>Đang tải...</div>;
    return (
      <div className="topic-detail-wrapper" style={{ animation: 'fadeIn 0.3s ease-in' }}>
        <div className="main-topic-section" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '40px' }}>
            <div style={{ padding: '25px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    {/* 👇 ĐÃ SỬA: Hiển thị Tên thay vì ID */}
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {getCatName(data.topic.category_id)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center' }}><i className="fa-regular fa-clock" style={{ marginRight: '5px' }}></i>{new Date(mainPost.created_at).toLocaleString('vi-VN')}</span>
                </div>
                <h1 style={{ margin: '0 0 20px 0', fontSize: '28px', color: '#1e293b', lineHeight: '1.4' }}>{data.topic.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{mainPost.author_name ? mainPost.author_name.charAt(0).toUpperCase() : 'U'}</div>
                    <div><div style={{ fontWeight: 'bold', color: '#334155', fontSize: '16px' }}>{mainPost.author_name}</div><div style={{ fontSize: '13px', color: '#94a3b8' }}>トピック作成者</div></div>
                    {user && String(user.id) === String(mainPost.user_id) && <button onClick={() => handleDelete(mainPost.post_id, true)} style={{ marginLeft: 'auto', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}><i className="fa-solid fa-trash"></i> Xóa bài</button>}
                </div>
            </div>
            <div style={{ padding: '30px', fontSize: '17px', lineHeight: '1.8', color: '#334155', minHeight: '150px' }}><div style={{ whiteSpace: 'pre-wrap' }}><HighlightText text={mainPost.content} highlight={searchQuery} /></div>{renderAttachment(mainPost.attachment_url)}</div>
            <div style={{ padding: '15px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '25px' }}>
                <button onClick={() => handleLike(mainPost.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mainPost.is_liked ? '#e11d48' : '#64748b', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><i className={`fa-${mainPost.is_liked ? 'solid' : 'regular'} fa-heart`} style={{ fontSize: '18px' }}></i> {mainPost.like_count} <span style={{ fontWeight: '500' }}>お気に入り</span></button>
                <div style={{ borderLeft: '1px solid #cbd5e1', height: '24px' }}></div>
                <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa-regular fa-comment"></i> {comments.length} コメント</div>
            </div>
        </div>

        <div className="comments-container">
            <h3 style={{ fontSize: '18px', color: '#475569', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fa-solid fa-comments"></i> 話し合う ({comments.length})</h3>
            {comments.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px dashed #cbd5e1' }}><p style={{ color: '#64748b', fontStyle: 'italic' }}>最初にディスカッションに参加しましょう!</p></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {comments.map((comment) => {
                        const isOwner = user && String(user.id) === String(comment.user_id);
                        return (
                            <div key={comment.post_id} id={`post-${comment.post_id}`} style={{ display: 'flex', gap: '15px', animation: 'fadeIn 0.3s' }}>
                                <div style={{ width: '36px', height: '36px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b', flexShrink: 0, marginTop: '5px' }}>{comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U'}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ background: '#fff', padding: '15px', borderRadius: '0 12px 12px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}><strong style={{ color: '#334155', fontSize: '14px' }}>{comment.author_name}</strong><span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(comment.created_at).toLocaleString()}</span></div>
                                        <div style={{ color: '#475569', fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}><HighlightText text={comment.content} highlight={searchQuery} /></div>
                                        {renderAttachment(comment.attachment_url)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px', marginLeft: '5px', fontSize: '12px', color: '#64748b' }}>
                                        <span onClick={() => handleLike(comment.post_id)} style={{ cursor: 'pointer', fontWeight: comment.is_liked ? 'bold' : 'normal', color: comment.is_liked ? '#e11d48' : 'inherit' }}>{comment.is_liked ? 'Đã thích' : 'Thích'} ({comment.like_count})</span>
                                        <span onClick={() => handleQuoteReply(comment.author_name)} style={{ cursor: 'pointer' }}>Trả lời</span>
                                        {isOwner && <span onClick={() => handleDelete(comment.post_id, false)} style={{ cursor: 'pointer', color: '#ef4444' }}>Xóa</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

        {user ? (
          <div style={{ marginTop: '50px', background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', position: 'sticky', bottom: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><i className="fa-solid fa-pen-to-square" style={{ color: '#0f766e' }}></i><strong style={{ color: '#334155' }}>コメントを書いてください</strong></div>
              <form onSubmit={handleReply}>
                <textarea ref={replyInputRef} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="ディスカッションに参加してください..." style={{ width: '100%', minHeight: '80px', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', outline: 'none', fontSize: '15px' }} required onFocus={(e) => e.target.style.borderColor = '#0f766e'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
                {file && <div style={{ fontSize: '13px', color: '#0f766e', marginTop: '10px', background: '#f0fdfa', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span><i className="fa-solid fa-file"></i> {file.name}</span><span onClick={() => setFile(null)} style={{ cursor: 'pointer', color: '#ef4444' }} title="Xóa"><i className="fa-solid fa-xmark"></i></span></div>}
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}><input type="file" id="reply-file-upload" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} /><label htmlFor="reply-file-upload" style={{ cursor: 'pointer', color: '#64748b', fontSize: '20px', padding: '5px' }} title="Đính kèm ảnh"><i className="fa-solid fa-image"></i></label></div>
                    <button type="submit" className="btn-login-primary" style={{ width: 'auto', padding: '8px 25px', borderRadius: '20px' }}><i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }}></i> コメントを送信</button> 
                </div>
              </form>
          </div>
        ) : <div style={{ textAlign: 'center', padding: '30px', background: '#f1f5f9', borderRadius: '12px', marginTop: '40px' }}><p style={{ color: '#64748b', marginBottom: '15px' }}>ディスカッションに参加するにはログインしてください。</p></div>}
      </div>
    );
}

export default Forum;