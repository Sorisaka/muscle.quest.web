// ローカル開発時は dist/config.js として複製し、値を設定してください。
// 実際の Supabase キーはソース管理に含めず、CI で本番値を注入してください。
window.__APP_CONFIG__ = {
  SUPABASE_URL: 'https://your-supabase-project.supabase.co',
  SUPABASE_ANON_KEY: '',
  OAUTH_REDIRECT_TO: '',
};
