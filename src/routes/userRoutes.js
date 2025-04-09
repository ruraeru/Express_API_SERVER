import express from "express";
import { query } from "../database/db.js";
import bcrypt from 'bcrypt';


const router = express.Router();
// 전체 유저 조회
router.get('/', async (req, res) => {
    try {
        const users = await query(
            'SELECT id, username, email, phone, avatar, created_at FROM User ORDER BY created_at DESC'
        );
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 모든 사용자 조회
router.get("/users", async (req, res) => {
    console.log("GET /api/users 요청 받음");
    try {
        const [users] = await query("SELECT * FROM users");
        console.log("조회된 사용자:", users);
        res.json(users);
    } catch (error) {
        console.error("에러 발생:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 특정 사용자 조회
router.get("/users/:id", async (req, res) => {
    console.log("GET /api/users/:id 요청 받음, id:", req.params.id);
    try {
        const [user] = await query(
            "SELECT * FROM users WHERE id = ?",
            [req.params.id]
        );
        if (user.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        res.json(user[0]);
    } catch (error) {
        console.error("에러 발생:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 사용자 생성
router.post("/users", async (req, res) => {
    console.log("POST /api/users 요청 받음, body:", req.query);
    const { name, email } = req.query;
    try {
        const [result] = await query(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            [name, email]
        );
        console.log("생성된 사용자:", { id: result.insertId, name, email });
        res.status(201).json({ id: result.insertId, name, email });
    } catch (error) {
        console.error("에러 발생:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 사용자 정보 수정
router.put("/users/:id", async (req, res) => {
    console.log(
        "PUT /api/users/:id 요청 받음, id:",
        req.params.id,
        "body:",
        req.query
    );
    const { name, email } = req.query;
    try {
        await query(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, req.params.id]
        );
        res.json({ id: req.params.id, name, email });
    } catch (error) {
        console.error("에러 발생:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 사용자 삭제
router.delete("/users/:id", async (req, res) => {
    console.log("DELETE /api/users/:id 요청 받음, id:", req.params.id);
    try {
        await query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ message: "사용자가 삭제되었습니다." });
    } catch (error) {
        console.error("에러 발생:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 회원가입
router.post('/signup', async (req, res) => {
    const { username, email, password, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO User (username, email, password, phone) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, phone]
        );
        res.status(201).json({
            success: true,
            data: { id: result.insertId, username, email }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await query('SELECT * FROM User WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: '사용자를 찾을 수 없습니다.'
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: '비밀번호가 일치하지 않습니다.'
            });
        }

        res.json({
            success: true,
            data: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 사용자 정보 조회
router.get('/:id', async (req, res) => {
    try {
        const users = await query(
            'SELECT id, username, email, phone, avatar, created_at FROM User WHERE id = ?',
            [req.params.id]
        );
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: '사용자를 찾을 수 없습니다.'
            });
        }
        res.json({ success: true, data: users[0] });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 사용자 정보 수정
router.put('/:id', async (req, res) => {
    const { email, phone, avatar } = req.body;
    try {
        await query(
            'UPDATE User SET email = ?, phone = ?, avatar = ? WHERE id = ?',
            [email, phone, avatar, req.params.id]
        );
        res.json({
            success: true,
            data: { message: '사용자 정보가 업데이트되었습니다.' }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 사용자 삭제
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM User WHERE id = ?', [req.params.id]);
        res.json({
            success: true,
            data: { message: '사용자가 삭제되었습니다.' }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;