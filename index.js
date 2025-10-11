// index.js
import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import { setCookie } from "hono/cookie";

const app = new Hono();

// API Registrasi
app.post("api/register", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({ username, password: hashedPassword })
      .returning({ id: users.id, username: users.username });

    return c.json({ success: true, data: newUser[0] }, 201);
  } catch (error) {
    return c.json({ success: false, message: "Register gagal" }, 400);
  }
});

// API LOGIN
app.post("/api/login", async (c) => {
  const { username, password } = await c.req.json();
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  });

  if (!user)
    return c.json(
      { success: false, message: "Username atau password salah" },
      401
    );

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return c.json(
      { success: false, message: "Username atau password salah " },
      401
    );

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  setCookie(c, "token", token, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 3600,
  });

  return c.json({ success: true, message: "Login berhasil" });
});

// API GET
app.get("/", (c) => {
  return c.text("Halo, Saya sedang belajar API");
});

// Jalankan server
const port = 5000;
console.log(`Server is running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
