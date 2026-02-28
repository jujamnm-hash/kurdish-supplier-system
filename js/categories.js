// ===========================
// AUTO-CATEGORIZATION ENGINE
// Kurdish (Sorani) Supplier System
// ===========================

const CATEGORIES = [
  {
    id: 'tech',
    name: 'تەکنەلۆژیا و ئەلیکترۆنیک',
    icon: '💻',
    color: '#6c63ff',
    keywords: [
      'موبایل', 'تەلەفۆن', 'لاپتۆپ', 'کۆمپیوتەر', 'تابلیت', 'ئایپاد', 'ئایفۆن',
      'سامسوڵگ', 'هواوی', 'شیاۆمی', 'ئەپڵ', 'ئاندرۆید', 'ئایئۆس',
      'هیدفۆن', 'سپیکەر', 'بلوتووس', 'wifi', 'وایفای', 'شارژەر',
      'کامیرا', 'تیلیڤیزیۆن', 'ستریم', 'گیمنگ', 'پلەیستەیشن', 'ئیکسبۆکس',
      'پرینتەر', 'ماوس', 'کیبۆرد', 'مۆنیتۆر', 'هارددیسک', 'فلاش',
      'باتری', 'پاوەربانک', 'کەیبڵ', 'ئیرفۆن', 'سمارتواچ', 'فیتنیس باند',
      'الكترونيك', 'جهاز', 'شاشة', 'هاتف',
      'phone', 'laptop', 'computer', 'tablet', 'camera', 'tv', 'headphone',
      'speaker', 'keyboard', 'mouse', 'monitor', 'battery', 'charger'
    ]
  },
  {
    id: 'fashion',
    name: 'جل و بەرگ و مۆدا',
    icon: '👔',
    color: '#ff6584',
    keywords: [
      'جل', 'بەرگ', 'کراس', 'پانتوڵ', 'دەس', 'پیژامە', 'تیشەرت',
      'کوراس', 'شاڵ', 'سووت', 'جاکێت', 'کۆت', 'کەپ', 'کلاو',
      'پێڵاو', 'چەترە', 'بۆت', 'سەندەڵ', 'کوانتە', 'بەڵتە',
      'ساعات', 'زنجیر', 'گوارە', 'ئەنگوستوانە', 'خووڵ', 'کاچ',
      'چانتە', 'باگ', 'کەیس', 'والێت', 'پارچە', 'خەیاتی',
      'مۆدا', 'فاشۆن', 'لیباس', 'ئایینە',
      'ملابس', 'قميص', 'بنطلون', 'حذاء', 'حقيبة',
      'shirt', 'pants', 'dress', 'shoes', 'bag', 'jacket', 'fashion', 'cloth'
    ]
  },
  {
    id: 'food',
    name: 'خواردن و خواردنەوە',
    icon: '🍽️',
    color: '#f7971e',
    keywords: [
      'خواردن', 'خواردنەوە', 'گۆشت', 'مریشک', 'ماسی', 'برنج', 'نان',
      'خواردنی خێرا', 'ریستۆران', 'کافی', 'چای', 'قاوە', 'شیر',
      'مێوە', 'سەوزە', 'شیرینی', 'کیک', 'سووشی', 'پیتزا', 'برگەر',
      'سەندویچ', 'سالاتە', 'شۆربا', 'دۆلمە', 'کباب', 'حلوا',
      'چۆکلێت', 'بیسکیت', 'چیپس', 'ئابشارە', 'شەربەت', 'شیرەی',
      'زەیتوون', 'بریانی', 'یوغورت', 'پەنیر', 'کەرە', 'رووغەن',
      'ئارد', 'شەکر', 'خوێ', 'بهارات', 'باریک', 'مارمەلاد',
      'طعام', 'اكل', 'شراب', 'قهوة', 'عصير',
      'food', 'drink', 'coffee', 'tea', 'juice', 'meal', 'restaurant'
    ]
  },
  {
    id: 'home',
    name: 'ماڵ و دەرەوە',
    icon: '🏠',
    color: '#43e97b',
    keywords: [
      'ماڵ', 'خانو', 'ئەوین', 'مێز', 'کورسی', 'بەد', 'دیوان',
      'کارپیت', 'فەرش', 'پەردە', 'ئایینە', 'لامپ', 'واتتیمان',
      'ماتبەخ', 'قازان', 'قاپ', 'قاشوخ', 'چەنگاڵ', 'چەتر',
      'سووپا', 'مەشروبخانە', 'باخچە', 'دارستان', 'گوڵ', 'تۆوە',
      'ماشینێ شۆشتن', 'فریژ', 'دەزگا', 'مایکرۆوەیڤ', 'ئۆڤن',
      'کولێر', 'بخاری', 'هاوڵتی', 'سووپا', 'ئاودان',
      'أثاث', 'منزل', 'مطبخ', 'غرفة', 'سرير',
      'home', 'furniture', 'kitchen', 'garden', 'house', 'sofa', 'chair', 'table'
    ]
  },
  {
    id: 'health',
    name: 'تەندروستی و جوانی',
    icon: '💊',
    color: '#38f9d7',
    keywords: [
      'تەندروستی', 'دەرمان', 'ئەڵو', 'دکتۆر', 'نەخۆشخانە', 'تیمارگە',
      'ڤیتامین', 'مەعدەن', 'پرۆتین', 'کریم', 'شامپو', 'صابوون',
      'جوانی', 'بروسکرین', 'مۆیستەرایزەر', 'ئایلینەر', 'ماسکارا',
      'رووژ', 'فاوندیشن', 'کۆنسیلەر', 'عەتر', 'دیئۆدۆرانت',
      'دیت', 'میکاپ', 'بیوتی', 'خەمەڵ', 'ناخوین ناخوین',
      'سپا', 'ماساژ', 'تێزژمێری', 'وەزنکەر', 'فارماسی',
      'دواء', 'صحة', 'جمال', 'عطر', 'كريم',
      'health', 'medicine', 'beauty', 'cream', 'vitamin', 'pharmacy', 'cosmetic'
    ]
  },
  {
    id: 'sports',
    name: 'وەرزش و یارییەکان',
    icon: '⚽',
    color: '#f7971e',
    keywords: [
      'وەرزش', 'تووپ', 'بازی', 'یاری', 'جیم', 'فیتنیس', 'یۆگا',
      'توپ', 'کەمەر', 'دەسک', 'سیکل', 'دووچەرخە', 'مەشق',
      'فووتبۆڵ', 'بەسکەتبۆڵ', 'والیبۆڵ', 'تەنیس', 'شناکردن',
      'کریکەت', 'گۆلف', 'بۆکس', 'کاراتە', 'کۆستیم وەرزش',
      'ئادیداس', 'نایک', 'پووما', 'رییبۆک', 'وەندەری',
      'رياضة', 'كرة', 'لعبة', 'جيم',
      'sports', 'fitness', 'gym', 'football', 'basketball', 'tennis', 'yoga', 'game'
    ]
  },
  {
    id: 'education',
    name: 'کتێب و ئامۆژگاری',
    icon: '📚',
    color: '#6c63ff',
    keywords: [
      'کتێب', 'نووسین', 'خوێندن', 'قوتابخانە', 'زانکۆ', 'قوتابی',
      'فێربوون', 'قەڵەم', 'کاغەز', 'دەفتەر', 'بەغبڵاق', 'سقاندن',
      'گۆڤار', 'رۆژنامە', 'کورس', 'کلاس', 'تیوتۆر', 'سیرتیفیکەت',
      'زمان', 'ریاضیات', 'لۆژیکی', 'دیکشنەری', 'ئینسایکلۆپیدیا',
      'كتاب', 'تعليم', 'مدرسة', 'جامعة', 'قلم',
      'book', 'education', 'school', 'university', 'course', 'learn', 'study'
    ]
  },
  {
    id: 'automotive',
    name: 'ئۆتۆمبێل و گواستنەوە',
    icon: '🚗',
    color: '#ff6584',
    keywords: [
      'ئۆتۆمبێل', 'ماشین', 'موتۆسیکلێت', 'بیسکلیت', 'لایی', 'تایەر',
      'مۆتەر', 'تریلەر', 'گواستنەوە', 'بانزین', 'زیت', 'برمکی',
      'کلاچ', 'فرامز', 'ئینجین', 'گیربەکس', 'باتری ماشین',
      'ئەکسسوار ماشین', 'شیشە باڵا', 'قاچی', 'چواری',
      'سيارة', 'موتوسيكل', 'تايرات', 'زيت',
      'car', 'vehicle', 'motorcycle', 'tire', 'engine', 'auto'
    ]
  }
];

// Auto-detect category from name + description
function autoDetectCategory(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  
  let bestCategory = 'general';
  let highestScore = 0;

  for (const cat of CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 3 : 1; // longer keywords = higher confidence
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCategory = cat.id;
    }
  }

  return bestCategory;
}

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || {
    id: 'general',
    name: 'گشتی',
    icon: '📦',
    color: '#8888aa'
  };
}

function getCategoryName(id) {
  return getCategoryById(id).name;
}

function getCategoryIcon(id) {
  return getCategoryById(id).icon;
}

function getCategoryColor(id) {
  return getCategoryById(id).color;
}

function getAllCategories() {
  return [
    { id: 'all', name: 'هەموو', icon: '🌟', color: '#6c63ff' },
    ...CATEGORIES,
    { id: 'general', name: 'گشتی', icon: '📦', color: '#8888aa' }
  ];
}

// Export for module usage
if (typeof module !== 'undefined') {
  module.exports = {
    CATEGORIES,
    autoDetectCategory,
    getCategoryById,
    getCategoryName,
    getCategoryIcon,
    getCategoryColor,
    getAllCategories
  };
}
