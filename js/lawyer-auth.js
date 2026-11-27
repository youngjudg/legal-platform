// ماژول اصلی ثبت‌نام و ورود وکلا
// Version 8.0

const LAWYER_APPLICATION_KEY =
    "legal_platform_demo_lawyer_application";

const LAWYER_SESSION_KEY =
    "legal_platform_demo_lawyer_session";

const LAWYER_DEMO_OTP = "123456";

let currentLawyerStep = 1;
let lawyerApplication = null;
let lawyerOTPExpiresAt = 0;
let lawyerOTPAttempts = 0;

const LAWYER_SERVICE_TITLES = {

    representation: "قبول وکالت پرونده",

    consultation: "مشاوره حقوقی",

    petition: "تنظیم دادخواست",

    complaint: "تنظیم شکوائیه",

    brief: "تنظیم لایحه",

    notice: "تنظیم اظهارنامه"

};

const LAWYER_AREA_TITLES = {

    license: "حوزه جغرافیایی پروانه وکالت",

    province: "سطح استان",

    country: "سراسر کشور"

};


// مدیریت صفحات

function showLawyerPage(id) {

    const progress =
        document.getElementById(
            "registrationProgress"
        );

    progress.hidden = !/^step[1-5]$/.test(id);

    showPage(id);

}

function goLawyerAuthHome() {

    lawyerOTPExpiresAt = 0;

    lawyerOTPAttempts = 0;

    showLawyerPage("home");

}


// مدیریت مراحل ثبت‌نام

function startLawyerRegistration() {

    lawyerApplication = getSavedLawyerApplication();

    if (lawyerApplication) {

        alert(
            "یک درخواست آزمایشی قبلاً ثبت شده است."
        );

        checkApplication();

        return;

    }

    showLawyerStep(1);

}

function showLawyerStep(step) {

    if (step < 1 || step > 5) return;

    currentLawyerStep = step;

    document.getElementById(
        "progressText"
    ).textContent =

        "مرحله " +

        step.toLocaleString("fa-IR") +

        " از ۵";

    document.getElementById(
        "progressBar"
    ).style.width =

        (step * 20) + "%";

    showLawyerPage("step" + step);

    if (step === 5) {

        renderLawyerRegistrationSummary();

        renderBlueTickPreview();

    }

}

function nextLawyerStep(step) {

    if (step !== currentLawyerStep) return;

    const validators = {

        1: validateLawyerStep1,

        2: validateLawyerStep2,

        3: validateLawyerStep3,

        4: validateLawyerStep4

    };

    const validator = validators[step];

    if (!validator || !validator()) return;

    showLawyerStep(step + 1);

}

function previousLawyerStep(step) {

    showLawyerStep(step - 1);

}

function exitRegistration() {

    if (!confirm(
        "آیا از ادامه ثبت‌نام انصراف می‌دهید؟"
    )) return;

    resetLawyerRegistration();

    goLawyerAuthHome();

}

function resetLawyerRegistration() {

    document.querySelectorAll(

        'section[id^="step"] input,' +

        'section[id^="step"] select,' +

        'section[id^="step"] textarea'

    ).forEach(element => {

        if (element.readOnly) return;

        if (element.type === "checkbox") {

            element.checked = false;

        } else {

            element.value = "";

        }

    });

    resetLawyerDocuments();

    updateLicenseAuthority();

    currentLawyerStep = 1;

}


// جمع‌آوری اطلاعات ثبت‌نام

function collectLawyerData() {

    return {

        name: lawyerValue("lawyerName"),

        nationalCode: lawyerNormalizeDigits(
            lawyerValue("nationalCode")
        ),

        phone: lawyerNormalizeDigits(
            lawyerValue("lawyerPhone")
        ),

        licenseNumber:
            lawyerValue("licenseNumber"),

        licenseAuthority:
            lawyerValue("licenseAuthority"),

        authorityBranch:
            lawyerValue("authorityBranch"),

        workProvince:
            lawyerValue("workProvince"),

        workCity:
            lawyerValue("workCity"),

        experience: Number(
            lawyerNormalizeDigits(
                lawyerValue("experience")
            )
        ),

        degree: lawyerValue("degree"),

        university: lawyerValue("university"),

        studyField: lawyerValue("studyField"),

        caseCount: Number(
            lawyerNormalizeDigits(
                lawyerValue("caseCount")
            )
        ),

        disciplinaryHistory:
            lawyerValue("disciplinaryHistory"),

        specialties:
            getSelectedLawyerSpecialties(),

        services:
            getSelectedLawyerServices(),

        resume: lawyerValue("resume"),

        activityArea:
            lawyerValue("activityArea"),

        iban: lawyerValue("iban"),

        documents: getLawyerDocuments(),

        demo: true

    };

}


// نمایش اطلاعات به شکل امن

function appendLawyerDetail(
    container,
    title,
    value
) {

    const row = document.createElement("p");

    row.textContent =

        title + ": " + value;

    container.appendChild(row);

}


// پیش‌نمایش ثبت‌نام

function renderLawyerRegistrationSummary() {

    const data = collectLawyerData();

    const container =
        document.getElementById(
            "registrationSummary"
        );

    container.textContent = "";

    const details = [

        ["نام و نام خانوادگی", data.name],

        ["کد ملی فرضی", data.nationalCode],

        ["شماره همراه فرضی", data.phone],

        ["شماره پروانه", data.licenseNumber],

        ["مرجع صدور پروانه",
            LAWYER_AUTHORITIES[
                data.licenseAuthority
            ]],

        ["کانون یا واحد مربوط",
            data.authorityBranch],

        ["استان محل فعالیت",
            data.workProvince],

        ["شهر محل فعالیت",
            data.workCity],

        ["سابقه وکالت",
            data.experience + " سال"],

        ["مدرک تحصیلی",
            LAWYER_DEGREE_TITLES[data.degree]],

        ["دانشگاه", data.university],

        ["رشته و گرایش", data.studyField],

        ["تعداد پرونده‌ها", data.caseCount],

        ["محکومیت انتظامی",
            data.disciplinaryHistory === "no"
                ? "ندارد"
                : "دارد"],

        ["حوزه‌های تخصصی",
            data.specialties.join("، ")],

        ["خدمات قابل ارائه",

            data.services.map(

                service =>
                    LAWYER_SERVICE_TITLES[service]

            ).join("، ")],

        ["رزومه کاری", data.resume],

        ["محدوده فعالیت",

            LAWYER_AREA_TITLES[
                data.activityArea
            ]],

        ["شماره شبای فرضی", data.iban]

    ];

    details.forEach(item => {

        appendLawyerDetail(

            container,

            item[0],

            item[1]

        );

    });

    const progress =
        getLawyerDocumentProgress();

    appendLawyerDetail(

        container,

        "تکمیل مدارک الزامی",

        progress.percent + "%"

    );

}


// مدیریت شرایط و مقررات

function showLawyerRules() {

    showLawyerPage("rules");

}

function returnFromLawyerRules() {

    showLawyerStep(5);

}


// ذخیره درخواست آزمایشی

function saveLawyerApplication(application) {

    if (!application ||
        application.demo !== true ||
        application.phone !== "09000000000" ||
        application.nationalCode !== "0000000000" ||
        !/^TEST-[0-9]{1,10}$/i.test(
            application.licenseNumber
        )) {

        return false;

    }

    try {

        sessionStorage.setItem(

            LAWYER_APPLICATION_KEY,

            JSON.stringify(application)

        );

        return true;

    } catch {

        return false;

    }

}

function getSavedLawyerApplication() {

    try {

        const saved = sessionStorage.getItem(

            LAWYER_APPLICATION_KEY

        );

        if (!saved) return null;

        const application = JSON.parse(saved);

        if (application.demo !== true ||
            application.phone !== "09000000000" ||
            application.nationalCode !== "0000000000") {

            return null;

        }

        return application;

    } catch {

        return null;

    }

}


// ارسال درخواست عضویت

function submitLawyerApplication() {

    if (getSavedLawyerApplication()) {

        alert(
            "درخواست آزمایشی قبلاً ثبت شده است."
        );

        checkApplication();

        return;

    }

    const validators = [

        validateLawyerStep1,

        validateLawyerStep2,

        validateLawyerStep3,

        validateLawyerStep4,

        validateLawyerStep5

    ];

    for (let i = 0; i < validators.length; i++) {

        if (!validators[i]()) {

            showLawyerStep(i + 1);

            return;

        }

    }

    const data = collectLawyerData();

    lawyerApplication = {

        ...data,

        trackingCode:
            generateLawyerTrackingCode(),

        createdAt:
            new Date().toISOString(),

        acceptedRules: true,

        verification:
            createLawyerVerification(),

        blueTick:
            evaluateBlueTick(data)

    };

    if (!saveLawyerApplication(
        lawyerApplication
    )) {

        alert(
            "ذخیره درخواست آزمایشی ناموفق بود."
        );

        return;

    }

    renderLawyerApplicationReceipt();

    resetLawyerRegistration();

    showLawyerPage("submitted");

}


// صدور رسید ثبت درخواست

function renderLawyerApplicationReceipt() {

    const container =
        document.getElementById(
            "applicationReceipt"
        );

    container.textContent = "";

    appendLawyerDetail(

        container,

        "نام متقاضی",

        lawyerApplication.name

    );

    appendLawyerDetail(

        container,

        "کد رهگیری",

        lawyerApplication.trackingCode

    );

    appendLawyerDetail(

        container,

        "تاریخ ثبت درخواست",

        new Date(
            lawyerApplication.createdAt
        ).toLocaleString("fa-IR")

    );

    appendLawyerDetail(

        container,

        "وضعیت درخواست",

        getLawyerVerificationTitle(

            lawyerApplication.verification.status

        )

    );

}


// پیگیری وضعیت درخواست

function checkApplication() {

    lawyerApplication =
        getSavedLawyerApplication();

    if (!lawyerApplication) {

        alert(
            "هنوز درخواست آزمایشی ثبت نشده است."
        );

        goLawyerAuthHome();

        return;

    }

    const container =
        document.getElementById(
            "applicationStatusContent"
        );

    container.textContent = "";

    appendLawyerDetail(

        container,

        "نام متقاضی",

        lawyerApplication.name

    );

    appendLawyerDetail(

        container,

        "کد رهگیری",

        lawyerApplication.trackingCode

    );

    appendLawyerDetail(

        container,

        "وضعیت احراز صلاحیت",

        getLawyerVerificationTitle(

            lawyerApplication.verification.status

        )

    );

    appendLawyerDetail(

        container,

        "شرایط اولیه تیک آبی",

        lawyerApplication.blueTick.eligible

            ? "واجد شرایط اولیه"

            : "شرایط تکمیل نیست"

    );

    appendLawyerDetail(

        container,

        "تیک آبی",

        hasLawyerBlueTick(lawyerApplication)

            ? "اعطا شده"

            : "اعطا نشده"

    );

    appendLawyerDetail(

        container,

        "مجوز ارائه خدمات واقعی",

        "غیرفعال"

    );

    showLawyerPage("applicationStatus");

}


// ورود وکلا

function loginLawyer() {

    const phone = lawyerNormalizeDigits(

        lawyerValue("lawyerLoginPhone")

    );

    lawyerApplication =
        getSavedLawyerApplication();

    if (phone !== "09000000000") {

        alert(
            "فقط شماره همراه آزمایشی مجاز است."
        );

        return;

    }

    if (!lawyerApplication) {

        alert(
            "ابتدا درخواست عضویت آزمایشی ثبت کنید."
        );

        return;

    }

    startLawyerOTP();

}

function startLawyerOTP() {

    lawyerOTPExpiresAt =

        Date.now() + 120000;

    lawyerOTPAttempts = 0;

    document.getElementById(
        "lawyerOTPCode"
    ).value = "";

    showLawyerPage("lawyerOTP");

}

function resendLawyerOTP() {

    if (!lawyerApplication ||
        !lawyerOTPExpiresAt) {

        goLawyerAuthHome();

        return;

    }

    startLawyerOTP();

    alert("رمز آزمایشی: 123456");

}

function verifyLawyerOTP() {

    if (!lawyerApplication ||
        !lawyerOTPExpiresAt) {

        goLawyerAuthHome();

        return;

    }

    if (Date.now() >= lawyerOTPExpiresAt) {

        alert("اعتبار رمز پایان یافته است.");

        return;

    }

    if (lawyerOTPAttempts >= 5) {

        alert("رمز جدید دریافت کنید.");

        return;

    }

    const code = lawyerNormalizeDigits(

        lawyerValue("lawyerOTPCode")

    );

    lawyerOTPAttempts++;

    if (code !== LAWYER_DEMO_OTP) {

        alert("رمز واردشده صحیح نیست.");

        return;

    }

    const session = {

        role: "lawyer",

        trackingCode:
            lawyerApplication.trackingCode,

        loginAt: Date.now(),

        expiresAt: Date.now() + 3600000,

        demo: true

    };

    try {

        sessionStorage.setItem(

            LAWYER_SESSION_KEY,

            JSON.stringify(session)

        );

    } catch {

        alert(
            "ایجاد نشست آزمایشی ناموفق بود."
        );

        return;

    }

    lawyerOTPExpiresAt = 0;

    lawyerOTPAttempts = 0;

    renderLawyerProfile();

}


// مدیریت نشست وکلا

function getLawyerSession() {

    try {

        const saved = sessionStorage.getItem(

            LAWYER_SESSION_KEY

        );

        if (!saved) return null;

        const session = JSON.parse(saved);

        const application =
            getSavedLawyerApplication();

        if (!application ||
            session.demo !== true ||
            session.role !== "lawyer" ||
            !Number.isFinite(session.expiresAt) ||
            Date.now() >= session.expiresAt ||
            session.trackingCode !==
                application.trackingCode) {

            sessionStorage.removeItem(
                LAWYER_SESSION_KEY
            );

            return null;

        }

        return session;

    } catch {

        return null;

    }

}


// نمایش پروفایل وکیل

function renderLawyerProfile() {

    if (!getLawyerSession()) {

        showLawyerPage("login");

        return;

    }

    lawyerApplication =
        getSavedLawyerApplication();

    const container =
        document.getElementById(
            "lawyerProfileContent"
        );

    container.textContent = "";

    appendLawyerDetail(

        container,

        "نام و نام خانوادگی",

        lawyerApplication.name

    );

    appendLawyerDetail(

        container,

        "شماره پروانه آزمایشی",

        lawyerApplication.licenseNumber

    );

    appendLawyerDetail(

        container,

        "مرجع صدور پروانه",

        LAWYER_AUTHORITIES[
            lawyerApplication.licenseAuthority
        ]

    );

    appendLawyerDetail(

        container,

        "وضعیت احراز صلاحیت",

        getLawyerVerificationTitle(

            lawyerApplication.verification.status

        )

    );

    appendLawyerDetail(

        container,

        "کد رهگیری",

        lawyerApplication.trackingCode

    );

    appendLawyerDetail(

        container,

        "تیک آبی",

        hasLawyerBlueTick(lawyerApplication)

            ? "اعطا شده"

            : "اعطا نشده"

    );

    showLawyerPage("lawyerProfile");

}


// خروج از حساب کاربری

function logoutLawyer() {

    if (!confirm(
        "آیا از حساب کاربری خارج می‌شوید؟"
    )) return;

    sessionStorage.removeItem(

        LAWYER_SESSION_KEY

    );

    document.getElementById(
        "lawyerOTPCode"
    ).value = "";

    document.getElementById(
        "lawyerProfileContent"
    ).textContent = "";

    goLawyerAuthHome();

    alert("از حساب کاربری خارج شدید.");

}


// راه‌اندازی اولیه

document.addEventListener(

    "DOMContentLoaded",

    () => {

        lawyerApplication =
            getSavedLawyerApplication();

        if (getLawyerSession()) {

            renderLawyerProfile();

        } else {

            goLawyerAuthHome();

        }

    }

);