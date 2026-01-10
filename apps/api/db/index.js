import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool);

// Test database connection
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        connection.release();
        return true;
    } catch (error) {
        console.error("Database connection failed:", error.message);
        return false;
    }
}

// Close database connection pool
export async function closeConnection() {
    try {
        await pool.end();
        console.log("Database connection pool closed");
    } catch (error) {
        console.error("Error closing database connection:", error.message);
    }
}

export { pool };
