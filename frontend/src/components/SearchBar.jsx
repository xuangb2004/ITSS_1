import { useState, useEffect, useRef } from "react";
import "./css/SearchBar.css";

// バックエンドAPIのURL（環境変数 or localhost）
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    // 特殊文字を除去（日本語対応）
    const sanitize = (s) => {
        try {
            return s.trim().replace(/[^\p{L}\p{N}\s]/gu, "");
        } catch (e) {
            return s.trim().replace(/[!@#$%^&*()+=[\]{};:'"\\|,<.>/?~`]/g, "");
        }
    };

    useEffect(() => {
        if (query.trim() === "") {
            clearPending();
            setResults([]);
            setError("");
            setShowDropdown(false);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const cleaned = sanitize(query);
            if (cleaned === "") {
                setResults([]);
                setShowDropdown(false);
                return;
            }
            fetchResults(cleaned);
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const clearPending = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    };

    const fetchResults = async (cleanedQuery) => {
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${API_BASE}/search?q=${encodeURIComponent(cleanedQuery)}`,
                { signal: controller.signal }
            );

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const items = (data.results || []).slice(0, 10);
            setResults(items);
            setShowDropdown(true);
        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("Search error:", err);
            setShowDropdown(true);
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    };

    const handleClear = () => {
        clearPending();
        setQuery("");
        setResults([]);
        setError("");
        setShowDropdown(false);
    };

    const handleRetry = () => {
        const cleaned = sanitize(query);
        if (cleaned !== "") fetchResults(cleaned);
    };

    const onSelect = (item) => {
        setQuery(item.title);
        setShowDropdown(false);
    };

    useEffect(() => {
        const onDocClick = (e) => {
            const root = document.querySelector(".search-container");
            if (!root) return;
            if (!root.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    return (
        <div className="search-container" role="search">
            <div className="search-input-wrap">
                <input
                    type="text"
                    placeholder="コースを検索..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                    onFocus={() => {
                        if (results.length > 0) setShowDropdown(true);
                    }}
                />
                <button
                    type="button"
                    className="search-icon-btn"
                    onClick={query ? handleClear : () => {}}
                >
                    {query ? (
                        <span className="icon-clear">✕</span>
                    ) : (
                        <span className="icon-search">🔍</span>
                    )}
                </button>
            </div>

            {showDropdown && (
                <div className="search-results">
                    {loading && (
                        <div className="loading">検索中...</div>
                    )}

                    {error && (
                        <div className="error">
                            {error}
                            <button className="retry-btn" onClick={handleRetry}>
                                再試行
                            </button>
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="no-result">
                            検索結果が見つかりません
                        </div>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <>
                            {results.map((item) => (
                                <div
                                    key={item.course_id}
                                    className="item"
                                    onClick={() => onSelect(item)}
                                >
                                    <img
                                        src={item.thumbnail || "https://placehold.co/50"}
                                        alt={item.title}
                                        className="thumb"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/50";
                                        }}
                                    />
                                    <div className="info">
                                        <b>{item.title}</b>
                                        <div className="meta">
                                            <span className="instructor">
                                                講師: {item.instructor_name || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
