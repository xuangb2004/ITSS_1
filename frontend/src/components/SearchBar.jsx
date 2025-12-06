import { useState, useEffect } from "react";
import "./css/SearchBar.css";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (query.trim() === "") {
            setResults([]);
            setError("");
            return;
        }

        const timeout = setTimeout(() => {
            fetchResults();
        }, 300); 

        return () => clearTimeout(timeout);
    }, [query]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (res.ok) {
                setResults(data.results);
            } else {
                setError("サーバーエラーが発生しました。もう一度お試しください。");
            }

        } catch (err) {
            setError("サーバーに接続できません。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="コースを探す..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />

            {query.trim() !== "" && (
                <div className="search-results">

                    {loading && <div className="loading">読み込み中...</div>}
                    
                    {error && <div className="error">{error}</div>}

                    {!loading && results.length === 0 && !error && (
                        <div className="no-result">適切なコースはありません</div>
                    )}

                    {results.map((item) => (
                        <div key={item.course_id} className="item">
                            <img src={item.thumbnail} className="thumb" />
                            <div className="info">
                                <b>{item.title}</b>
                                <div>講師: {item.instructor_name}</div>
                                <div>トピック: {item.category_name}</div>
                                <div className="tags">
                                    {item.tags?.map((t) => (
                                        <span key={t} className="tag">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}
