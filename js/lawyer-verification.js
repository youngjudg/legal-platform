// ماژول احراز صلاحیت و تیک آبی وکلا
// Version 8.0

const LAWYER_VERIFICATION_STATUSES = {

    pending: {

        title: "در انتظار بررسی",

        icon: "🟡"

    },

    reviewing: {

        title: "در حال بررسی",

        icon: "🔵"

    },

    incomplete: {

        title: "نقص مدارک",

        icon: "🟠"

    },

    approved: {

        title: "تأیید صلاحیت",

        icon: "🟢"

    },

    rejected: {

        title: "رد درخواست",

        icon: "🔴"

    },

    suspended: {

        title: "تعلیق حساب",

        icon: "⚫"

    }

};


// معیارهای دریافت تیک آبی

const BLUE_TICK_REQUIREMENTS = {

    minimumExperience: 5,

    acceptedDegrees: [

        "master",

        "doctorate"

    ],

    minimumCases: 150,

    disciplinaryHistory: "no"

};


// عنوان مدارک تحصیلی

const LAWYER_DEGREE_TITLES = {

    bachelor: "کارشناسی",

    master: "کارشناسی ارشد",

    doctorate: "دکتری"

};


// بررسی شرایط اولیه تیک آبی

function evaluateBlueTick(data) {

    const experience = Number(data.experience);

    const caseCount = Number(data.caseCount);

    const criteria = [

        {

            title: "حداقل ۵ سال سابقه وکالت",

            passed:

                Number.isFinite(experience) &&

                experience >=
                BLUE_TICK_REQUIREMENTS.minimumExperience

        },

        {

            title: "حداقل مدرک کارشناسی ارشد",

            passed:

                BLUE_TICK_REQUIREMENTS.acceptedDegrees

                .includes(data.degree)

        },

        {

            title: "سابقه وکالت در حداقل ۱۵۰ پرونده",

            passed:

                Number.isFinite(caseCount) &&

                caseCount >=
                BLUE_TICK_REQUIREMENTS.minimumCases

        },

        {

            title: "فقدان سابقه محکومیت انتظامی",

            passed:

                data.disciplinaryHistory ===
                BLUE_TICK_REQUIREMENTS.disciplinaryHistory

        }

    ];

    const passedCount = criteria.filter(

        item => item.passed

    ).length;

    return {

        eligible: passedCount === criteria.length,

        passedCount: passedCount,

        totalCriteria: criteria.length,

        criteria: criteria,

        verified: false,

        awarded: false,

        evaluatedAt: new Date().toISOString()

    };

}


// دریافت اطلاعات لازم از فرم ثبت‌نام

function getBlueTickFormData() {

    return {

        experience: lawyerNormalizeDigits(
            lawyerValue("experience")
        ),

        degree: lawyerValue("degree"),

        caseCount: lawyerNormalizeDigits(
            lawyerValue("caseCount")
        ),

        disciplinaryHistory:

            lawyerValue("disciplinaryHistory")

    };

}


// نمایش نتیجه اولیه بررسی تیک آبی

function renderBlueTickPreview() {

    const container = document.getElementById(

        "blueTickPreview"

    );

    if (!container) return;

    const result = evaluateBlueTick(

        getBlueTickFormData()

    );

    container.textContent = "";

    const title = document.createElement("h3");

    title.textContent =

        "🔷 بررسی اولیه شرایط دریافت تیک آبی";

    container.appendChild(title);

    result.criteria.forEach(item => {

        const row = document.createElement("p");

        row.textContent =

            (item.passed ? "✅ " : "❌ ") +

            item.title;

        container.appendChild(row);

    });

    const summary = document.createElement("p");

    summary.textContent =

        "تعداد شرایط احراز شده بر اساس اطلاعات اظهارشده: " +

        result.passedCount +

        " از " +

        result.totalCriteria;

    container.appendChild(summary);

    const conclusion = document.createElement("p");

    conclusion.textContent = result.eligible

        ? "🔵 واجد شرایط اولیه درخواست تیک آبی"

        : "⚪ شرایط اولیه دریافت تیک آبی تکمیل نیست";

    conclusion.style.fontWeight = "bold";

    container.appendChild(conclusion);

    const notice = document.createElement("p");

    notice.textContent =

        "این نتیجه صرفاً بر اساس اطلاعات آزمایشی اظهارشده است و به معنای تأیید صلاحیت یا اعطای تیک آبی نیست.";

    container.appendChild(notice);

    return result;

}


// ایجاد وضعیت اولیه احراز صلاحیت

function createLawyerVerification() {

    const now = new Date().toISOString();

    return {

        status: "pending",

        submittedAt: now,

        reviewedAt: null,

        approvedAt: null,

        reviewerId: null,

        rejectionReason: null,

        missingDocuments: [],

        professionalVerified: false,

        blueTickAwarded: false,

        history: [

            {

                status: "pending",

                date: now,

                description:

                    "ثبت آزمایشی درخواست عضویت"

            }

        ]

    };

}


// دریافت عنوان وضعیت احراز صلاحیت

function getLawyerVerificationTitle(status) {

    const definition =

        LAWYER_VERIFICATION_STATUSES[status];

    if (!definition) {

        return "وضعیت نامشخص";

    }

    return definition.icon +

        " " +

        definition.title;

}


// بررسی مجاز بودن فعالیت وکیل

function canLawyerProvideServices(application) {

    // ارائه خدمات واقعی در نسخه آزمایشی غیرفعال است.

    return false;

}


// بررسی وضعیت نمایش تیک آبی

function hasLawyerBlueTick(application) {

    if (!application || !application.verification) {

        return false;

    }

    return (

        application.verification.status === "approved" &&

        application.verification.professionalVerified === true &&

        application.verification.blueTickAwarded === true

    );

}


// ایجاد کد رهگیری آزمایشی

function generateLawyerTrackingCode() {

    const timestamp =

        Date.now().toString(36).toUpperCase();

    const random = Math.random()

        .toString(36)

        .substring(2, 8)

        .toUpperCase();

    return "LAW-TEST-" +

        timestamp +

        "-" +

        random;

}