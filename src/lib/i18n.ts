export type Language = "en" | "hi" | "mr";

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "mr", label: "मराठी (Marathi)", flag: "🚩" },
];

export const TRANSLATIONS = {
  en: {
    // Navigation
    features: "Features",
    matrix: "4-Role Matrix",
    courses: "Courses",
    pricing: "Pricing",
    faq: "FAQ",
    signIn: "Sign In",
    getStarted: "Get Started",
    goToDashboard: "Go to Dashboard",
    
    // Hero
    shimmerBadge: "Next-Gen Enterprise Course & Lecture Management Suite",
    heroTitlePrefix: "Empowering ",
    heroTitleGradient: "Students, Faculty & Admissions",
    heroTitleSuffix: " in One 3D LMS.",
    heroSubtitle: "A production-ready platform with live Google Meet classrooms, strict calendar validity arithmetic, 8-step server-side access validation, and dedicated workflows for all 4 user roles.",
    instantSandbox: "1-Click Instant Demo Portals",
    interactiveSandbox: "Interactive Live Sandbox",
    student: "Student",
    faculty: "Faculty",
    executor: "Executor",
    admin: "Admin",
    studentSub: "Rahul Sharma",
    facultySub: "Dr. Ananya",
    executorSub: "Vikram Mehta",
    adminSub: "Siddharth Rao",

    // Stats
    stat1Label: "Calendar Validity",
    stat1Sub: "Exact Month Math",
    stat2Label: "Server Validation",
    stat2Sub: "Zero Leaks Access",
    stat3Label: "Role Portals",
    stat3Sub: "Tailored Dashboards",
    stat4Label: "Razorpay Ready",
    stat4Sub: "Decoupled Payments",

    // Features Section
    featuresBadge: "Enterprise Core Engine",
    featuresTitle: "Architected for Maximum Compliance & Zero Piracy",
    featuresSubtitle: "Built with bulletproof security rules, automated expiry cron handlers, and immutable audit logging.",
    feat1Title: "8-Step Server Validation",
    feat1Desc: "Every lecture stream check verifies JWT claims, enrollment state, payment status, and non-expired date thresholds.",
    feat2Title: "Calendar-Based Validity",
    feat2Desc: "Uses strict month arithmetic (start_date + duration_months) rather than fixed 30-day approximations.",
    feat3Title: "4 Tailored Role Portals",
    feat3Desc: "Custom isolated dashboards for Students, Faculty, Executors, and Admins with zero permission leaks.",
    feat4Title: "Live Google Meet Rooms",
    feat4Desc: "Direct integration with Google Meet for live interactive lectures and automated recording links.",
    feat5Title: "Payment Provider Abstraction",
    feat5Desc: "Decoupled payment gateway service supporting Razorpay webhooks and instant mock verification.",
    feat6Title: "Immutable Audit Logging",
    feat6Desc: "Append-only activity logs for all admin extensions, payment verifications, and manual overrides.",

    // 4-Role Matrix Section
    matrixBadge: "Complete Role Matrix",
    matrixTitle: "Dedicated Portals for Every Stakeholder",
    matrixSubtitle: "Select a role to preview the custom UI dashboard experience tailored for each team member.",
    courseProgress: "Course Progress",
    daysRemaining: "Days Remaining",
    liveBroadcast: "Google Meet Live Broadcast",
    enrolledStudents: "Enrolled Students",
    todaysLectures: "Today's Scheduled Lectures",
    assignedLeads: "Assigned Student Leads",
    todaysFollowups: "Today's Scheduled Follow-ups",
    totalPlatformRevenue: "Total Platform Revenue",
    activeSecurityRules: "Active Security Rules",

    // Courses Section
    coursesBadge: "Featured Learning Tracks",
    coursesTitle: "Industry-Grade Masterclass Programs",
    coursesSubtitle: "Curriculum designed by expert faculty with hands-on projects, live Google Meet sessions, and verified certificates.",
    monthsPlan: "Months Plan",
    viewCourse: "View Course Details",

    // Pricing Section
    pricingBadge: "Flexible Enterprise Plans",
    pricingTitle: "Transparent Course Subscriptions",
    pricingSubtitle: "Choose a calendar plan that fits your learning timeline. Instant access upon payment verification.",
    popular: "Most Popular",
    enrollNow: "Enroll Now",

    // FAQ Section
    faqBadge: "Got Questions?",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Everything you need to know about course validity, access rules, and platform architecture.",

    // CTA Footer
    ctaTitle: "Ready to Transform Your Online Academy?",
    ctaSubtitle: "Experience the next generation of course management with calendar validity and live Google Meet integration.",
    ctaRegisterBtn: "Register as Student",
    ctaLoginBtn: "Sign In as Staff",
    footerText: "CodeX Technology — Production-Ready Enterprise Platform."
  },
  hi: {
    // Navigation
    features: "विशेषताएं",
    matrix: "4-भूमिका मैट्रिक्स",
    courses: "पाठ्यक्रम",
    pricing: "मूल्य निर्धारण",
    faq: "सामान्य प्रश्न",
    signIn: "साइन इन करें",
    getStarted: "शुरू करें",
    goToDashboard: "डैशबोर्ड पर जाएं",

    // Hero
    shimmerBadge: "अगली पीढ़ी का एंटरप्राइज कोर्स और व्याख्यान प्रबंधन सूट",
    heroTitlePrefix: "एक ही 3D LMS में ",
    heroTitleGradient: "छात्रों, शिक्षकों और प्रवेश टीम",
    heroTitleSuffix: " को सशक्त बनाएं।",
    heroSubtitle: "लाइव गूगल मीट कक्षाओं, सटीक कैलेंडर वैधता, 8-चरण सर्वर एक्सेस सत्यापन और सभी 4 भूमिकाओं के लिए समर्पित वर्कफ़्लो के साथ एक आधुनिक प्लेटफ़ॉर्म।",
    instantSandbox: "1-क्लिक इंस्टेंट डेमो पोर्टल",
    interactiveSandbox: "लाइव इंटरएक्टिव सैंडबॉक्स",
    student: "छात्र",
    faculty: "शिक्षक (फैकल्टी)",
    executor: "प्रवेश अधिकारी (एक्ज़ीक्यूटर)",
    admin: "एडमिन",
    studentSub: "राहुल शर्मा",
    facultySub: "डॉ. अनन्या",
    executorSub: "विक्रम मेहता",
    adminSub: "सिद्धार्थ राव",

    // Stats
    stat1Label: "कैलेंडर वैधता",
    stat1Sub: "सटीक महीना गणना",
    stat2Label: "सर्वर सत्यापन",
    stat2Sub: "सुरक्षित एक्सेस",
    stat3Label: "भूमिका पोर्टल",
    stat3Sub: "अनुकूलित डैशबोर्ड",
    stat4Label: "रेज़रपे तैयार",
    stat4Sub: "सुरक्षित भुगतान",

    // Features Section
    featuresBadge: "एंटरप्राइज कोर इंजन",
    featuresTitle: "अधिकतम अनुपालन और शून्य पायरेसी के लिए निर्मित",
    featuresSubtitle: "मजबूत सुरक्षा नियमों, स्वचालित समाप्ति नियंत्रक और अपरिवर्तनीय ऑडिट लॉगिंग के साथ बनाया गया।",
    feat1Title: "8-चरण सर्वर सत्यापन",
    feat1Desc: "प्रत्येक व्याख्यान स्ट्रीम जाँच JWT, नामांकन स्थिति, भुगतान और वैधता सीमा की पुष्टि करती है।",
    feat2Title: "कैलेंडर-आधारित वैधता",
    feat2Desc: "निश्चित 30-दिनों के बजाय सटीक महीने के गणित (प्रारंभ तिथि + अवधि महीने) का उपयोग करता है।",
    feat3Title: "4 अनुकूलित भूमिका पोर्टल",
    feat3Desc: "छात्रों, शिक्षकों, प्रवेश अधिकारियों और व्यवस्थापकों के लिए सुरक्षित, अलग डैशबोर्ड।",
    feat4Title: "लाइव गूगल मीट रूम",
    feat4Desc: "लाइव व्याख्यानों और रिकॉर्डिंग के लिए गूगल मीट के साथ सीधा एकीकरण।",
    feat5Title: "भुगतान प्रदाता अमूर्तता",
    feat5Desc: "रेज़रपे वेबहुक और त्वरित मॉक सत्यापन का समर्थन करने वाली लचीली भुगतान प्रणाली।",
    feat6Title: "अपरिवर्तनीय ऑडिट लॉगिंग",
    feat6Desc: "सभी प्रशासनिक परिवर्तनों और भुगतान सत्यापनों के लिए स्थायी ऑडिट लॉग।",

    // 4-Role Matrix Section
    matrixBadge: "पूर्ण भूमिका मैट्रिक्स",
    matrixTitle: "प्रत्येक हितधारक के लिए समर्पित पोर्टल",
    matrixSubtitle: "प्रत्येक टीम सदस्य के लिए अनुकूलित डैशबोर्ड अनुभव देखने के लिए एक भूमिका चुनें।",
    courseProgress: "पाठ्यक्रम की प्रगति",
    daysRemaining: "शेष दिन",
    liveBroadcast: "गूगल मीट लाइव प्रसारण",
    enrolledStudents: "नामांकित छात्र",
    todaysLectures: "आज के निर्धारित व्याख्यान",
    assignedLeads: "आवंटित छात्र लीड्स",
    todaysFollowups: "आज के अनुवर्ती कार्य (फॉलो-अप)",
    totalPlatformRevenue: "कुल प्लेटफ़ॉर्म राजस्व",
    activeSecurityRules: "सक्रिय सुरक्षा नियम",

    // Courses Section
    coursesBadge: "प्रमुख शिक्षण ट्रैक",
    coursesTitle: "उद्योग-स्तरीय मास्टरक्लास कार्यक्रम",
    coursesSubtitle: "विशेषज्ञ शिक्षकों द्वारा डिज़ाइन किया गया पाठ्यक्रम, लाइव गूगल मीट सत्र और सत्यापित प्रमाण पत्र।",
    monthsPlan: "महीने की योजना",
    viewCourse: "पाठ्यक्रम विवरण देखें",

    // Pricing Section
    pricingBadge: "लचीली योजनाएं",
    pricingTitle: "पारदर्शी पाठ्यक्रम सदस्यताएं",
    pricingSubtitle: "अपनी सीखने की समयरेखा के अनुकूल कैलेंडर योजना चुनें। भुगतान सत्यापन पर तुरंत पहुंच।",
    popular: "सबसे लोकप्रिय",
    enrollNow: "अभी नामांकित हों",

    // FAQ Section
    faqBadge: "कोई सवाल है?",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    faqSubtitle: "पाठ्यक्रम की वैधता, पहुंच के नियमों और प्लेटफ़ॉर्म वास्तुकला के बारे में सब कुछ जानें।",

    // CTA Footer
    ctaTitle: "अपनी ऑनलाइन अकादमी को बदलने के लिए तैयार हैं?",
    ctaSubtitle: "कैलेंडर वैधता और लाइव गूगल मीट एकीकरण के साथ अगली पीढ़ी के पाठ्यक्रम प्रबंधन का अनुभव करें।",
    ctaRegisterBtn: "छात्र के रूप में पंजीकरण करें",
    ctaLoginBtn: "कर्मचारी के रूप में साइन इन करें",
    footerText: "CodeX Technology — उत्पादन के लिए तैयार एंटरप्राइज प्लेटफॉर्म।"
  },
  mr: {
    // Navigation
    features: "वैशिष्ट्ये",
    matrix: "४-भूमिका मॅट्रिक्स",
    courses: "कोर्सेस",
    pricing: "किंमत (प्रायसिंग)",
    faq: "वारंवार विचारलेले प्रश्न",
    signIn: "साइन इन करा",
    getStarted: "शुरू करा",
    goToDashboard: "डॅशबोर्डवर जा",

    // Hero
    shimmerBadge: "पुढील पिढीचा एंटरप्राइझ कोर्स आणि लेक्चर मॅनेजमेंट सूट",
    heroTitlePrefix: "एकाच 3D LMS मध्ये ",
    heroTitleGradient: "विद्यार्थी, शिक्षक आणि प्रवेश टीम",
    heroTitleSuffix: " सक्षम करा.",
    heroSubtitle: "लाइव्ह गूगल मीट क्लासरूम्स, अचूक कॅलेंडर वैधता, ८-स्टेप सर्व्हर ॲक्सेस व्हॅलिडेशन आणि सर्व ४ भूमिकांसाठी समर्पित वर्कफ्लो असलेला आधुनिक प्लॅटफॉर्म.",
    instantSandbox: "१-क्लिक इन्स्टंट डेमो पोर्टल",
    interactiveSandbox: "लाइव्ह परस्परसंवादी सँडबॉक्स",
    student: "विद्यार्थी (Student)",
    faculty: "शिक्षक (Faculty)",
    executor: "प्रवेश अधिकारी (Executor)",
    admin: "ॲडमिन (Admin)",
    studentSub: "राहुल शर्मा",
    facultySub: "डॉ. अनन्या",
    executorSub: "विक्रम मेहता",
    adminSub: "सिद्धार्थ राव",

    // Stats
    stat1Label: "कॅलेंडर वैधता",
    stat1Sub: "अचूक महिना गणित",
    stat2Label: "सर्व्हर व्हॅलिडेशन",
    stat2Sub: "सुरक्षित ॲक्सेस",
    stat3Label: "भूमिका पोर्टल",
    stat3Sub: "सानुकूलित डॅशबोर्ड",
    stat4Label: "रेझरपे रेडी",
    stat4Sub: "सुरक्षित पेमेंट्स",

    // Features Section
    featuresBadge: "एंटरप्राइझ कोर इंजिन",
    featuresTitle: "कमाल सुसंगतता आणि शून्य पायरीसाठी बनवलेले",
    featuresSubtitle: "मजबूत सुरक्षा नियम, स्वयंचलित एक्सपायरी हँडलर आणि ऑडिओ लॉगिंगसह तयार केलेले.",
    feat1Title: "८-स्टेप सर्व्हर व्हॅलिडेशन",
    feat1Desc: "प्रत्येक लेक्चर स्ट्रीम तपासणी JWT, एनरोलमेंट, पेमेंट आणि वैधतेची पडताळणी करते.",
    feat2Title: "कॅलेंडर-आधारित वैधता",
    feat2Desc: "ठराविक ३० दिवसांऐवजी अचूक महिन्याचे गणित (प्रारंभ तारीख + कालावधी महिने) वापरते.",
    feat3Title: "४ सानुकूलित भूमिका पोर्टल",
    feat3Desc: "विद्यार्थी, शिक्षक, प्रवेश अधिकारी आणि ॲडमिनसाठी स्वतंत्र सुरक्षित डॅशबोर्ड.",
    feat4Title: "लाइव्ह गूगल मीट रूम्स",
    feat4Desc: "लाइव्ह लेक्चर्स आणि रेकॉर्डिंग लिंक्ससाठी गूगल मीटशी थेट एकत्रीकरण.",
    feat5Title: "पेमेंट प्रोव्हायडर ॲबस्ट्रॅक्शन",
    feat5Desc: "रेझरपे वेबहूक आणि त्वरित मॉक व्हॅलिडेशनला सपोर्ट करणारी लवचिक पेमेंट सिस्टम.",
    feat6Title: "अपरिहार्य ऑडीट लॉगिंग",
    feat6Desc: "सर्व प्रशासकीय बदल आणि पेमेंट पडताळणीसाठी कायमस्वरूपी ऑडीट लॉग.",

    // 4-Role Matrix Section
    matrixBadge: "पूर्ण भूमिका मॅट्रिक्स",
    matrixTitle: "प्रत्येक घटकासाठी समर्पित पोर्टल",
    matrixSubtitle: "प्रत्येक टीम सदस्यासाठी सानुकूलित डॅशबोर्ड अनुभव पाहण्यासाठी एक भूमिका निवडा.",
    courseProgress: "कोर्स प्रगती",
    daysRemaining: "उरलेले दिवस",
    liveBroadcast: "गूगल मीट लाइव्ह ब्रॉडकास्ट",
    enrolledStudents: "दाखल झालेले विद्यार्थी",
    todaysLectures: "आजचे ठरलेले लेक्चर्स",
    assignedLeads: "वाटून दिलेले विद्यार्थी लीड्स",
    todaysFollowups: "आजचे पाठपुरावा (फॉलो-अप) कार्य",
    totalPlatformRevenue: "एकूण प्लॅटफॉर्म महसूल",
    activeSecurityRules: "सक्रिय सुरक्षा नियम",

    // Courses Section
    coursesBadge: "प्रमुख शिकण्याचे ट्रॅक्स",
    coursesTitle: "उद्योग-स्तरीय मास्टरक्लास प्रोग्राम्स",
    coursesSubtitle: "तज्ज्ञ शिक्षकांनी तयार केलेला अभ्यासक्रम, लाइव्ह गूगल मीट सत्रांसह आणि पडताळणी केलेले प्रमाणपत्र.",
    monthsPlan: "महिन्यांची योजना",
    viewCourse: "कोर्स तपशील पहा",

    // Pricing Section
    pricingBadge: "लवचिक योजना",
    pricingTitle: "पारदर्शक कोर्स सबस्क्रिप्शन्स",
    pricingSubtitle: "तुमच्या शिकण्याच्या वेळेनुसार कॅलेंडर योजना निवडा. पेमेंट पडताळणीवर त्वरित ॲक्सेस.",
    popular: "सर्वात लोकप्रिय",
    enrollNow: "आत्ताच एनरोल करा",

    // FAQ Section
    faqBadge: "काही प्रश्न आहेत?",
    faqTitle: "वारंवार विचारलेले प्रश्न",
    faqSubtitle: "कोर्स वैधता, ॲक्सेस नियम आणि प्लॅटफॉर्म संरचनेबद्दल सर्व माहिती जाणून घ्या.",

    // CTA Footer
    ctaTitle: "तुमची ऑनलाईन अकादमी बदलण्यासाठी तयार आहात?",
    ctaSubtitle: "कॅलेंडर वैधता आणि लाइव्ह गूगल मीट एकत्रीकरणासह पुढील पिढीच्या कोर्स मॅनेजमेंटचा अनुभव घ्या.",
    ctaRegisterBtn: "विद्यार्थी म्हणून नोंदणी करा",
    ctaLoginBtn: "कर्मचारी म्हणून साइन इन करा",
    footerText: "CodeX Technology — उत्पादनासाठी तयार एंटरप्राइझ प्लॅटफॉर्म."
  }
};
