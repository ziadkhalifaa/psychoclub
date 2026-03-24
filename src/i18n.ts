import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      nav: {
        courses: 'الدورات',
        articles: 'المقالات',
        about: 'من نحن',
        sessions: 'حجز جلسة',
        tools: 'الأدوات',
        community: 'المجتمع',
        login: 'دخول',
        join: 'انضم إلينا',
        profile: 'الملف الشخصي',
        admin: 'لوحة الإدارة',
        doctor: 'لوحة الطبيب',
        logout: 'تسجيل الخروج'
      },
      footer: {
        description: 'بوابتك الشاملة للنمو الإكلينيكي والاستقرار النفسي. نقدم منظومة متكاملة تجمع بين التدريب التخصصي، الإرشاد المهني، والدعم العلاجي المتقدم لخدمة مجتمع الصحة النفسية العربي بكفاءة عالمية.',
        explore: 'استكشاف المنصة',
        academy: 'الأكاديمية التدريبية',
        journal: 'المستودع العلمي',
        toolkit: 'الحقيبة الإكلينيكية',
        support: 'دعم الأعضاء',
        email: 'البريد الإلكتروني',
        office: 'المكتب الرئيسي',
        cairo: 'القاهرة، مدينة نصر',
        hotline: 'الخط الساخن',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الاستخدام',
        copyright: '© {{year}} Clinical Cases Group | Psycho-Club. رحلة مهنية متكاملة بلمسة إنسانية.'
      },
      common: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        retry: 'إعادة المحاولة',
        save: 'حفظ',
        cancel: 'إلغاء'
      },
      home: {
        hero: {
          slide1: {
            title: 'ريادة في التدريب الإكلينيكي النفسي',
            subtitle: 'انضم لأقوى منظومة تدريبية تجمع بين العلم والممارسة الإكلينيكية'
          },
          slide2: {
            title: 'دعم نفسي تخصصي',
            subtitle: 'نخبة من أفضل الأطباء والأخصائيين النفسيين في خدمتك'
          },
          cta: 'ابدأ رحلتك الآن',
          secondaryCta: 'استكشاف الأكاديمية',
          slides: [
            {
              title: 'جلسات دعم وعلاج نفسي',
              description: 'احصل على دعم نفسي متخصص من نخبة الأخصائيين والمعالجين للتعامل مع مختلف التحديات النفسية في بيئة آمنة وخصوصية تامة.',
              ctaPrimary: 'احجز الآن',
              ctaSecondary: 'تعرف علينا',
              tag: 'دعم نفسي مستمر'
            },
            {
              title: 'ارتقِ بمهاراتك الإكلينيكية',
              description: 'Psycho-Club هو المنصة التعليمية والتدريبية الرائدة لتطوير مهارات الممارسين في مجال الصحة النفسية من خلال دورات متخصصة وأدوات تفاعلية.',
              ctaPrimary: 'استكشف الدورات',
              ctaSecondary: 'احجز جلستك الآن',
              tag: 'المنصة التعليمية الرائدة'
            },
            {
              title: 'أدوات ومقاييس تفاعلية',
              description: 'نوفر لك مجموعة متكاملة من الأدوات الإكلينيكية والمقاييس النفسية المعتمدة لدعم عملية التقييم والتشخيص بدقة.',
              ctaPrimary: 'استعرض الأدوات',
              ctaSecondary: 'المكتبة العلمية',
              tag: 'ابتكار في الممارسة'
            },
            {
              title: 'الإشراف الإكلينيكي المتخصص',
              description: 'احجز جلسة إشراف مهني متخصصة مع مصطفى صالح لتطوير ممارستك الإكلينيكية والحصول على التوجيه المهني اللازم.',
              ctaPrimary: 'احجز جلسة إشراف',
              ctaSecondary: 'عن الخدمة',
              tag: 'تطوير مهني متخصص'
            }
          ]
        },
        stats: {
          students: 'متدرب نشط',
          courses: 'برنامج تدريبي',
          experts: 'خبير إكلينيكي',
          sessions: 'جلسة ناجحة'
        },
        features: {
          title: 'لماذا تختار Psycho-Club؟',
          subtitle: 'نحن لا نقدم مجرد دورات، بل نصنع مساراً مهنياً متكاملاً'
        },
        aboutShort: {
          title: 'عن Clinical Cases Group',
          subtitle: 'نحن نؤمن بأن الصحة النفسية هي رحلة مستمرة من التعلم والدعم. نسعى لتقديم خدمات تخصصية تجمع بين التدريب المتقدم، الإرشاد المهني، والجلسات العلاجية.',
          item1: 'تدريب عملي مبني على الأدلة',
          item2: 'دعم وعلاج نفسي متخصص',
          item3: 'أدوات ومقاييس نفسية معتمدة',
          item4: 'مجتمع مهني داعم',
          more: 'اقرأ المزيد عنا'
        },
        vision: {
          badge: 'رؤيتنا المهنية',
          title: 'الريادة مع Psycho-Club في الإرشاد والعلاج',
          description: 'في Clinical Cases Group | Psycho-Club، ندرك أن المختص النفسي يحتاج لمزيج من المعرفة والإرشاد المستمر. نحن لسنا مجرد منصة تعليمية، بل نحن مظلة مهنية وعلاجية ترافقك في كل خطوة.',
          feature1: 'جلسات علاجية تخصصية',
          feature2: 'مواد حصرية ومقاييس',
          feature3: 'اعتماد مهني دولي',
          feature4: 'دعم فني وتقني مستمر',
          cta: 'تعرف على الفريق'
        },
        articles: {
          title: 'آخر المقالات العلمية',
          subtitle: 'اكتشف أحدث الأبحاث والدراسات في مجال الصحة النفسية بأقلام خبراء Psycho-Club.',
          more: 'استكشاف المستودع العلمي'
        }
      },
      articles: {
        hero: {
          badge: 'المستودع العلمي',
          title: 'المقالات والأبحاث',
          subtitle: 'مكتبة متجددة من المعرفة الإكلينيكية، تضم أبحاثاً مترجمة ومقالات أصلية لنخبة من المتخصصين.'
        },
        filters: {
          search: 'البحث السريع',
          placeholder: 'ماذا تريد أن تقرأ اليوم؟',
          categories: 'الأقسام العلمية',
          all: 'الكل'
        },
        card: {
          readMore: 'اقرأ المقال كاملاً',
          author: 'الإدارة'
        }
      },
      about: {
        hero: {
          badge: 'من نحن',
          title: 'رواد الرعاية المتخصصة.. من الصحة النفسية إلى التميز المهني',
          description: 'تأسست Clinical Cases Group | Psycho-Club لتكون صرحاً يجمع بين العلم والرحمة. نحن نؤمن أن جودة الرعاية تبدأ من كفاءة المعالج.'
        },
        stats: {
          title: 'أثرنا في أرقام',
          subtitle: 'بناء مجتمع قائم على العلم، الإرشاد، والرحمة',
          graduates: 'خريج متدرب',
          courses: 'دورة تدريبية',
          experience: 'سنة خبرة',
          lecturers: 'محاضر خبير'
        },
        values: {
          scientific: {
            title: 'الأمانة العلمية',
            desc: 'نلتزم بتقديم محتوى علمي رصين ومبني على أحدث الأدلة والبراهين.'
          },
          practical: {
            title: 'التطبيق العملي',
            desc: 'تركيزنا الأساسي هو سد الفجوة بين النظرية والممارسة.'
          },
          community: {
            title: 'المجتمع المهني',
            desc: 'نسعى لبناء بيئة داعمة تجمع المختصين لتبادل الخبرات.'
          }
        },
        founder: {
          title: 'رسالة من الإدارة',
          message: '"في Clinical Cases Group | Psycho-Club، هدفنا هو تجاوز حدود التدريب التقليدي لنصنع مجتمعاً علاجياً متكاتفاً. نؤمن أن جودة الرعاية النفسية تبدأ من التوازن بين المعرفة العلمية الرصينة وفن الإرشاد الإنساني."',
          name: 'مصطفى صالح',
          role: 'المدير التنفيذي والمؤسس'
        },
        cta: {
          title: 'جاهز لبدء رحلتك المهنية؟',
          subtitle: 'انضم إلى مجتمعنا اليوم واكتشف عالمًا جديدًا من الفرص التعليمية.',
          register: 'انضم إلينا الآن',
          courses: 'تصفح الدورات'
        }
      },
      courses: {
        hero: {
          badge: 'التميز الأكاديمي',
          title: 'الأكاديمية التدريبية',
          subtitle: 'استكشف مساراتنا التدريبية المتخصصة وحول ممارسة المهنة إلى فن إكلينيكي متقن.'
        },
        filters: {
          title: 'تصفية المحتوى',
          categories: 'التخصصات الإكلينيكية',
          levels: 'المستوى الدراسي',
          search: 'ابحث في الكورسات المتاحة...',
          total: 'إجمالي النتائج: {{count}} دورة',
          noResults: 'لا توجد نتائج مطابقة',
          reset: 'إعادة ضبط الفلاتر'
        },
        categories: {
          therapy: 'العلاج النفسي',
          addiction: 'علاج الإدمان',
          psychiatry: 'الطب النفسي',
          clinical: 'علم النفس الإكلينيكي'
        },
        levels: {
          beginner: 'مبتدئ',
          intermediate: 'متوسط',
          advanced: 'متقدم'
        },
        card: {
          instructor: 'المحاضر',
          view: 'عرض محتوى الدورة',
          currency: 'ج.م'
        }
      },
      sessions: {
        hero: {
          title: 'حجز جلسة علاجية',
          subtitle: 'احجز جلستك الآن مع نخبة من الأخصائيين النفسيين المعتمدين للحصول على الدعم النفسي والعلاج المتكامل في بيئة آمنة ومهنية.',
          loading: 'جاري تحميل قائمة الأخصائيين...'
        },
        card: {
          specialist: 'أخصائي',
          currency: 'ج.م / جلسة',
          bookNow: 'احجز الآن'
        },
        empty: 'لا يوجد أخصائيين متاحين حالياً'
      }
    }
  },
  en: {
    translation: {
      nav: {
        courses: 'Academy',
        articles: 'Journal',
        about: 'About Us',
        sessions: 'Book a Session',
        tools: 'Clinical Toolkit',
        community: 'Community',
        login: 'Login',
        join: 'Join Us',
        profile: 'Profile',
        admin: 'Admin Dashboard',
        doctor: 'Doctor Dashboard',
        logout: 'Logout'
      },
      footer: {
        description: 'Your comprehensive portal for clinical growth and mental stability. We provide an integrated ecosystem combining specialized training, professional guidance, and advanced therapeutic support to serve the Arab mental health community with global excellence.',
        explore: 'Explore Platform',
        academy: 'Training Academy',
        journal: 'Knowledge Hub',
        toolkit: 'Clinical Resources',
        support: 'Member Support',
        email: 'Email Support',
        office: 'Headquarters',
        cairo: 'Cairo, Nasr City',
        hotline: 'Hotline',
        privacy: 'Privacy Policy',
        terms: 'Terms of Use',
        copyright: '© {{year}} Clinical Cases Group | Psycho-Club. An integrated professional journey with a human touch.'
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel'
      },
      home: {
        hero: {
          slide1: {
            title: 'Excellence in Clinical Psychology Training',
            subtitle: 'Join the most robust training ecosystem bridging theory and clinical practice.'
          },
          slide2: {
            title: 'Specialized Mental Health Support',
            subtitle: 'A select elite of top-tier psychiatrists and clinical psychologists at your service.'
          },
          cta: 'Start Your Journey',
          secondaryCta: 'Explore Academy',
          slides: [
            {
              title: 'Mental Health Support & Therapy',
              description: 'Access specialized psychological support from elite specialists in a safe, confidential environment.',
              ctaPrimary: 'Book Now',
              ctaSecondary: 'About Us',
              tag: 'Ongoing Support'
            },
            {
              title: 'Elevate Your Clinical Practice',
              description: 'Psycho-Club is the premier ecosystem for mental health professionals to master new competencies through specialized training.',
              ctaPrimary: 'Explore Academy',
              ctaSecondary: 'Book a Session',
              tag: 'Leading Educational Hub'
            },
            {
              title: 'Interactive Clinical Resources',
              description: 'An integrated toolkit of certified clinical assessments to enhance your diagnostic and evaluation workflows.',
              ctaPrimary: 'Browse Toolkit',
              ctaSecondary: 'Journal',
              tag: 'Clinical Innovation'
            },
            {
              title: 'Advanced Clinical Supervision',
              description: 'Professional supervision sessions with Mustafa Saleh to refine your clinical practice and professional growth.',
              ctaPrimary: 'Book Supervision',
              ctaSecondary: 'Learn More',
              tag: 'Professional Excellence'
            }
          ]
        },
        stats: {
          students: 'Active Trainees',
          courses: 'Training Programs',
          experts: 'Clinical Experts',
          sessions: 'Successful Sessions'
        },
        features: {
          title: 'Why Choose Psycho-Club?',
          subtitle: 'We don\'t just offer courses; we craft a comprehensive professional career path.'
        },
        aboutShort: {
          title: 'About Clinical Cases Group',
          subtitle: 'We believe mental health is a continuous journey of learning and support. We provide specialized services combining advanced training, career guidance, and clinical therapy.',
          item1: 'Evidence-Based Practical Training',
          item2: 'Specialized Psychological Support',
          item3: 'Certified Clinical Assessment Tools',
          item4: 'Supportive Professional Community',
          more: 'Learn More About Us'
        },
        vision: {
          badge: 'Professional Vision',
          title: 'Leading the Way in Clinical Guidance & Therapy',
          description: 'At Clinical Cases Group | Psycho-Club, we understand that mental health professionals need a blend of knowledge and ongoing mentorship. We are more than just an educational platform; we are a professional umbrella supporting you at every step.',
          feature1: 'Specialized Therapy Sessions',
          feature2: 'Exclusive Tools & Assessments',
          feature3: 'International Professional Certification',
          feature4: 'Continuous Technical Support',
          cta: 'Meet Our Team'
        },
        articles: {
          title: 'Latest Scientific Articles',
          subtitle: 'Explore the latest research and studies in mental health by Psycho-Club experts.',
          more: 'Explore Knowledge Hub'
        }
      },
      articles: {
        hero: {
          badge: 'Scientific Repository',
          title: 'Articles & Research',
          subtitle: 'A renewing library of clinical knowledge, featuring translated research and original articles by top specialists.'
        },
        filters: {
          search: 'Quick Search',
          placeholder: 'What do you want to read today?',
          categories: 'Scientific Branches',
          all: 'All'
        },
        card: {
          readMore: 'Read Full Article',
          author: 'Administration'
        }
      },
      about: {
        hero: {
          badge: 'About Us',
          title: 'Pioneers in Specialized Care.. From Mental Health to Professional Excellence',
          description: 'Clinical Cases Group | Psycho-Club was established to be an institution bridging science and compassion. We believe quality care starts with the therapist\'s competence.'
        },
        stats: {
          title: 'Our Impact in Numbers',
          subtitle: 'Building a community based on science, guidance, and compassion.',
          graduates: 'Active Trainees',
          courses: 'Training Programs',
          experience: 'Years of Experience',
          lecturers: 'Expert Educators'
        },
        values: {
          scientific: {
            title: 'Scientific Integrity',
            desc: 'Committed to delivering robust, evidence-based clinical content.'
          },
          practical: {
            title: 'Clinical Application',
            desc: 'Bridge the gap between theoretical models and real-world practice.'
          },
          community: {
            title: 'Professional Hub',
            desc: 'Fostering a supportive environment for collective professional growth.'
          }
        },
        founder: {
          title: 'Message from Leadership',
          message: '"At Clinical Cases Group | Psycho-Club, we aim to transcend traditional training to build a cohesive therapeutic community. We believe quality mental health care arises from the balance of rigorous science and humanized guidance."',
          name: 'Mustafa Saleh',
          role: 'Executive Director & Founder'
        },
        cta: {
          title: 'Ready to Launch Your Career?',
          subtitle: 'Join our community today and discover a new world of professional horizons.',
          register: 'Join Now',
          courses: 'Browse Academy'
        }
      },
      courses: {
        hero: {
          badge: 'Academic Excellence',
          title: 'Training Academy',
          subtitle: 'Explore our specialized training paths and transform your practice into a clinical art.'
        },
        filters: {
          title: 'Filter Content',
          categories: 'Clinical Specialties',
          levels: 'Training Level',
          search: 'Search available courses...',
          total: 'Total Results: {{count}} Courses',
          noResults: 'No matches found',
          reset: 'Reset Filters'
        },
        categories: {
          therapy: 'Psychotherapy',
          addiction: 'Addiction Treatment',
          psychiatry: 'Psychiatry',
          clinical: 'Clinical Psychology'
        },
        levels: {
          beginner: 'Foundational',
          intermediate: 'Practitioner',
          advanced: 'Specialized'
        },
        card: {
          instructor: 'Instructor',
          view: 'View Course Syllabus',
          currency: 'EGP'
        }
      },
      sessions: {
        hero: {
          title: 'Book a Therapeutic Session',
          subtitle: 'Book your session now with elite certified psychologists for integrated psychological support and clinical care in a safe, professional environment.',
          loading: 'Loading specialist directory...'
        },
        card: {
          specialist: 'Specialist',
          currency: 'EGP / Session',
          bookNow: 'Book Now'
        },
        empty: 'No specialists currently available'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']
    }
  });

export default i18n;
