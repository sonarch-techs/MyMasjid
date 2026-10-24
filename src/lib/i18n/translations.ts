export type Language = 'en' | 'ur';

export interface TranslationSchema {
  appTitle: string;
  tagline: string;
  searchPlaceholder: string;
  prayerTimings: string;
  prayerTimingsDesc: string;
  masjidLocations: string;
  masjidLocationsDesc: string;
  easySearch: string;
  easySearchDesc: string;
  bilingual: string;
  bilingualDesc: string;
  azanTime: string;
  jamaatTime: string;
  prayers: {
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jumuah: string;
  };
  actions: {
    getDirections: string;
    share: string;
    saveChanges: string;
    useToday: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    appTitle: 'Masjid Timings Finder',
    tagline: 'Find nearby masjid timings and locations easily.',
    searchPlaceholder: 'Search masjid name or locality...',
    prayerTimings: 'Prayer Timings',
    prayerTimingsDesc: 'View Azan and Jamaat times',
    masjidLocations: 'Masjid Locations',
    masjidLocationsDesc: 'Find masjids near you',
    easySearch: 'Easy Search',
    easySearchDesc: 'Search by name or locality',
    bilingual: 'Bilingual',
    bilingualDesc: 'English and Urdu',
    azanTime: 'Azan Time',
    jamaatTime: 'Jamaat Time',
    prayers: {
      fajr: 'Fajr',
      zuhr: 'Zuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      jumuah: "Friday / Jumu'ah",
    },
    actions: {
      getDirections: 'Get Directions',
      share: 'Share',
      saveChanges: 'Save Changes',
      useToday: 'Use Today',
    },
  },
  ur: {
    appTitle: 'مسجد ٹائمنگز فائنڈر',
    tagline: 'قریب کے مساجد کے اوقات اور مقام آسانی سے تلاش کریں۔',
    searchPlaceholder: 'مسجد کا نام یا علاقہ تلاش کریں...',
    prayerTimings: 'نماز کے اوقات',
    prayerTimingsDesc: 'اذان اور جماعت کے اوقات دیکھیں',
    masjidLocations: 'مساجد کے مقامات',
    masjidLocationsDesc: 'اپنے قریب مساجد تلاش کریں',
    easySearch: 'آسان تلاش',
    easySearchDesc: 'نام یا مقام کے ذریعے تلاش کریں',
    bilingual: 'دو لسانی',
    bilingualDesc: 'انگریزی اور اردو',
    azanTime: 'اذان',
    jamaatTime: 'جماعت',
    prayers: {
      fajr: 'فجر',
      zuhr: 'ظہر',
      asr: 'عصر',
      maghrib: 'مغرب',
      isha: 'عشاء',
      jumuah: 'جمعہ',
    },
    actions: {
      getDirections: 'راستہ دیکھیں',
      share: 'شیئر کریں',
      saveChanges: 'تبدیلیاں محفوظ کریں',
      useToday: 'آج کی تاریخ',
    },
  },
};