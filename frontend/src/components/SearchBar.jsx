import { useState, useEffect, useRef } from "react";
import "./css/SearchBar.css";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    // sanitize: giữ letters, numbers, whitespace; loại bỏ ký tự đặc biệt
    const sanitize = (s) => {
        try {
            // Unicode property escapes: giữ letters (\p{L}), numbers (\p{N}), and whitespace
            return s.trim().replace(/[^\p{L}\p{N}\s]/gu, "");
        } catch (e) {
            // Fallback nếu trình duyệt không hỗ trợ \p{...}
            return s.trim().replace(/[!@#$%^&*()+=[\]{};:'"\\|,<.>/?~`]/g, "");
        }
    };

    useEffect(() => {
        // hide dropdown when input empty
        if (query.trim() === "") {
            clearPending();
            setResults([]);
            setError("");
            setShowDropdown(false);
            return;
        }

        // debounce 300ms
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
        // cancel previous
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError("");

        const start = performance.now();

        try {
            // call API (backend supports ?sort if needed); limit applied client-side
            const res = await fetch(`/api/search?q=${encodeURIComponent(cleanedQuery)}`, {
                signal: controller.signal,
            });

            const duration = performance.now() - start;
            // optional: you can log duration for perf tuning
            // console.log("search took", duration, "ms");

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const items = (data.results || []).slice(0, 10); // max 10 suggestions
            setResults(items);
            setShowDropdown(true);
            setError("");
        } catch (err) {
            if (err.name === "AbortError") {
                // aborted - ignore
                return;
            }
            console.error("Search error:", err);
            setError("サーバーエラーが発生しました。再試行してください。");
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
        // default behavior: navigate to course detail if you have a route,
        // otherwise just fill input and close dropdown
        setQuery(item.title);
        setShowDropdown(false);
        // e.g., navigate(`/courses/${item.course_id}`) if router is available
    };

    // handle click outside to close dropdown - attach on document
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
                    placeholder="コースを探す..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                    aria-label="Search courses"
                    onFocus={() => {
                        if (results.length > 0) setShowDropdown(true);
                    }}
                />
                <button
                    type="button"
                    className="search-icon-btn"
                    onClick={query ? handleClear : () => {}}
                    aria-label={query ? "Clear search" : "Search"}
                >
                    {query ? (
                        <span className="icon-clear">✕</span>
                    ) : (
                        <span className="icon-search">🔍</span>
                    )}
                </button>
            </div>

            {showDropdown && (
                <div className="search-results" role="listbox" aria-live="polite">
                    {loading && <div className="loading">読み込み中...</div>}

                    {error && (
                        <div className="error">
                            {error}
                            <button className="retry-btn" onClick={handleRetry}>再試行</button>
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="no-result">一致するコースが見つかりません</div>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <>
                            {results.map((item) => (
                                <div
                                    key={item.course_id}
                                    className="item"
                                    role="option"
                                    onClick={() => onSelect(item)}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") onSelect(item);
                                    }}
                                >
                                    <img
                                        src={item.thumbnail || "/placeholder.png"}
                                        alt={item.title}
                                        className="thumb"
                                    />
                                    <div className="info">
                                        <b>{item.title}</b>
                                        <div className="meta">
                                            <span className="instructor">講師: {item.instructor_name || "-"}</span>
                                            <span className="category">トピック: {item.category_name || "-"}</span>
                                        </div>
                                        <div className="tags">
                                            {item.tags?.map((t) => (
                                                <span key={t} className="tag">{t}</span>
                                            ))}
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