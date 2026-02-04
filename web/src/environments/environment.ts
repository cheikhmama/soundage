/**
 * App configuration.
 *
 * How to get Cloudinary Cloud name and Upload preset:
 *
 * 1) CLOUD NAME
 *    - Open https://cloudinary.com/console and sign in
 *    - On the Dashboard you’ll see “Cloud name” (e.g. "dxxxxxxxx")
 *    - Copy that value → use as cloudName below
 *
 * 2) UPLOAD PRESET (unsigned, for browser uploads)
 *    - In the console, open the gear icon → Settings
 *    - Go to the “Upload” tab
 *    - Scroll to “Upload presets” → click “Add upload preset”
 *    - Preset name: e.g. "soundage_unsigned" (or leave default)
 *    - Under “Signing Mode” choose “Unsigned” (required for frontend uploads)
 *    - Click “Save”
 *    - The preset name you gave (or the default like "ml_default") → use as uploadPreset below
 *
 * Then set cloudName and uploadPreset in the object below. Do not commit real values to git.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  cloudinary: {
    cloudName: 'dhi1mmm7k',
    uploadPreset: 'ml_default',
    /** Optional. Not required for unsigned uploads. Never put apiSecret here. */
    apiKey: '',
  },
};
