/**
 * Password generator. If password not exists, returns new password
 * @param password Password from form
 */
export const setPassword = (password: string | undefined): string => {
  if (password) {
    return password;
  }

  let newPassword: string = '';

  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 8; i++) {
    const rnd = Math.floor(Math.random() * chars.length);
    newPassword += chars.substring(rnd, rnd + 1);
  }

  return newPassword;
};
