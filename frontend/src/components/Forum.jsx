import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Forum() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null); // null = danh sách, object = chi tiết
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load danh sách chủ đề
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await forumService.getTopics();
      setTopics(data);
    } catch (error) {
      console.error("トピックの読み込みエラー", error);
    }
  };

  const handleSelectTopic = async (topicId) => {
    try {
      const data = await forumService.getTopicDetails(topicId);
      setSelectedTopic(data);
    } catch (error) {
      console.error("詳細の読み込みエラー", error);
    }
  };

  return (
    <div className="home-main" style={{ paddingTop: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '30px', minHeight: '80vh' }}>
        
        {/* --- NÚT HOME (MỚI THÊM) --- */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: '#666', 
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#14b8a6'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            <i className="fa-solid fa-house"></i> ホームに戻る
          </button>
        </div>
        {/* ----------------------------- */}

        {/* Header Diễn đàn */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: '#333' }}>
              {selectedTopic ? (
                <span onClick={() => setSelectedTopic(null)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-arrow-left"></i> {selectedTopic.topic.title}
                </span>
              ) : "ディスカッションフォーラム"}
            </h1>
            <p style={{ color: '#666', marginTop: '5px' }}>学びと知識共有のためのコミュニティ</p>
          </div>
          
          {!selectedTopic && (
            <button className="btn-login-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowCreateModal(true)}>
              <i className="fa-solid fa-plus"></i> 新規トピック作成
            </button>
          )}
        </div>

        {/* Nội dung chính */}
        {selectedTopic ? (
          <TopicDetailView 
            data={selectedTopic} 
            onRefresh={() => handleSelectTopic(selectedTopic.topic.topic_id)} 
            onBack={() => { setSelectedTopic(null); loadTopics(); }}
          />
        ) : (
          <TopicListView 
            topics={topics} 
            onSelect={handleSelectTopic} 
            onRefresh={loadTopics}
          />
        )}

      </div>

      {/* Modal tạo bài viết */}
      {showCreateModal && (
        <CreateTopicModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            loadTopics();
          }} 
        />
      )}
    </div>
  );
}

// Sub-component: Danh sách chủ đề
function TopicListView({ topics, onSelect, onRefresh }) {
  const { user } = useAuth();

  const handleDeleteTopic = async (e, topicId) => {
    e.stopPropagation();
    if (window.confirm("このトピックを削除してもよろしいですか？")) {
      try {
        await forumService.deleteTopic(topicId);
        if (onRefresh) onRefresh();
      } catch (error) {
        alert("削除に失敗しました");
      }
    }
  };

  return (
    <div className="topic-list">
      {topics.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>まだトピックがありません。最初の投稿を作成しましょう！</p>
      ) : (
        topics.map(topic => (
          <div key={topic.topic_id} onClick={() => onSelect(topic.topic_id)} style={{
            padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
          }} className="topic-item">
            
            {/* Nút xóa cho chủ topic (dùng == để so sánh lỏng) */}
            {user && user.id == topic.user_id && (
              <button 
                onClick={(e) => handleDeleteTopic(e, topic.topic_id)}
                style={{ 
                  position: 'absolute', top: '15px', right: '15px', 
                  border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '16px' 
                }}
                title="削除"
              >
                <i className="fa-regular fa-trash-can"></i>
              </button>
            )}

            <h3 style={{ fontSize: '18px', color: '#14b8a6', marginBottom: '8px', paddingRight: '30px' }}>{topic.title}</h3>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#888' }}>
              <span><i className="fa-regular fa-user"></i> {topic.author_name}</span>
              <span><i className="fa-regular fa-comment"></i> {topic.reply_count} 件の返信</span>
              <span><i className="fa-regular fa-clock"></i> {new Date(topic.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Sub-component: Chi tiết chủ đề + Trả lời
function TopicDetailView({ data, onRefresh, onBack }) {
  const [replyContent, setReplyContent] = useState("");
  const [file, setFile] = useState(null); // State lưu file
  const { user } = useAuth();
  const replyInputRef = useRef(null); // Ref cho ô nhập liệu

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    // Sử dụng FormData để gửi file và text
    const formData = new FormData();
    formData.append("content", replyContent);
    if (file) {
      formData.append("attachment", file);
    }

    try {
      await forumService.reply(data.topic.topic_id, formData);
      setReplyContent("");
      setFile(null);
      onRefresh();
    } catch (error) {
      alert("エラーが発生しました");
    }
  };

  const handleLike = async (postId) => {
    await forumService.toggleLike(postId);
    onRefresh();
  };

  const handleDelete = async (postId, isMainPost) => {
    if (window.confirm("この投稿を削除してもよろしいですか？")) {
      try {
        if (isMainPost) {
           await forumService.deleteTopic(data.topic.topic_id);
           onBack();
        } else {
           await forumService.deletePost(postId);
           onRefresh();
        }
      } catch (error) {
        alert("削除できませんでした");
      }
    }
  }

  // Hàm xử lý khi nhấn Reply: Thêm @User vào ô nhập
  const handleQuoteReply = (authorName) => {
    if (!user) {
        alert("返信するにはログインしてください");
        return;
    }
    const mention = `@${authorName} `;
    setReplyContent(prev => prev.trim() ? `${prev}\n${mention}` : mention);
    
    if (replyInputRef.current) {
        replyInputRef.current.focus();
        replyInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Hàm hiển thị file đính kèm
  const renderAttachment = (url) => {
    if (!url) return null;
    const fullUrl = `http://localhost:5001${url}`;
    const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);

    return (
      <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '8px', display: 'inline-block' }}>
        {isImage ? (
          <img src={fullUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />
        ) : (
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#14b8a6', textDecoration: 'none' }}>
            <i className="fa-solid fa-paperclip"></i> 添付ファイルを開く
          </a>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="posts-container">
        {data.posts.map((post, index) => {
          const isMainPost = index === 0;
          const isOwner = user && user.id == post.user_id;

          return (
            <div key={post.post_id} style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ width: '40px', height: '40px', background: '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#555' }}>
                {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ background: isMainPost ? '#f0fdfa' : '#f9fafb', padding: '15px', borderRadius: '12px', position: 'relative' }}>
                  
                  {isOwner && (
                    <button 
                      onClick={() => handleDelete(post.post_id, isMainPost)}
                      style={{ 
                        position: 'absolute', top: '15px', right: '15px', 
                        border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' 
                      }}
                      title="削除"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: '#333' }}>{post.author_name} {isMainPost && <span style={{fontSize: '11px', background: '#14b8a6', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px'}}>AUTHOR</span>}</strong>
                    <span style={{ fontSize: '12px', color: '#999', paddingRight: isOwner ? '25px' : '0' }}>{new Date(post.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                  
                  {/* Hiển thị file đính kèm */}
                  {renderAttachment(post.attachment_url)}

                </div>
                
                <div style={{ marginTop: '8px', display: 'flex', gap: '15px', fontSize: '13px' }}>
                  <button 
                    onClick={() => handleLike(post.post_id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.is_liked ? '#e11d48' : '#666' }}
                  >
                    <i className={`fa-${post.is_liked ? 'solid' : 'regular'} fa-heart`}></i> {post.like_count} いいね
                  </button>
                  
                  {/* Nút trả lời quote */}
                  <button 
                    onClick={() => handleQuoteReply(post.author_name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                  >
                    <i className="fa-regular fa-comment-dots"></i> 返信
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form trả lời */}
      {user ? (
        <form onSubmit={handleReply} style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', background: '#14b8a6', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-pen"></i>
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              ref={replyInputRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="返信を入力してください..."
              style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', resize: 'vertical' }}
              required
            />
            
            {/* Hiển thị tên file đã chọn */}
            {file && (
              <div style={{ fontSize: '13px', color: '#666', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="fa-solid fa-file"></i> {file.name} 
                <span onClick={() => setFile(null)} style={{ cursor: 'pointer', color: '#ef4444', marginLeft: '5px' }} title="削除">
                   <i className="fa-solid fa-xmark"></i>
                </span>
              </div>
            )}

            <div style={{ marginTop: '10px', textAlign: 'right' }}>
               {/* Input file ẩn, được kích hoạt bởi label */}
               <input 
                 type="file" 
                 id="reply-file-upload" 
                 style={{ display: 'none' }} 
                 onChange={(e) => setFile(e.target.files[0])}
               />
               <label htmlFor="reply-file-upload" style={{ marginRight: '10px', padding: '8px 15px', border: '1px solid #ddd', background: '#f9f9f9', borderRadius: '6px', cursor: 'pointer', display: 'inline-block', fontSize: '14px' }}>
                 <i className="fa-solid fa-paperclip"></i> ファイルを添付
               </label>

               <button type="submit" className="btn-login-primary" style={{ width: 'auto', padding: '8px 25px' }}>
                 返信を投稿
               </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginTop: '20px' }}>
          ディスカッションに参加するにはログインしてください。
        </div>
      )}
    </div>
  );
}

// Sub-component: Modal tạo topic
function CreateTopicModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
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
        <h2 style={{ marginBottom: '20px' }}>新しいトピックを作成</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group-icon">
            <label>タイトル</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="例：Node.jsのインストール方法は？"
              />
            </div>
          </div>
          <div className="form-group-icon">
            <label>詳細</label>
            <textarea 
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ width: '100%', minHeight: '150px', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
              placeholder="質問や共有したい内容を詳しく書いてください..."
            />
          </div>

          <div className="form-group-icon">
            <label>添付ファイル (任意)</label>
            <input 
              type="file" 
              onChange={e => setFile(e.target.files[0])} 
              style={{ display: 'block', marginTop: '5px' }}
            />
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

export default Forum;