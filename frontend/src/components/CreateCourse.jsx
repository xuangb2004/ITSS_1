import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, categoryService } from '../services/api';

function CreateCourse() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    level: 'Beginner',
    thumbnail: null
  });
  const [preview, setPreview] = useState(null);
  
  // State quản lý danh sách bài học
  const [lessons, setLessons] = useState([
    { title: '', video_url: '' }
  ]);

  useEffect(() => {
    categoryService.getAllCategories().then(data => {
        if(data.categories) setCategories(data.categories);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // Xử lý thay đổi input bài học
  const handleLessonChange = (index, field, value) => {
    const newLessons = [...lessons];
    newLessons[index][field] = value;
    setLessons(newLessons);
  };

  // Thêm bài học mới
  const addLesson = () => {
    setLessons([...lessons, { title: '', video_url: '' }]);
  };

  // Xóa bài học
  const removeLesson = (index) => {
    const newLessons = lessons.filter((_, i) => i !== index);
    setLessons(newLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price || 0);
      data.append('category_id', formData.category_id);
      data.append('level', formData.level);
      if (formData.thumbnail) {
        data.append('thumbnail', formData.thumbnail);
      }
      
      // Gửi danh sách bài học dưới dạng chuỗi JSON
      data.append('lessons', JSON.stringify(lessons));

      await courseService.createCourse(data);
      alert("Tạo khóa học thành công!");
      navigate('/dashboard'); 
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo khóa học.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Tạo khóa học mới</h2>
      <form onSubmit={handleSubmit}>
        {/* --- Thông tin cơ bản --- */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div style={{ marginBottom: '15px' }}>
                <label>Tên khóa học:</label>
                <input 
                    type="text" name="title" required 
                    value={formData.title} onChange={handleChange}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label>Danh mục:</label>
                <select 
                    name="category_id" required 
                    value={formData.category_id} onChange={handleChange}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div style={{ marginBottom: '15px' }}>
                <label>Giá ($) (Nhập 0 để Miễn phí):</label>
                <input 
                    type="number" name="price" required 
                    value={formData.price} onChange={handleChange}
                    placeholder="0"
                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label>Trình độ:</label>
                <select name="level" value={formData.level} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <option value="Beginner">Cơ bản (Beginner)</option>
                    <option value="Intermediate">Trung bình (Intermediate)</option>
                    <option value="Advanced">Nâng cao (Advanced)</option>
                </select>
            </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Mô tả:</label>
          <textarea 
            name="description" rows="4" required 
            value={formData.description} onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Ảnh bìa:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', marginTop: '5px' }} />
          {preview && <img src={preview} alt="Preview" style={{ width: '200px', marginTop: '10px', borderRadius: '4px' }} />}
        </div>

        {/* --- Phần nhập danh sách bài học --- */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{fontSize: '18px', marginBottom: '15px'}}>Nội dung khóa học (Video)</h3>
            {lessons.map((lesson, index) => (
                <div key={index} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{paddingTop: '8px', fontWeight: 'bold', color: '#888'}}>#{index + 1}</span>
                    <div style={{flex: 1}}>
                        <input 
                            type="text" 
                            placeholder="Tiêu đề bài học"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <input 
                            type="text" 
                            placeholder="Link YouTube (VD: https://youtu.be/...)"
                            value={lesson.video_url}
                            onChange={(e) => handleLessonChange(index, 'video_url', e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    {lessons.length > 1 && (
                        <button type="button" onClick={() => removeLesson(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginTop: '8px' }}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={addLesson} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                + Thêm bài học
            </button>
        </div>

        <button type="submit" className="btn-login-primary" style={{ width: '100%', marginTop: '30px', padding: '12px' }}>Hoàn tất & Đăng khóa học</button>
      </form>
    </div>
  );
}

export default CreateCourse;