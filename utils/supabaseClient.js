// مطمئن شو که در HTML قبل از این فایل، این خط درج شده باشد:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>

// اطلاعات اتصال به پروژه Supabase شما:
const SUPABASE_URL = 'https://qspwsdjqjyogphzdnwfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...UCMNtrMBMIxefS5SAtTPU8br-97u60DJG1HJF2iRUms'; // کامل نگه داشته شده

// ساخت کلاینت Supabase از طریق window.supabase (نسخه CDN)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// قرار دادن در متغیر سراسری برای استفاده در سایر اسکریپت‌ها
window.supabaseClient = supabase;

// تابع تست اتصال (اختیاری، برای توسعه‌دهنده)
window.testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1);

    if (error) {
      console.error("❌ Supabase اتصال برقرار نشد:", error.message);
    } else {
      console.log("✅ اتصال موفق به Supabase", data);
    }
  } catch (err) {
    console.error("❌ خطای کلی:", err);
  }
};
