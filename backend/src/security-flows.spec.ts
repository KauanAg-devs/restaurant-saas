import { imageExtension } from './admin/admin.module';
import { passwordResetDevMode } from './auth/auth.module';

describe('security-sensitive development flows',()=>{
  it('never exposes reset links in production',()=>{
    expect(passwordResetDevMode({PASSWORD_RESET_DEV_MODE:'true',VERCEL_ENV:'production'})).toBe(false);
    expect(passwordResetDevMode({PASSWORD_RESET_DEV_MODE:'true',VERCEL_ENV:'preview'})).toBe(true);
    expect(passwordResetDevMode({VERCEL_ENV:'preview'})).toBe(false);
  });

  it('only accepts browser-safe raster image types',()=>{
    expect(imageExtension('image/jpeg')).toBe('jpg');
    expect(imageExtension('image/webp')).toBe('webp');
    expect(imageExtension('image/svg+xml')).toBe('');
    expect(imageExtension('text/html')).toBe('');
  });
});
