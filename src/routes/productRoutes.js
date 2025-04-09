import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// 상품 생성
router.post('/', async (req, res) => {
    const { title, price, photo, description, userId } = req.body;
    try {
        const result = await query(
            'INSERT INTO Product (title, price, photo, description, userId) VALUES (?, ?, ?, ?, ?)',
            [title, price, photo, description, userId]
        );
        res.status(201).json({
            success: true,
            data: { id: result.insertId, title, price, photo, description }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 상품 목록 조회
router.get('/', async (req, res) => {
    try {
        const products = await query(
            'SELECT p.*, u.username FROM Product p JOIN User u ON p.userId = u.id ORDER BY p.created_at DESC'
        );
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 특정 상품 조회
router.get('/:id', async (req, res) => {
    try {
        const products = await query(
            'SELECT p.*, u.username FROM Product p JOIN User u ON p.userId = u.id WHERE p.id = ?',
            [req.params.id]
        );
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                error: '상품을 찾을 수 없습니다.'
            });
        }
        res.json({ success: true, data: products[0] });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 상품 수정
router.put('/:id', async (req, res) => {
    const { title, price, photo, description } = req.body;
    try {
        await query(
            'UPDATE Product SET title = ?, price = ?, photo = ?, description = ? WHERE id = ?',
            [title, price, photo, description, req.params.id]
        );
        res.json({
            success: true,
            data: { message: '상품이 업데이트되었습니다.' }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 상품 삭제
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM Product WHERE id = ?', [req.params.id]);
        res.json({
            success: true,
            data: { message: '상품이 삭제되었습니다.' }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router; 