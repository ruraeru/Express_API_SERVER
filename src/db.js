import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const dbConfig = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Gamemode1@",
    database: "express_server"
};

console.log("데이터베이스 연결 시도:", {
    ...dbConfig,
    password: "****" // 보안을 위해 비밀번호는 숨김
});

const conn = mysql.createConnection(dbConfig);

conn
    .then((connection) => {
        console.log("데이터베이스 연결 성공");
        return connection;
    })
    .catch((err) => {
        console.error("데이터베이스 연결 에러:", err.message);
        throw err;
    });

export default conn;