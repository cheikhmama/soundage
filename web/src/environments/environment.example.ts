/**
 * Copy these values into src/environments/environment.ts and set your real values.
 * Store all keys in environment variables or a local file that is not committed.
 *
 * Cloudinary (admin image uploads for polls, e.g. player comparison):
 * 1. Sign up at https://cloudinary.com
 * 2. Dashboard: copy your Cloud name
 * 3. Settings > Upload: add an "Upload preset", set Signing Mode to "Unsigned"
 * 4. Set cloudName and uploadPreset below (keep API key/secret only on backend if you add signed uploads later)
 *
 * Ref: https://cloudinary.com/documentation/angular_integration
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  cloudinary: {
    cloudName: '',
    uploadPreset: '',
  },
};
