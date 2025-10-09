// seed.js
import 'dotenv/config';
import { db } from './index.js';
import bcrypt from 'bcryptjs';
import { todos, user } from 'schema.js';

async function seed() {
  console.log('Seeding database...');

  // Hapus data lama (opsional)
//await db.delete(todos);
//await db.delete(users);

  // Buat user dummy dengan password yang sudah di-hash
  const plainPassword = 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash password

  // Buat user dummy
  const user1 = await db
    .insert(users)
    .values({
      username: 'Abdullah',
      // Di aplikasi nyata, pawwword ini harus di-hash!!!
      // Tapi untuk seed, kita bisa gunakan teks biasa.
      password: hashedPassword, // Simpan password yang sudah di-hash
    })
    .returning();

  // Buat todo dummy untuk user1
  await db.insert(todos)           // Masukkan data ke tabel 'todos'
  .values([                        // Data yang dimasukkan
    {
      note: 'Belajar Drizzle ORM', // Teks tasknya
      userId: user1[0].id          // Punya user siapa? (ambil ID dari user1 dan index 0
    },
    { note: 'Membuat API dengan Hono', userId: user1[0].id },
  ]);

  console.log('✅ Seeding completed!');
  process.exit(0);
}

  seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
