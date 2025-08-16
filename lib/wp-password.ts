import bcrypt from 'bcryptjs'

export function hashWordPressPassword(plain: string): string {
  // WordPress uses a modified version of phpass, but bcrypt is compatible
  // We'll use bcrypt with cost 10 which is similar to WordPress default
  return bcrypt.hashSync(plain, 10)
}


