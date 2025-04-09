import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// 게시글 생성
router.post('/', async (req, res) => {
    const { title, description, userId } = req.body;
    try {
        const result = await query(
            'INSERT INTO Post (title, description, userId) VALUES (?, ?, ?)',
            [title, description, userId]
        );
        res.status(201).json({
            success: true,
            data: { id: result.insertId, title, description }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 게시글 목록 조회
router.get('/', async (req, res) => {
    try {
        const posts = await query(`
            SELECT p.*, u.username, 
                   COUNT(DISTINCT c.id) as commentCount,
                   COUNT(DISTINCT l.userId) as likeCount
            FROM Post p 
            JOIN User u ON p.userId = u.id
            LEFT JOIN Comment c ON p.id = c.postId
            LEFT JOIN \`Like\` l ON p.id = l.postId
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);
        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 특정 게시글 조회
router.get('/:id', async (req, res) => {
    try {
        // 조회수 증가
        await query('UPDATE Post SET views = views + 1 WHERE id = ?', [req.params.id]);

        const posts = await query(`
            SELECT p.*, u.username,
                   COUNT(DISTINCT c.id) as commentCount,
                   COUNT(DISTINCT l.userId) as likeCount
            FROM Post p 
            JOIN User u ON p.userId = u.id
            LEFT JOIN Comment c ON p.id = c.postId
            LEFT JOIN \`Like\` l ON p.id = l.postId
            WHERE p.id = ?
            GROUP BY p.id
        `, [req.params.id]);

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                error: '게시글을 찾을 수 없습니다.'
            });
        }

        // 댓글 조회
        const comments = await query(`
            SELECT c.*, u.username 
            FROM Comment c 
            JOIN User u ON c.userId = u.id 
            WHERE c.postId = ?
            ORDER BY c.created_at DESC
        `, [req.params.id]);

        const post = posts[0];
        post.comments = comments;

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 게시글 수정
router.put('/:id', async (req, res) => {
    const { title, description } = req.body;
    try {
        await query(
            'UPDATE Post SET title = ?, description = ? WHERE id = ?',
            [title, description, req.params.id]
        );
        res.json({
            success: true,
            data: { message: '게시글이 업데이트되었습니다.' }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 게시글 삭제
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM Post WHERE id = ?', [req.params.id]);
        res.json({
            success: true,
            data: { message: '게시글이 삭제되었습니다.' }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 게시글 좋아요
router.post('/:id/like', async (req, res) => {
    const { userId } = req.body;
    try {
        await query(
            'INSERT INTO `Like` (userId, postId) VALUES (?, ?)',
            [userId, req.params.id]
        );
        res.json({
            success: true,
            data: { message: '좋아요가 추가되었습니다.' }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            await query(
                'DELETE FROM `Like` WHERE userId = ? AND postId = ?',
                [userId, req.params.id]
            );
            res.json({
                success: true,
                data: { message: '좋아요가 취소되었습니다.' }
            });
        } else {
            res.status(400).json({ success: false, error: error.message });
        }
    }
});

// 댓글 작성
router.post('/:id/comments', async (req, res) => {
    const { userId, payload } = req.body;
    try {
        const result = await query(
            'INSERT INTO Comment (userId, postId, payload) VALUES (?, ?, ?)',
            [userId, req.params.id, payload]
        );
        res.status(201).json({
            success: true,
            data: { id: result.insertId, payload }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router; 