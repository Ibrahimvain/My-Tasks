// db/schema.js
import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  username: varchar('username').notNull().unique(),
  password: varchar('password').notNull(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  note: text('note').notNull(),
  userId: integer('user_id').references(() => user.id).notNull(),
});
