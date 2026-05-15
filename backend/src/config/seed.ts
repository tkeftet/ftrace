import User from '../models/User';

/**
 * Seed super admin user on first boot if it doesn't exist.
 */
export async function seedSuperAdmin(): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('[Seed] SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set — skipping seed');
    return;
  }

  const exists = await User.findOne({ email, role: 'super_admin' });
  if (exists) return;

  await User.create({
    email,
    password,
    name: 'Super Admin',
    role: 'super_admin',
  });

  console.log(`[Seed] Super admin created: ${email}`);
}
