/**
 * Fictional, self-contained phone stories. No data is collected, transmitted, or accepted.
 * Decisions are evaluated only after the final phone interaction.
 * Extend each locale's `scenes` to add paths without changing the renderer.
 */
const node = (kind, app, title, body, actions, extra = {}) => ({
  kind,
  app,
  title,
  body,
  actions,
  ...extra,
});
const act = (label, next, good, reason) => ({ label, next, good, reason });
const ar = {
  sms: {
    title: "رسالة الشحنة",
    summary: "قد تنتحل الرسائل هوية شركات التوصيل لطلب بياناتك أو أموالك.",
    scenes: {
      start: node(
        "messages",
        "الرسائل",
        "خدمة الشحن",
        "تعذر تسليم شحنتك. يرجى تحديث عنوانك خلال ساعتين عبر الرابط المرفق.",
        [
          act(
            "فتح رابط تحديث العنوان",
            "link",
            false,
            "الروابط غير المتوقعة في رسائل الشحن قد تقود إلى صفحات احتيالية.",
          ),
          act(
            "فتح تطبيق شركة الشحن",
            "verified",
            true,
            "التحقق عبر تطبيق الشركة الرسمي يقلل احتمال الوقوع في التصيد.",
          ),
        ],
        { address: "delivery-check.example" },
      ),
      link: node(
        "browser",
        "المتصفح",
        "تأكيد الشحنة",
        "رسوم إعادة التسليم: 4.90. يرجى إضافة بيانات البطاقة لإتمام العملية.",
        [
          act(
            "المتابعة إلى الدفع",
            "end",
            false,
            "لا تدخل بيانات الدفع في صفحة وصلت إليها عبر رسالة غير موثوقة.",
          ),
          act(
            "إغلاق الصفحة",
            "end",
            true,
            "إغلاق صفحة الدفع المشبوهة يمنع مشاركة بياناتك معها.",
          ),
        ],
        { address: "parcel-help.example" },
      ),
      verified: node(
        "messages",
        "شركة الشحن",
        "حالة الشحنة",
        "لا يوجد طلب لتعديل العنوان أو دفع رسوم إضافية في حسابك.",
        [
          act(
            "تجاهل الرسالة وحظر المرسل",
            "end",
            true,
            "تجاهل المرسل المجهول يمنع استمرار المحاولة.",
          ),
          act(
            "العودة إلى رابط الرسالة",
            "end",
            false,
            "لا حاجة لزيارة الرابط المشبوه بعد التحقق من الخدمة الرسمية.",
          ),
        ],
      ),
    },
  },
  qr: {
    title: "رمز الموقف",
    summary: "رموز QR قد تستبدل بروابط دفع احتيالية على الملصقات العامة.",
    scenes: {
      start: node(
        "scanner",
        "الكاميرا",
        "موقف السيارات",
        "وجدت رمز QR ملصقا فوق رمز قديم على لوحة الدفع.",
        [
          act(
            "فتح الرابط المقترح",
            "link",
            false,
            "الرمز الملصق قد يكون غيّر الوجهة الأصلية إلى موقع آخر.",
          ),
          act(
            "البحث عن تطبيق الجهة المشغلة",
            "verified",
            true,
            "استخدام التطبيق المعروف يساعدك على التحقق من جهة الدفع.",
          ),
        ],
        { address: "parking-pay.example" },
      ),
      link: node(
        "browser",
        "المتصفح",
        "دفع رسوم الوقوف",
        "لتجنب الغرامة، أدخل معلومات بطاقتك خلال 3 دقائق.",
        [
          act(
            "إدخال معلومات الدفع",
            "end",
            false,
            "الاستعجال وطلب البطاقة في موقع غير مألوف علامتان تستدعيان التحقق.",
          ),
          act(
            "إغلاق الصفحة",
            "end",
            true,
            "إيقاف الدفع حتى التحقق يحمي بيانات البطاقة.",
          ),
        ],
        { address: "pay-parking-fast.example" },
      ),
      verified: node(
        "settings",
        "تطبيق المواقف",
        "المواقف القريبة",
        "ظهرت بيانات الموقف ورسومه داخل التطبيق الرسمي.",
        [
          act(
            "استخدام الدفع داخل التطبيق",
            "end",
            true,
            "الدفع في القناة الرسمية يقلل مخاطر الاستبدال.",
          ),
          act(
            "الرجوع إلى الملصق الغريب",
            "end",
            false,
            "الملصق غير الموثق لا ينبغي تفضيله على القناة الرسمية.",
          ),
        ],
      ),
    },
  },
  permissions: {
    title: "أذونات التطبيق",
    summary: "قد تجمع التطبيقات بيانات لا تحتاج إليها عند منح أذونات واسعة.",
    scenes: {
      start: node(
        "permission",
        "محرر الصور",
        "السماح بالوصول",
        "يريد محرر الصور قراءة جهات الاتصال وتسجيل الصوت طوال الوقت.",
        [
          act(
            "السماح بجميع الأذونات",
            "wide",
            false,
            "هذه الصلاحيات لا تبدو ضرورية لتحرير الصور.",
          ),
          act(
            "رفض الأذونات غير المطلوبة",
            "limited",
            true,
            "منح أقل قدر لازم من الأذونات يقلل جمع البيانات.",
          ),
        ],
      ),
      wide: node(
        "settings",
        "إعدادات التطبيق",
        "أذونات التطبيق",
        "الأذونات المفعّلة: الميكروفون، جهات الاتصال، الصور.",
        [
          act(
            "ترك الأذونات كما هي",
            "end",
            false,
            "مراجعة الأذونات غير اللازمة تمنع استمرار الوصول غير الضروري.",
          ),
          act(
            "إيقاف الوصول غير اللازم",
            "end",
            true,
            "يمكنك إلغاء الأذونات الزائدة في إعدادات الجهاز.",
          ),
        ],
      ),
      limited: node(
        "permission",
        "محرر الصور",
        "اختيار الصور",
        "يمكن اختيار الصور التي تريد تعديلها فقط.",
        [
          act(
            "اختيار صور محددة",
            "end",
            true,
            "الوصول المحدود للصور يحافظ على خصوصية مكتبتك.",
          ),
          act(
            "السماح بكل الصور دون حاجة",
            "end",
            false,
            "مشاركة المكتبة كاملة أوسع من الحاجة لهذه المهمة.",
          ),
        ],
      ),
    },
  },
  wifi: {
    title: "شبكة المقهى",
    summary:
      "الأسماء المتشابهة للشبكات والصفحات الوهمية قد تستغل ثقة المستخدم.",
    scenes: {
      start: node(
        "wifi",
        "Wi-Fi",
        "الشبكات المتاحة",
        "ظهرت شبكتان متشابهتان باسم المقهى.",
        [
          act(
            "الاتصال بـ Cafe_Guest_Free",
            "portal",
            false,
            "الاسم المشابه لا يثبت أن الشبكة تخص المقهى.",
          ),
          act(
            "سؤال الموظف عن الشبكة",
            "official",
            true,
            "التحقق من الشبكة الصحيحة يمنع الاتصال بشبكة مزيفة.",
          ),
        ],
      ),
      portal: node(
        "browser",
        "بوابة الشبكة",
        "التحقق من الحساب",
        "لإكمال الاتصال المجاني، أدخل كلمة مرور بريدك الإلكتروني.",
        [
          act(
            "إدخال كلمة مرور البريد",
            "end",
            false,
            "صفحة شبكة عامة لا تحتاج عادةً إلى كلمة مرور بريدك الشخصي.",
          ),
          act(
            "إغلاق الصفحة وقطع الاتصال",
            "end",
            true,
            "الانسحاب من صفحة مشبوهة يمنع تسليم بيانات الحساب.",
          ),
        ],
        { address: "cafe-connect.example" },
      ),
      official: node(
        "wifi",
        "Wi-Fi",
        "Cafe_Guest",
        "أكد الموظف اسم الشبكة الرسمي. صفحة الاتصال لا تطلب كلمة مرور بريدك.",
        [
          act(
            "الاتصال بالشبكة المؤكدة",
            "end",
            true,
            "تحقق من اسم الشبكة وتجنب إدخال معلومات شخصية غير لازمة.",
          ),
          act(
            "الانتقال إلى الشبكة المجهولة",
            "end",
            false,
            "لا يوجد سبب لاستخدام شبكة مجهولة بعد تأكيد الشبكة الصحيحة.",
          ),
        ],
      ),
    },
  },
  otp: {
    title: "مكالمة من البنك",
    summary: "انتحال صفة البنك من أكثر الأساليب المستخدمة لسرقة رموز الدخول.",
    scenes: {
      start: node(
        "call",
        "الهاتف",
        "خدمة الحسابات",
        "أنا من خدمة العملاء. لاحظنا محاولة سحب ونحتاج رمز التحقق لإلغائها.",
        [
          act(
            "إبلاغ المتصل بالرمز",
            "code",
            false,
            "رمز التحقق مخصص لك؛ قد يُستخدم لتأكيد عملية لم تطلبها.",
          ),
          act(
            "إنهاء المكالمة",
            "verify",
            true,
            "إنهاء المكالمة والاتصال بالبنك عبر قنواته الرسمية تصرف آمن.",
          ),
        ],
        { address: "رقم غير محفوظ" },
      ),
      code: node(
        "messages",
        "الرسائل",
        "رمز التأكيد",
        "رمز الدخول: 728391 — لا تشارك هذا الرمز مع أي شخص.",
        [
          act(
            "إرسال الرمز للمتصل",
            "end",
            false,
            "مشاركة الرمز قد تسمح للمحتال بالوصول إلى حسابك.",
          ),
          act(
            "حذف الرسالة وعدم الرد",
            "end",
            true,
            "لا ترسل الرمز حتى لو بدا المتصل مقنعا.",
          ),
        ],
      ),
      verify: node(
        "call",
        "تطبيق البنك",
        "خدمة العملاء",
        "أكدت خدمة العملاء الرسمية أنها لم تطلب منك أي رمز تحقق.",
        [
          act(
            "إبلاغ البنك عن المكالمة",
            "end",
            true,
            "يساعد الإبلاغ الجهة على التعامل مع محاولات الانتحال.",
          ),
          act(
            "الاتصال مجددا بالرقم الغريب",
            "end",
            false,
            "لا تعتمد على الرقم الذي قدمه المتصل للتحقق من هويته.",
          ),
        ],
      ),
    },
  },
  update: {
    title: "تحديث غير متوقع",
    summary: "قد تظهر إشعارات زائفة تحاول إقناعك بتنزيل تطبيقات أو ملفات ضارة.",
    scenes: {
      start: node(
        "browser",
        "المتصفح",
        "تحديث مطلوب",
        "توقف دعم جهازك. نزّل تحديث الحماية الآن لتجنب تعطّل الهاتف.",
        [
          act(
            "تنزيل ملف التحديث",
            "download",
            false,
            "تنبيهات تحديث النظام التي تظهر في صفحة ويب غير موثوقة قد تكون خادعة.",
          ),
          act(
            "إغلاق النافذة",
            "settings",
            true,
            "تحقق من التحديثات في إعدادات النظام بدلا من روابط المواقع.",
          ),
        ],
        { address: "urgent-device-fix.example" },
      ),
      download: node(
        "permission",
        "مدير التنزيلات",
        "ملف من الإنترنت",
        "هل تسمح بتثبيت ملف تم تنزيله من موقع غير معروف؟",
        [
          act(
            "السماح بالتثبيت",
            "end",
            false,
            "تثبيت ملفات غير معروفة يزيد احتمال الإصابة ببرامج ضارة.",
          ),
          act("إلغاء التثبيت", "end", true, "إلغاء الملف المشبوه يمنع تثبيته."),
        ],
      ),
      settings: node(
        "settings",
        "الإعدادات",
        "تحديث النظام",
        "يتوفر تحديث أمني من الشركة المصنّعة.",
        [
          act(
            "تثبيت التحديث الرسمي",
            "end",
            true,
            "تحديثات الشركة المصنّعة تعالج ثغرات معروفة.",
          ),
          act(
            "تجاهل التصحيح مدة طويلة",
            "end",
            false,
            "تأجيل التصحيحات المهمة يبقي ثغرات معروفة دون معالجة.",
          ),
        ],
      ),
    },
  },
  zeroClick: {
    title: "تنبيه أمني",
    summary:
      "بعض الثغرات المتقدمة قد تُستغل دون أي تفاعل مباشر، ولا تُشخّص من إشعار واحد.",
    scenes: {
      start: node(
        "notification",
        "شاشة القفل",
        "الرسائل",
        "وصل إشعار غير متوقع من جهة غير معروفة. الهاتف يعمل بصورة طبيعية.",
        [
          act(
            "فتح التحديثات الأمنية",
            "patch",
            true,
            "مراجعة آخر التصحيحات عادة مفيدة لتقليل الثغرات المعروفة.",
          ),
          act(
            "اعتبار الإشعار دليلا على اختراق",
            "assume",
            false,
            "الإشعار وحده لا يثبت أن الهاتف تعرض للاختراق.",
          ),
        ],
      ),
      patch: node(
        "settings",
        "الإعدادات",
        "تحديث أمني",
        "تحديث أمني متوفر لجهازك، مع تحسينات للاستقرار.",
        [
          act(
            "تثبيت التحديث",
            "end",
            true,
            "التحديث المنتظم من أهم خطوات الوقاية.",
          ),
          act(
            "تأجيل التحديث بلا سبب",
            "end",
            false,
            "التأجيل الطويل يزيد فترة التعرض للثغرات المعالجة.",
          ),
        ],
      ),
      assume: node(
        "browser",
        "المتصفح",
        "فحص سريع للهاتف",
        "ظهر إعلان يعدك باكتشاف جميع الاختراقات بنقرة واحدة.",
        [
          act(
            "تنزيل أداة الفحص المجهولة",
            "end",
            false,
            "لا تثق بادعاءات الإعلانات التي تعد باكتشاف كل الاختراقات.",
          ),
          act(
            "إغلاق الإعلان ومراجعة النظام",
            "end",
            true,
            "استخدم الأدوات المدمجة وخدمات الدعم الموثوقة.",
          ),
        ],
        { address: "instant-check.example" },
      ),
    },
  },
  passkeys: {
    title: "تسجيل الدخول",
    summary: "مفاتيح المرور تقلل خطر التصيد مقارنة بكلمات المرور التقليدية.",
    scenes: {
      start: node(
        "signin",
        "حسابي",
        "تسجيل الدخول",
        "اختر طريقة الدخول إلى حسابك.",
        [
          act(
            "استخدام كلمة مرور مكررة",
            "password",
            false,
            "إعادة استخدام كلمة المرور في مواقع مختلفة تعرض الحسابات للخطر.",
          ),
          act(
            "استخدام مفتاح المرور",
            "key",
            true,
            "مفتاح المرور المصمم بصورة صحيحة مقاوم لمحاولات التصيد.",
          ),
        ],
      ),
      password: node(
        "browser",
        "المتصفح",
        "تأكيد الحساب",
        "وصلت إلى صفحة تشبه صفحة الدخول، لكن عنوانها يختلف عن الموقع الرسمي.",
        [
          act(
            "إدخال كلمة المرور",
            "end",
            false,
            "عنوان الموقع المزيف قد يهدف إلى سرقة بيانات الاعتماد.",
          ),
          act(
            "التحقق من عنوان الموقع",
            "end",
            true,
            "التحقق من النطاق قبل إدخال كلمة المرور يقلل خطر التصيد.",
          ),
        ],
        { address: "account-check.example" },
      ),
      key: node(
        "passkey",
        "حسابي",
        "تأكيد الهوية",
        "يطلب هاتفك تأكيد تسجيل الدخول باستخدام بصمة الإصبع أو الوجه.",
        [
          act(
            "الموافقة على حسابك المعروف",
            "end",
            true,
            "الموافقة على طلب يخص حسابك وموقعك الحقيقي تجعل الدخول أكثر أمانا.",
          ),
          act(
            "تجاهل عنوان الموقع تماما",
            "end",
            false,
            "يظل التحقق من الخدمة والسياق ضروريا حتى مع وسائل الدخول الحديثة.",
          ),
        ],
      ),
    },
  },
  support: {
    title: "الدعم الفني المزيف",
    summary:
      "قد ينتحل المحتالون هوية فرق الدعم لإقناعك بمشاركة الشاشة أو منحهم التحكم.",
    scenes: {
      start: node(
        "call",
        "الهاتف",
        "فريق الدعم",
        "مرحبًا، رصدنا مشكلة أمنية على جهازك، ويمكننا حلها فورًا إذا فتحت مشاركة الشاشة.",
        [
          act(
            "فتح مشاركة الشاشة",
            "sharing",
            false,
            "مشاركة الشاشة مع متصل غير معروف قد تكشف رسائل وأكوادًا ومعلومات شخصية.",
          ),
          act(
            "إغلاق المكالمة وفتح تطبيق الدعم الرسمي",
            "official",
            true,
            "ابدأ التواصل بنفسك من قناة الدعم الرسمية.",
          ),
        ],
        { address: "رقم غير محفوظ" },
      ),
      sharing: node(
        "permission",
        "إعدادات الهاتف",
        "مشاركة الشاشة",
        "يريد المتصل مشاهدة شاشة الهاتف بالكامل أثناء تسجيل دخولك.",
        [
          act(
            "السماح بمشاهدة الشاشة",
            "end",
            false,
            "قد يرى المحتال بيانات حساسة أثناء استخدامك الهاتف.",
          ),
          act(
            "إلغاء المشاركة",
            "end",
            true,
            "أوقف مشاركة الشاشة مع شخص لا تثق في هويته.",
          ),
        ],
      ),
      official: node(
        "messages",
        "مركز المساعدة",
        "الدعم الرسمي",
        "لم نتصل بك اليوم، ولا نطلب مشاركة الشاشة للتحقق من الحساب.",
        [
          act(
            "الإبلاغ عن المكالمة",
            "end",
            true,
            "الإبلاغ يساعد في التنبه لمحاولات انتحال الدعم.",
          ),
          act(
            "العودة إلى المكالمة المجهولة",
            "end",
            false,
            "لا تعتمد على تعليمات متصل غير معروف.",
          ),
        ],
      ),
    },
  },
  friend: {
    title: "رسالة من صديق",
    summary: "قد يقلد المحتال طريقة كتابة شخص تعرفه ليطلب مالًا بصورة عاجلة.",
    scenes: {
      start: node(
        "messages",
        "المحادثات",
        "صديقك",
        "أنا في ورطة، جوالي خربان ولا أقدر أتصل. تقدر تحوّل مبلغ صغير الآن؟ برجع لك بعد ساعة.",
        [
          act(
            "طلب رقم الحساب للتحويل",
            "transfer",
            false,
            "الاستجابة للطلب المالي قبل التأكد من الهوية قد تؤدي إلى خسارة المال.",
          ),
          act(
            "الاتصال بصديقك على رقمه المعتاد",
            "verify",
            true,
            "التحقق من هوية المرسل خارج المحادثة طريقة قوية لكشف انتحال الشخصيات.",
          ),
        ],
      ),
      transfer: node(
        "messages",
        "المحادثات",
        "صديقك",
        "حوّل إلى هذا الحساب الجديد، بسرعة لو سمحت.",
        [
          act(
            "إرسال المال",
            "end",
            false,
            "حتى لو بدا أسلوب الكتابة مألوفًا، فقد يكون الحساب منتحلًا.",
          ),
          act(
            "التحقق من هوية الصديق",
            "end",
            true,
            "لا تحول مالًا حتى تتأكد من الشخص بالطريقة المعتادة.",
          ),
        ],
      ),
      verify: node(
        "call",
        "الهاتف",
        "صديقك الحقيقي",
        "ما طلبت منك أي تحويل، ويبدو أن أحدهم يستخدم حسابًا يشبه حسابي.",
        [
          act(
            "الإبلاغ عن الحساب المشبوه",
            "end",
            true,
            "البلاغ قد يحمي أشخاصًا آخرين من الخداع.",
          ),
          act(
            "تصديق الرسالة الأصلية",
            "end",
            false,
            "التحقق المباشر ينفي صحة الطلب المشبوه.",
          ),
        ],
      ),
    },
  },
};
const en = {
  sms: {
    title: "Parcel message",
    summary:
      "Fake delivery messages may impersonate couriers to collect personal or payment information.",
    scenes: {
      start: node(
        "messages",
        "Messages",
        "Parcel delivery",
        "We couldn’t deliver your parcel. Update your address within two hours using this link.",
        [
          act(
            "Open the address link",
            "link",
            false,
            "Unexpected delivery links can lead to phishing pages.",
          ),
          act(
            "Open the official delivery app",
            "verified",
            true,
            "Checking the official app helps you avoid phishing.",
          ),
        ],
        { address: "delivery-check.example" },
      ),
      link: node(
        "browser",
        "Browser",
        "Confirm parcel",
        "Redelivery fee: 4.90. Add your card details to complete your request.",
        [
          act(
            "Continue to payment",
            "end",
            false,
            "Do not enter payment data on an unverified link from a message.",
          ),
          act(
            "Close the page",
            "end",
            true,
            "Closing the suspicious page avoids sharing your details.",
          ),
        ],
        { address: "parcel-help.example" },
      ),
      verified: node(
        "messages",
        "Courier app",
        "Parcel status",
        "Your account has no request to change your address or pay any extra fee.",
        [
          act(
            "Ignore and block sender",
            "end",
            true,
            "Ignoring the unknown sender prevents further engagement.",
          ),
          act(
            "Go back to the SMS link",
            "end",
            false,
            "There is no reason to use that link after verifying the official service.",
          ),
        ],
      ),
    },
  },
  qr: {
    title: "Parking QR",
    summary:
      "Public QR codes can be covered with stickers linking to fake payment sites.",
    scenes: {
      start: node(
        "scanner",
        "Camera",
        "Parking payment",
        "A QR sticker has been placed over an older code on the payment sign.",
        [
          act(
            "Open the suggested link",
            "link",
            false,
            "A sticker can replace the original payment destination.",
          ),
          act(
            "Find the parking operator’s app",
            "verified",
            true,
            "Using a verified operator app can confirm where you should pay.",
          ),
        ],
        { address: "parking-pay.example" },
      ),
      link: node(
        "browser",
        "Browser",
        "Parking charge",
        "Avoid a fine: enter your card information in the next three minutes.",
        [
          act(
            "Enter card information",
            "end",
            false,
            "Urgency and an unfamiliar checkout page are signs to investigate.",
          ),
          act(
            "Close this page",
            "end",
            true,
            "Stop before sharing card data on an unfamiliar page.",
          ),
        ],
        { address: "pay-parking-fast.example" },
      ),
      verified: node(
        "settings",
        "Parking app",
        "Nearby parking",
        "The official app displays the location and the current parking charges.",
        [
          act(
            "Pay in the official app",
            "end",
            true,
            "Paying through the verified service reduces sticker-based phishing risk.",
          ),
          act(
            "Return to the unknown sticker",
            "end",
            false,
            "The unverified sticker is not more trustworthy than the official app.",
          ),
        ],
      ),
    },
  },
  permissions: {
    title: "App permissions",
    summary:
      "Apps can collect unnecessary data when granted excessive permissions.",
    scenes: {
      start: node(
        "permission",
        "Photo editor",
        "Permission request",
        "This photo editor wants contacts and unrestricted microphone access.",
        [
          act(
            "Allow all permissions",
            "wide",
            false,
            "These permissions seem unrelated to photo editing.",
          ),
          act(
            "Deny unrelated permissions",
            "limited",
            true,
            "Granting only necessary access reduces exposed personal data.",
          ),
        ],
      ),
      wide: node(
        "settings",
        "App settings",
        "App permissions",
        "Currently enabled: microphone, contacts, photos.",
        [
          act(
            "Leave access unchanged",
            "end",
            false,
            "Review unnecessary permissions rather than leaving broad access enabled.",
          ),
          act(
            "Turn off unrelated access",
            "end",
            true,
            "Extra permissions can be revoked in device settings.",
          ),
        ],
      ),
      limited: node(
        "permission",
        "Photo editor",
        "Select photos",
        "You can give the app access to selected photos only.",
        [
          act(
            "Choose specific photos",
            "end",
            true,
            "Limited photo access protects the rest of your library.",
          ),
          act(
            "Allow the entire photo library",
            "end",
            false,
            "This gives broader access than the task needs.",
          ),
        ],
      ),
    },
  },
  wifi: {
    title: "Cafe Wi-Fi",
    summary:
      "Similar network names and fake captive portals can exploit misplaced trust.",
    scenes: {
      start: node(
        "wifi",
        "Wi-Fi",
        "Available networks",
        "Two similar Wi-Fi names appear nearby.",
        [
          act(
            "Join Cafe_Guest_Free",
            "portal",
            false,
            "A familiar-looking name does not prove the network belongs to the venue.",
          ),
          act(
            "Ask staff for the official network",
            "official",
            true,
            "Verifying the SSID helps avoid impostor access points.",
          ),
        ],
      ),
      portal: node(
        "browser",
        "Network portal",
        "Account verification",
        "To connect to free Wi-Fi, enter your email account password.",
        [
          act(
            "Enter email password",
            "end",
            false,
            "A public network portal should not require your personal email password.",
          ),
          act(
            "Close and disconnect",
            "end",
            true,
            "Leaving a suspicious portal protects your credentials.",
          ),
        ],
        { address: "cafe-connect.example" },
      ),
      official: node(
        "wifi",
        "Wi-Fi",
        "Cafe_Guest",
        "Staff confirmed this network. The login page does not ask for an email password.",
        [
          act(
            "Join the verified network",
            "end",
            true,
            "Confirm the network name and avoid sharing unneeded personal information.",
          ),
          act(
            "Switch to the unknown network",
            "end",
            false,
            "There is no reason to prefer the unverified network.",
          ),
        ],
      ),
    },
  },
  otp: {
    title: "Bank phone call",
    summary:
      "Impersonating bank staff is a common route to stealing one-time codes.",
    scenes: {
      start: node(
        "call",
        "Phone",
        "Account support",
        "I’m calling from the bank. We detected a charge and need your security code to cancel it.",
        [
          act(
            "Tell the caller the code",
            "code",
            false,
            "A verification code could authorize something you never requested.",
          ),
          act(
            "Hang up",
            "verify",
            true,
            "Hang up and contact the bank through its official contact details.",
          ),
        ],
        { address: "Unknown number" },
      ),
      code: node(
        "messages",
        "Messages",
        "Verification code",
        "Sign-in code: 728391. Never share this code with anyone.",
        [
          act(
            "Send the code to the caller",
            "end",
            false,
            "Sharing a code may allow the fraudster to access an account.",
          ),
          act(
            "Do not respond",
            "end",
            true,
            "Never send the code, even if the caller sounds convincing.",
          ),
        ],
      ),
      verify: node(
        "call",
        "Bank app",
        "Support",
        "Official bank support confirms they did not request a verification code.",
        [
          act(
            "Report the suspicious call",
            "end",
            true,
            "Reporting can help the bank detect impersonation campaigns.",
          ),
          act(
            "Call the unknown number back",
            "end",
            false,
            "Do not rely on numbers provided by the suspicious caller.",
          ),
        ],
      ),
    },
  },
  update: {
    title: "Unexpected update",
    summary:
      "Fake update prompts can trick people into downloading malicious files.",
    scenes: {
      start: node(
        "browser",
        "Browser",
        "Update required",
        "Your device is no longer protected. Download a security update immediately.",
        [
          act(
            "Download the update file",
            "download",
            false,
            "OS update warnings from unknown websites may be fraudulent.",
          ),
          act(
            "Dismiss the popup",
            "settings",
            true,
            "Check updates inside system settings instead.",
          ),
        ],
        { address: "urgent-device-fix.example" },
      ),
      download: node(
        "permission",
        "Downloads",
        "File downloaded",
        "Allow an installation from an unknown website?",
        [
          act(
            "Allow installation",
            "end",
            false,
            "Installing files from unknown origins increases malware risk.",
          ),
          act(
            "Cancel installation",
            "end",
            true,
            "Cancelling an untrusted installation prevents the app from being installed.",
          ),
        ],
      ),
      settings: node(
        "settings",
        "Settings",
        "System updates",
        "An official security update is available from the device manufacturer.",
        [
          act(
            "Install official update",
            "end",
            true,
            "Vendor security updates fix known issues.",
          ),
          act(
            "Ignore security patches",
            "end",
            false,
            "Delaying important updates can leave known vulnerabilities open.",
          ),
        ],
      ),
    },
  },
  zeroClick: {
    title: "Security notification",
    summary:
      "Some advanced flaws require no click; an ordinary notification alone is not proof of compromise.",
    scenes: {
      start: node(
        "notification",
        "Lock screen",
        "Messages",
        "An unexpected notification arrives from an unknown contact. The phone otherwise works normally.",
        [
          act(
            "Check security updates",
            "patch",
            true,
            "Reviewing patch status is a useful routine.",
          ),
          act(
            "Assume the phone was hacked",
            "assume",
            false,
            "One notification does not confirm a compromise.",
          ),
        ],
      ),
      patch: node(
        "settings",
        "Settings",
        "Security update",
        "A security update is available for your device.",
        [
          act(
            "Install the update",
            "end",
            true,
            "Keeping your phone patched is important.",
          ),
          act(
            "Delay it indefinitely",
            "end",
            false,
            "Unnecessary delays extend your exposure to known flaws.",
          ),
        ],
      ),
      assume: node(
        "browser",
        "Browser",
        "Instant phone scan",
        "An advertisement claims to detect every possible phone hack in one click.",
        [
          act(
            "Download the unknown scanner",
            "end",
            false,
            "No unverified advertisement can promise to detect every compromise.",
          ),
          act(
            "Close it and review the system",
            "end",
            true,
            "Prefer built-in checks and reputable support channels.",
          ),
        ],
        { address: "instant-check.example" },
      ),
    },
  },
  passkeys: {
    title: "Sign in",
    summary: "Passkeys help resist phishing better than reusable passwords.",
    scenes: {
      start: node(
        "signin",
        "My account",
        "Sign in",
        "Choose a sign-in method for your account.",
        [
          act(
            "Use a reused password",
            "password",
            false,
            "Reusing passwords across services creates avoidable risk.",
          ),
          act(
            "Use a passkey",
            "key",
            true,
            "Well-implemented passkeys provide strong phishing resistance.",
          ),
        ],
      ),
      password: node(
        "browser",
        "Browser",
        "Confirm account",
        "This website resembles your sign-in page, but the address does not match your usual service.",
        [
          act(
            "Type your password",
            "end",
            false,
            "An impostor domain may capture your credentials.",
          ),
          act(
            "Check the site address",
            "end",
            true,
            "Verify the domain before entering credentials.",
          ),
        ],
        { address: "account-check.example" },
      ),
      key: node(
        "passkey",
        "My account",
        "Verify identity",
        "Your phone asks you to confirm the passkey with your fingerprint or face.",
        [
          act(
            "Approve for your known account",
            "end",
            true,
            "Approving a valid request on a trusted service offers stronger account security.",
          ),
          act(
            "Ignore the site and context",
            "end",
            false,
            "Context still matters even when using newer sign-in methods.",
          ),
        ],
      ),
    },
  },
  support: {
    title: "Fake technical support",
    summary:
      "Scammers may pose as technical support and request screen sharing or remote access.",
    scenes: {
      start: node(
        "call",
        "Phone",
        "Device support",
        "Hello, we found a security problem on your phone. Please share your screen so I can fix it now.",
        [
          act(
            "Start sharing the screen",
            "sharing",
            false,
            "An unknown caller could see private messages and account details.",
          ),
          act(
            "Hang up and open official support",
            "official",
            true,
            "Contact the provider through a channel you open yourself.",
          ),
        ],
        { address: "Unknown number" },
      ),
      sharing: node(
        "permission",
        "Phone settings",
        "Screen broadcast",
        "The caller asks to watch your entire screen while you sign in.",
        [
          act(
            "Allow screen broadcast",
            "end",
            false,
            "The caller may see sensitive data and verification codes.",
          ),
          act(
            "Cancel screen sharing",
            "end",
            true,
            "Do not broadcast your screen to an unverified caller.",
          ),
        ],
      ),
      official: node(
        "messages",
        "Help center",
        "Official support",
        "We did not call you today and never request screen sharing to verify your account.",
        [
          act(
            "Report the suspicious call",
            "end",
            true,
            "Reporting impersonation helps warn others.",
          ),
          act(
            "Call the unknown person back",
            "end",
            false,
            "Do not rely on a number supplied by the unknown caller.",
          ),
        ],
      ),
    },
  },
  friend: {
    title: "Message from a friend",
    summary:
      "Scammers can mimic a friend’s writing style and ask for emergency transfers.",
    scenes: {
      start: node(
        "messages",
        "Messages",
        "Your friend",
        "I’m stuck and my phone is broken. Can you send me a small payment? I’ll pay you back in an hour.",
        [
          act(
            "Ask for bank transfer details",
            "transfer",
            false,
            "Do not trust an unexpected payment request just because it sounds familiar.",
          ),
          act(
            "Call your friend on their usual number",
            "verify",
            true,
            "Checking through a separate known channel helps expose impersonation.",
          ),
        ],
      ),
      transfer: node(
        "messages",
        "Messages",
        "Your friend",
        "Send it to this new account quickly, please.",
        [
          act(
            "Send the payment",
            "end",
            false,
            "A familiar writing style does not prove who controls an account.",
          ),
          act(
            "Verify the person first",
            "end",
            true,
            "Verify identity before making an unexpected transfer.",
          ),
        ],
      ),
      verify: node(
        "call",
        "Phone",
        "Your real friend",
        "I never asked for any money. Somebody is using an account that looks like mine.",
        [
          act(
            "Report the suspicious account",
            "end",
            true,
            "A report can protect other people from fraud.",
          ),
          act(
            "Trust the earlier message anyway",
            "end",
            false,
            "Direct confirmation contradicts the suspicious request.",
          ),
        ],
      ),
    },
  },
};
export const getStory = (language, id) => (language === "en" ? en : ar)[id];
export const storyIds = Object.keys(ar);
