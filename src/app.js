import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();

// 디버깅을 위한 미들웨어
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true,
}));

// 라우터 연결
app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/posts', postRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API 서버가 정상적으로 실행 중입니다." });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '서버 에러가 발생했습니다.' });
});

import { query } from "./database/db.js";

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

export default app;