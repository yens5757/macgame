export const environment = {
  production: true,
  supabaseUrl: (process.env['NG_APP_SUPABASE_URL'] as string),
  supabaseKey: (process.env['NG_APP_SUPABASE_KEY'] as string),
  geminiApiKey: (process.env['NG_APP_GEMINI_API_KEY'] as string)
};