/**
 * UI chrome for blog pages.
 *
 * Strong-tier languages have short strings written for this site. Weak-tier
 * languages fall back to English chrome, with an English machine-assisted
 * note, because those strings are not confident. The page language and
 * direction still come from the registry.
 */
import { scheduledLanguages } from './i18n-languages.mjs';

const ENGLISH = {
  eyebrow: 'English template',
  published: 'Published',
  readTime: 'Read Time',
  minute: 'min',
  language: 'Language',
  linksHeading: 'Topic-matched links',
  linksNote:
    "Shown because the site matches this brief's topic. The pipeline does not verify that the page supports the text.",
  citationsHeading: 'Citations',
  citationsNote:
    'Registry links for this brief are not shown. They were not matched to this topic, and this page does not add replacement sources.',
  browse: 'Browse all briefs',
  footer: 'English templates by Great Indian Company. Citations appear only when a link matches the brief topic.',
  machineNote: '',
  englishOriginal: 'Read the English original',
  languagesLabel: 'Languages',
  home: 'Home',
  allBriefs: 'All Briefs',
  sitemap: 'Sitemap',
  researchDesk: 'Research Desk',
};

const ENGLISH_TRANSLATION = {
  ...ENGLISH,
  eyebrow: 'Machine-assisted translation',
  footer:
    'Machine-assisted translation by Great Indian Company. Citations appear only when a link matches the brief topic.',
  machineNote: 'This is a machine-assisted translation.',
  englishOriginal: 'Read the English original',
};

const LOCALIZED = {
  hi: {
    eyebrow: 'हिन्दी अनुवाद',
    published: 'प्रकाशन',
    readTime: 'पढ़ने का समय',
    minute: 'मिनट',
    language: 'भाषा',
    linksHeading: 'विषय से मेल खाते लिंक',
    linksNote:
      'ये लिंक इसलिए दिखाए गए हैं क्योंकि साइट इस ब्रीफ के विषय से इन्हें मिलाती है। पाइपलाइन यह जाँच नहीं करती कि पन्ना पाठ का समर्थन करता है।',
    citationsHeading: 'उद्धरण',
    citationsNote:
      'इस ब्रीफ के रजिस्ट्री लिंक नहीं दिखाए गए। वे इस विषय से मेल नहीं खाते, और यह पन्ना उनकी जगह नया स्रोत नहीं जोड़ता।',
    browse: 'सभी ब्रीफ देखें',
    footer: 'ग्रेट इंडियन कंपनी का हिन्दी अनुवाद। लिंक तभी दिखता है जब वह ब्रीफ के विषय से मेल खाता है।',
    machineNote: 'यह मशीनी सहायता से तैयार अनुवाद है।',
    englishOriginal: 'अंग्रेज़ी मूल पढ़ें',
    languagesLabel: 'भाषाएँ',
    home: 'होम',
    allBriefs: 'सभी ब्रीफ',
    sitemap: 'साइटमैप',
    researchDesk: 'रिसर्च डेस्क',
  },
  bn: {
    eyebrow: 'বাংলা অনুবাদ',
    published: 'প্রকাশ',
    readTime: 'পড়ার সময়',
    minute: 'মিনিট',
    language: 'ভাষা',
    linksHeading: 'বিষয়ের সঙ্গে মিলে যাওয়া লিঙ্ক',
    linksNote:
      'এই লিঙ্কগুলো দেখানো হয়েছে কারণ সাইট এগুলোকে এই ব্রিফের বিষয়ের সঙ্গে মিলিয়েছে। পাতাটি লেখাটিকে সমর্থন করে কি না, তা এই সাইট যাচাই করে না।',
    citationsHeading: 'উদ্ধৃতি',
    citationsNote:
      'এই ব্রিফের রেজিস্ট্রি লিঙ্ক দেখানো হয়নি। সেগুলো এই বিষয়ের সঙ্গে মেলেনি, এবং এই পাতা তার বদলে নতুন উৎস যোগ করে না।',
    browse: 'সব ব্রিফ দেখুন',
    footer: 'গ্রেট ইন্ডিয়ান কোম্পানির বাংলা অনুবাদ। লিঙ্ক তখনই দেখা যায় যখন সেটি ব্রিফের বিষয়ের সঙ্গে মেলে।',
    machineNote: 'এটি যন্ত্রের সাহায্যে তৈরি অনুবাদ।',
    englishOriginal: 'ইংরেজি মূল পড়ুন',
    languagesLabel: 'ভাষা',
    home: 'হোম',
    allBriefs: 'সব ব্রিফ',
    sitemap: 'সাইটম্যাপ',
    researchDesk: 'রিসার্চ ডেস্ক',
  },
  ta: {
    eyebrow: 'தமிழ் மொழிபெயர்ப்பு',
    published: 'வெளியீடு',
    readTime: 'படிக்கும் நேரம்',
    minute: 'நிமிடம்',
    language: 'மொழி',
    linksHeading: 'தலைப்புடன் பொருந்தும் இணைப்புகள்',
    linksNote:
      'இந்த இணைப்புகள் இந்த சுருக்கத்தின் தலைப்புடன் பொருந்துவதால் காட்டப்படுகின்றன. பக்கம் உரையை உறுதிப்படுத்துகிறதா என்பதை இந்த தளம் சரிபார்க்காது.',
    citationsHeading: 'மேற்கோள்கள்',
    citationsNote:
      'இந்த சுருக்கத்தின் பதிவேட்டு இணைப்புகள் காட்டப்படவில்லை. அவை இந்த தலைப்புடன் பொருந்தவில்லை, இந்தப் பக்கம் அவற்றுக்குப் பதிலாக புதிய மூலத்தைச் சேர்க்காது.',
    browse: 'அனைத்து சுருக்கங்களையும் காண்க',
    footer:
      'கிரேட் இந்தியன் கம்பெனியின் தமிழ் மொழிபெயர்ப்பு. இணைப்பு சுருக்கத்தின் தலைப்புடன் பொருந்தும்போது மட்டுமே காட்டப்படும்.',
    machineNote: 'இது இயந்திர உதவியுடன் தயாரிக்கப்பட்ட மொழிபெயர்ப்பு.',
    englishOriginal: 'ஆங்கில மூலத்தைப் படிக்கவும்',
    languagesLabel: 'மொழிகள்',
    home: 'முகப்பு',
    allBriefs: 'அனைத்து சுருக்கங்கள்',
    sitemap: 'தள வரைபடம்',
    researchDesk: 'ஆராய்ச்சி மேசை',
  },
  te: {
    eyebrow: 'తెలుగు అనువాదం',
    published: 'ప్రచురణ',
    readTime: 'చదివే సమయం',
    minute: 'నిమిషం',
    language: 'భాష',
    linksHeading: 'అంశానికి సరిపోయే లింకులు',
    linksNote:
      'ఈ లింకులు ఈ బ్రీఫ్ అంశానికి సరిపోతాయని సైటు గుర్తించినందున చూపబడ్డాయి. పేజీ వచనాన్ని సమర్థిస్తుందో లేదో ఈ సైటు పరిశీలించదు.',
    citationsHeading: 'ఉల్లేఖనాలు',
    citationsNote:
      'ఈ బ్రీఫ్ రిజిస్ట్రీ లింకులు చూపబడలేదు. అవి ఈ అంశానికి సరిపోలేదు, ఈ పేజీ వాటి స్థానంలో కొత్త మూలాన్ని చేర్చదు.',
    browse: 'అన్ని బ్రీఫ్‌లు చూడండి',
    footer: 'గ్రేట్ ఇండియన్ కంపెనీ తెలుగు అనువాదం. లింకు బ్రీఫ్ అంశానికి సరిపోతేనే చూపబడుతుంది.',
    machineNote: 'ఇది యంత్ర సహాయంతో తయారు చేసిన అనువాదం.',
    englishOriginal: 'ఆంగ్ల మూలం చదవండి',
    languagesLabel: 'భాషలు',
    home: 'హోమ్',
    allBriefs: 'అన్ని బ్రీఫ్‌లు',
    sitemap: 'సైట్‌మ్యాప్',
    researchDesk: 'రిసర్చ్ డెస్క్',
  },
  mr: {
    eyebrow: 'मराठी अनुवाद',
    published: 'प्रकाशन',
    readTime: 'वाचण्याचा वेळ',
    minute: 'मिनिट',
    language: 'भाषा',
    linksHeading: 'विषय जुळणारे दुवे',
    linksNote:
      'हे दुवे दाखवले आहेत कारण साइट त्यांना या ब्रीफच्या विषयाशी जुळवते. पान मजकुराचे समर्थन करते का हे ही साइट तपासत नाही.',
    citationsHeading: 'उद्धरणे',
    citationsNote:
      'या ब्रीफचे रजिस्ट्री दुवे दाखवले नाहीत. ते या विषयाशी जुळले नाहीत, आणि हे पान त्यांच्या जागी नवीन स्रोत जोडत नाही.',
    browse: 'सर्व ब्रीफ पहा',
    footer: 'ग्रेट इंडियन कंपनीचा मराठी अनुवाद. दुवा तेव्हाच दिसतो जेव्हा तो ब्रीफच्या विषयाशी जुळतो.',
    machineNote: 'हा यंत्रसहाय्यित अनुवाद आहे.',
    englishOriginal: 'इंग्रजी मूळ वाचा',
    languagesLabel: 'भाषा',
    home: 'होम',
    allBriefs: 'सर्व ब्रीफ',
    sitemap: 'साइटमॅप',
    researchDesk: 'रिसर्च डेस्क',
  },
  ur: {
    eyebrow: 'اردو ترجمہ',
    published: 'اشاعت',
    readTime: 'پڑھنے کا وقت',
    minute: 'منٹ',
    language: 'زبان',
    linksHeading: 'موضوع سے ملتے لنک',
    linksNote:
      'یہ لنک اس لیے دکھائے گئے ہیں کہ سائٹ انہیں اس بریف کے موضوع سے ملاتی ہے۔ یہ سائٹ یہ نہیں جانچتی کہ صفحہ متن کی تصدیق کرتا ہے۔',
    citationsHeading: 'حوالے',
    citationsNote:
      'اس بریف کے رجسٹری لنک نہیں دکھائے۔ وہ اس موضوع سے نہیں ملتے، اور یہ صفحہ ان کی جگہ نیا ماخذ نہیں جوڑتا۔',
    browse: 'تمام بریف دیکھیں',
    footer: 'گریٹ انڈین کمپنی کا اردو ترجمہ۔ لنک تبھی دکھتا ہے جب وہ بریف کے موضوع سے ملے۔',
    machineNote: 'یہ مشینی مدد سے تیار کیا گیا ترجمہ ہے۔',
    englishOriginal: 'انگریزی اصل پڑھیں',
    languagesLabel: 'زبانیں',
    home: 'ہوم',
    allBriefs: 'تمام بریف',
    sitemap: 'سائٹ میپ',
    researchDesk: 'ریسرچ ڈیسک',
  },
  gu: {
    eyebrow: 'ગુજરાતી અનુવાદ',
    published: 'પ્રકાશન',
    readTime: 'વાંચવાનો સમય',
    minute: 'મિનિટ',
    language: 'ભાષા',
    linksHeading: 'વિષય સાથે મેળ ખાતી લિંક',
    linksNote:
      'આ લિંક એટલા માટે બતાવી છે કે સાઇટ તેમને આ બ્રીફના વિષય સાથે મેળવે છે. પેજ લખાણને ટેકો આપે છે કે નહીં તે આ સાઇટ તપાસતી નથી.',
    citationsHeading: 'ઉલ્લેખો',
    citationsNote:
      'આ બ્રીફની રજિસ્ટ્રી લિંક બતાવી નથી. તે આ વિષય સાથે મળી નથી, અને આ પેજ તેમની જગ્યાએ નવો સ્રોત ઉમેરતું નથી.',
    browse: 'બધા બ્રીફ જુઓ',
    footer: 'ગ્રેટ ઇન્ડિયન કંપનીનો ગુજરાતી અનુવાદ. લિંક ત્યારે જ દેખાય છે જ્યારે તે બ્રીફના વિષય સાથે મેળ ખાય.',
    machineNote: 'આ યંત્રસહાયિત અનુવાદ છે.',
    englishOriginal: 'અંગ્રેજી મૂળ વાંચો',
    languagesLabel: 'ભાષાઓ',
    home: 'હોમ',
    allBriefs: 'બધા બ્રીફ',
    sitemap: 'સાઇટમેપ',
    researchDesk: 'રિસર્ચ ડેસ્ક',
  },
  kn: {
    eyebrow: 'ಕನ್ನಡ ಅನುವಾದ',
    published: 'ಪ್ರಕಟಣೆ',
    readTime: 'ಓದುವ ಸಮಯ',
    minute: 'ನಿಮಿಷ',
    language: 'ಭಾಷೆ',
    linksHeading: 'ವಿಷಯಕ್ಕೆ ಹೊಂದುವ ಕೊಂಡಿಗಳು',
    linksNote:
      'ಈ ಕೊಂಡಿಗಳನ್ನು ತೋರಿಸಲಾಗಿದೆ ಏಕೆಂದರೆ ಸೈಟ್ ಅವುಗಳನ್ನು ಈ ಬ್ರೀಫ್‌ನ ವಿಷಯಕ್ಕೆ ಹೊಂದಿಸುತ್ತದೆ. ಪುಟವು ಪಠ್ಯವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆಯೇ ಎಂದು ಈ ಸೈಟ್ ಪರಿಶೀಲಿಸುವುದಿಲ್ಲ.',
    citationsHeading: 'ಉಲ್ಲೇಖಗಳು',
    citationsNote:
      'ಈ ಬ್ರೀಫ್‌ನ ರಿಜಿಸ್ಟ್ರಿ ಕೊಂಡಿಗಳನ್ನು ತೋರಿಸಲಿಲ್ಲ. ಅವು ಈ ವಿಷಯಕ್ಕೆ ಹೊಂದಲಿಲ್ಲ, ಮತ್ತು ಈ ಪುಟ ಅವುಗಳ ಬದಲು ಹೊಸ ಮೂಲವನ್ನು ಸೇರಿಸುವುದಿಲ್ಲ.',
    browse: 'ಎಲ್ಲಾ ಬ್ರೀಫ್‌ಗಳನ್ನು ನೋಡಿ',
    footer: 'ಗ್ರೇಟ್ ಇಂಡಿಯನ್ ಕಂಪನಿಯ ಕನ್ನಡ ಅನುವಾದ. ಕೊಂಡಿ ಬ್ರೀಫ್‌ನ ವಿಷಯಕ್ಕೆ ಹೊಂದಿದಾಗ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ.',
    machineNote: 'ಇದು ಯಂತ್ರಸಹಾಯಿತ ಅನುವಾದ.',
    englishOriginal: 'ಇಂಗ್ಲಿಷ್ ಮೂಲವನ್ನು ಓದಿ',
    languagesLabel: 'ಭಾಷೆಗಳು',
    home: 'ಮುಖಪುಟ',
    allBriefs: 'ಎಲ್ಲಾ ಬ್ರೀಫ್‌ಗಳು',
    sitemap: 'ಸೈಟ್‌ಮ್ಯಾಪ್',
    researchDesk: 'ಸಂಶೋಧನಾ ಮೇಜು',
  },
  ml: {
    eyebrow: 'മലയാളം വിവർത്തനം',
    published: 'പ്രസിദ്ധീകരണം',
    readTime: 'വായനാ സമയം',
    minute: 'മിനിറ്റ്',
    language: 'ഭാഷ',
    linksHeading: 'വിഷയവുമായി ചേരുന്ന കണ്ണികൾ',
    linksNote:
      'ഈ കണ്ണികൾ ഈ ബ്രീഫിന്റെ വിഷയവുമായി ചേരുന്നതിനാലാണ് കാണിക്കുന്നത്. പേജ് വാചകത്തെ പിന്തുണയ്ക്കുന്നുണ്ടോ എന്ന് ഈ സൈറ്റ് പരിശോധിക്കുന്നില്ല.',
    citationsHeading: 'ഉദ്ധരണികൾ',
    citationsNote:
      'ഈ ബ്രീഫിന്റെ രജിസ്ട്രി കണ്ണികൾ കാണിച്ചിട്ടില്ല. അവ ഈ വിഷയവുമായി ചേർന്നില്ല, ഈ പേജ് അവയ്ക്ക് പകരം പുതിയ ഉറവിടം ചേർക്കുന്നില്ല.',
    browse: 'എല്ലാ ബ്രീഫുകളും കാണുക',
    footer: 'ഗ്രേറ്റ് ഇന്ത്യൻ കമ്പനിയുടെ മലയാളം വിവർത്തനം. കണ്ണി ബ്രീഫിന്റെ വിഷയവുമായി ചേരുമ്പോൾ മാത്രമേ കാണിക്കൂ.',
    machineNote: 'ഇത് യന്ത്രസഹായത്തോടെയുള്ള വിവർത്തനമാണ്.',
    englishOriginal: 'ഇംഗ്ലീഷ് മൂലം വായിക്കുക',
    languagesLabel: 'ഭാഷകൾ',
    home: 'ഹോം',
    allBriefs: 'എല്ലാ ബ്രീഫുകളും',
    sitemap: 'സൈറ്റ്മാപ്പ്',
    researchDesk: 'റിസർച്ച് ഡെസ്ക്',
  },
  pa: {
    eyebrow: 'ਪੰਜਾਬੀ ਅਨੁਵਾਦ',
    published: 'ਪ੍ਰਕਾਸ਼ਨ',
    readTime: 'ਪੜ੍ਹਨ ਦਾ ਸਮਾਂ',
    minute: 'ਮਿੰਟ',
    language: 'ਭਾਸ਼ਾ',
    linksHeading: 'ਵਿਸ਼ੇ ਨਾਲ ਮਿਲਦੇ ਲਿੰਕ',
    linksNote:
      'ਇਹ ਲਿੰਕ ਇਸ ਲਈ ਦਿਖਾਏ ਗਏ ਹਨ ਕਿਉਂਕਿ ਸਾਈਟ ਇਨ੍ਹਾਂ ਨੂੰ ਇਸ ਬ੍ਰੀਫ਼ ਦੇ ਵਿਸ਼ੇ ਨਾਲ ਮਿਲਾਉਂਦੀ ਹੈ। ਇਹ ਸਾਈਟ ਇਹ ਨਹੀਂ ਜਾਂਚਦੀ ਕਿ ਸਫ਼ਾ ਲਿਖਤ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦਾ ਹੈ।',
    citationsHeading: 'ਹਵਾਲੇ',
    citationsNote:
      'ਇਸ ਬ੍ਰੀਫ਼ ਦੇ ਰਜਿਸਟਰੀ ਲਿੰਕ ਨਹੀਂ ਦਿਖਾਏ ਗਏ। ਉਹ ਇਸ ਵਿਸ਼ੇ ਨਾਲ ਨਹੀਂ ਮਿਲੇ, ਅਤੇ ਇਹ ਸਫ਼ਾ ਉਨ੍ਹਾਂ ਦੀ ਥਾਂ ਨਵਾਂ ਸਰੋਤ ਨਹੀਂ ਜੋੜਦਾ।',
    browse: 'ਸਾਰੇ ਬ੍ਰੀਫ਼ ਵੇਖੋ',
    footer: 'ਗ੍ਰੇਟ ਇੰਡੀਅਨ ਕੰਪਨੀ ਦਾ ਪੰਜਾਬੀ ਅਨੁਵਾਦ। ਲਿੰਕ ਉਦੋਂ ਹੀ ਦਿਖਦਾ ਹੈ ਜਦੋਂ ਉਹ ਬ੍ਰੀਫ਼ ਦੇ ਵਿਸ਼ੇ ਨਾਲ ਮਿਲੇ।',
    machineNote: 'ਇਹ ਮਸ਼ੀਨ ਦੀ ਸਹਾਇਤਾ ਨਾਲ ਤਿਆਰ ਕੀਤਾ ਅਨੁਵਾਦ ਹੈ।',
    englishOriginal: 'ਅੰਗਰੇਜ਼ੀ ਮੂਲ ਪੜ੍ਹੋ',
    languagesLabel: 'ਭਾਸ਼ਾਵਾਂ',
    home: 'ਹੋਮ',
    allBriefs: 'ਸਾਰੇ ਬ੍ਰੀਫ਼',
    sitemap: 'ਸਾਈਟਮੈਪ',
    researchDesk: 'ਰਿਸਰਚ ਡੈਸਕ',
  },
  or: {
    eyebrow: 'ଓଡ଼ିଆ ଅନୁବାଦ',
    published: 'ପ୍ରକାଶନ',
    readTime: 'ପଢ଼ିବା ସମୟ',
    minute: 'ମିନିଟ',
    language: 'ଭାଷା',
    linksHeading: 'ବିଷୟ ସହ ମିଳୁଥିବା ଲିଙ୍କ',
    linksNote:
      'ଏହି ଲିଙ୍କଗୁଡ଼ିକ ଦେଖାଯାଉଛି କାରଣ ସାଇଟ୍ ସେଗୁଡ଼ିକୁ ଏହି ବ୍ରିଫର ବିଷୟ ସହ ମିଳାଏ। ପୃଷ୍ଠା ଲେଖାକୁ ସମର୍ଥନ କରେ କି ନାହିଁ ଏହି ସାଇଟ୍ ଯାଞ୍ଚ କରେ ନାହିଁ।',
    citationsHeading: 'ଉଦ୍ଧୃତି',
    citationsNote:
      'ଏହି ବ୍ରିଫର ରେଜିଷ୍ଟ୍ରି ଲିଙ୍କ ଦେଖାଯାଇ ନାହିଁ। ସେଗୁଡ଼ିକ ଏହି ବିଷୟ ସହ ମିଳି ନାହିଁ, ଏବଂ ଏହି ପୃଷ୍ଠା ସେଗୁଡ଼ିକ ବଦଳରେ ନୂଆ ଉତ୍ସ ଯୋଡ଼େ ନାହିଁ।',
    browse: 'ସମସ୍ତ ବ୍ରିଫ ଦେଖନ୍ତୁ',
    footer: 'ଗ୍ରେଟ୍ ଇଣ୍ଡିଆନ୍ କମ୍ପାନୀର ଓଡ଼ିଆ ଅନୁବାଦ। ଲିଙ୍କ କେବଳ ସେତେବେଳେ ଦେଖାଯାଏ ଯେତେବେଳେ ତାହା ବ୍ରିଫର ବିଷୟ ସହ ମିଳେ।',
    machineNote: 'ଏହା ଯନ୍ତ୍ର-ସହାୟିତ ଅନୁବାଦ।',
    englishOriginal: 'ଇଂରାଜୀ ମୂଳ ପଢ଼ନ୍ତୁ',
    languagesLabel: 'ଭାଷା',
    home: 'ହୋମ୍',
    allBriefs: 'ସମସ୍ତ ବ୍ରିଫ',
    sitemap: 'ସାଇଟମ୍ୟାପ୍',
    researchDesk: 'ରିସର୍ଚ୍ଚ ଡେସ୍କ',
  },
  as: {
    eyebrow: 'অসমীয়া অনুবাদ',
    published: 'প্ৰকাশ',
    readTime: 'পঢ়াৰ সময়',
    minute: 'মিনিট',
    language: 'ভাষা',
    linksHeading: 'বিষয়ৰ সৈতে মিলা লিংক',
    linksNote:
      'এই লিংকবোৰ দেখুওৱা হৈছে কাৰণ ছাইটে সেইবোৰক এই ব্ৰিফৰ বিষয়ৰ সৈতে মিলায়। পৃষ্ঠাই পাঠ সমৰ্থন কৰে নে নাই এই ছাইটে পৰীক্ষা নকৰে।',
    citationsHeading: 'উদ্ধৃতি',
    citationsNote:
      'এই ব্ৰিফৰ ৰেজিষ্ট্ৰি লিংক দেখুওৱা হোৱা নাই। সেইবোৰ এই বিষয়ৰ সৈতে মিলা নাই, আৰু এই পৃষ্ঠাই তাৰ সলনি নতুন উৎস যোগ নকৰে।',
    browse: 'সকলো ব্ৰিফ চাওক',
    footer: 'গ্ৰেট ইণ্ডিয়ান কোম্পানীৰ অসমীয়া অনুবাদ। লিংক তেতিয়াহে দেখা যায় যেতিয়া সি ব্ৰিফৰ বিষয়ৰ সৈতে মিলে।',
    machineNote: 'এইটো যন্ত্ৰ-সহায়ক অনুবাদ।',
    englishOriginal: 'ইংৰাজী মূল পঢ়ক',
    languagesLabel: 'ভাষা',
    home: 'হোম',
    allBriefs: 'সকলো ব্ৰিফ',
    sitemap: 'ছাইটমেপ',
    researchDesk: 'ৰিচাৰ্চ ডেস্ক',
  },
  ne: {
    eyebrow: 'नेपाली अनुवाद',
    published: 'प्रकाशन',
    readTime: 'पढ्ने समय',
    minute: 'मिनेट',
    language: 'भाषा',
    linksHeading: 'विषयसँग मिल्ने लिंक',
    linksNote:
      'यी लिंक देखाइएका छन् किनकि साइटले तिनीहरूलाई यो ब्रिफको विषयसँग मिलाउँछ। पृष्ठले पाठलाई समर्थन गर्छ कि गर्दैन यो साइटले जाँच्दैन।',
    citationsHeading: 'उद्धरण',
    citationsNote:
      'यो ब्रिफका रजिस्ट्री लिंक देखाइएका छैनन्। ती यो विषयसँग मिलेनन्, र यो पृष्ठले तिनको सट्टा नयाँ स्रोत थप्दैन।',
    browse: 'सबै ब्रिफ हेर्नुहोस्',
    footer: 'ग्रेट इन्डियन कम्पनीको नेपाली अनुवाद। लिंक तब मात्र देखिन्छ जब त्यो ब्रिफको विषयसँग मिल्छ।',
    machineNote: 'यो यन्त्र-सहायता प्राप्त अनुवाद हो।',
    englishOriginal: 'अङ्ग्रेजी मूल पढ्नुहोस्',
    languagesLabel: 'भाषाहरू',
    home: 'होम',
    allBriefs: 'सबै ब्रिफ',
    sitemap: 'साइटम्याप',
    researchDesk: 'रिसर्च डेस्क',
  },
};

export function chromeFor(code) {
  if (code === 'en') {
    return { ...ENGLISH, code: 'en', fallback: false };
  }

  const localized = LOCALIZED[code];
  if (!localized) {
    return { ...ENGLISH_TRANSLATION, code, fallback: true };
  }

  return { ...localized, code, fallback: false };
}

export function englishChromeFallbackCodes() {
  return scheduledLanguages()
    .filter((language) => chromeFor(language.code).fallback)
    .map((language) => language.code);
}
