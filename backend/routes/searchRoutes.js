const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /search?q=xxx&sort=popular|newest
router.get("/", async (req, res) => {
    try {
        const q = req.query.q || "";
        const sort = req.query.sort || "最新";

        if (q.trim() === "") {
            return res.json({ results: [] });
        }

        const searchTerm = `%${q}%`;

        const query = `
            SELECT 
                c.course_id,
                c.title,
                c.description,
                c.thumbnail,
                c.price,
                c.created_at,
                u.name AS instructor_name,
                cat.name AS category_name,
                COALESCE(cp.enroll_count, 0) AS enroll_count,
                GROUP_CONCAT(t.name SEPARATOR ',') AS tags
            FROM courses c
            LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
            LEFT JOIN users u ON i.user_id = u.user_id
            LEFT JOIN categories cat ON c.category_id = cat.category_id
            LEFT JOIN course_tags ct ON c.course_id = ct.course_id
            LEFT JOIN tags t ON ct.tag_id = t.tag_id
            LEFT JOIN course_popularity cp ON c.course_id = cp.course_id
            WHERE 
                MATCH(c.title, c.description) AGAINST(? IN BOOLEAN MODE)
                OR u.name LIKE ?
                OR cat.name LIKE ?
                OR t.name LIKE ?
            GROUP BY c.course_id
            ORDER BY 
                CASE WHEN ? = '人気のある' THEN cp.enroll_count END DESC,
                CASE WHEN ? = '最新' THEN c.created_at END DESC
            LIMIT 20;
        `;

        const result = await pool.query(query, [q, searchTerm, searchTerm, searchTerm, sort, sort]);

        // Format tags từ comma-separated string thành array
        const results = result[0].map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
        }));

        res.json({ results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi server. Vui lòng thử lại." });
    }
});

module.exports = router;
