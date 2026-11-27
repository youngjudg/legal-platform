// ماژول اصلی ثبت‌نام و ورود وکلا
// Version 8.1

const LAWYER_APPLICATION_KEY =
    "legal_platform_demo_lawyer_application";

const LAWYER_SESSION_KEY =
    "legal_platform_demo_lawyer_session";

const LAWYER_DEMO_OTP = "123456";

const MEMBERSHIP_FORM_VERSION = "1.0";

let currentLawyerStep = 1;
let lawyerApplication = null;
let lawyerOTPExpiresAt = 0;
let lawyerOTPAttempts = 0;

let membershipForm = null;
let membershipConfirmation = null;


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

    progress.hidden =
        !/^step[1-5]$/.test(id);

    showPage(id);

}


function goLawyerAuthHome() {

    lawyerOTPExpiresAt = 0;
    lawyerOTPAttempts = 0;

    showLawyerPage("home");

}


// شروع ثبت‌نام

function startLawyerRegistration() {

    lawyerApplication =
        getSavedLawyerApplication();

    if (lawyerApplication) {

        alert(
            "یک درخواست آزمایشی قبلاً ثبت شده است."
        );

        checkApplication();

        return;

    }

    showLawyerStep(1);

}


// مدیریت مراحل ثبت‌نام

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

        renderMembershipForm();

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

    membershipForm = null;
    membershipConfirmation = null;

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


// نمایش امن اطلاعات

function appendLawyerDetail(
    container,
    title,
    value
) {

    const row = document.createElement("p");

    row.textContent = title + ": " + value;

    container.appendChild(row);

}


// نمایش خلاصه ثبت‌نام

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

    appendLawyerDetail(

        container,

        "تکمیل مدارک الزامی",

        getLawyerDocumentProgress().percent + "%"

    );

}


// تولید شماره اختصاصی فرم

function generateMembershipFormId() {

    return "MF-TEST-" +

        Date.now()
        .toString(36)
        .toUpperCase() +

        "-" +

        Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

}


// تولید خودکار فرم درخواست عضویت

function createMembershipForm(data) {

    const services = data.services.map(

        service =>
            LAWYER_SERVICE_TITLES[service]

    ).join("، ");

    const formId =
        generateMembershipFormId();

    const createdAt =
        new Date().toISOString();

    const paragraphs = [

        "مدیریت محترم پلتفرم خدمات حقوقی",

        "با سلام و احترام",

        "اینجانب " + data.name +
        " با کد ملی فرضی " +
        data.nationalCode +
        " و شماره پروانه آزمایشی " +
        data.licenseNumber +
        "، تقاضای عضویت و همکاری با پلتفرم خدمات حقوقی را دارم.",

        "مرجع صدور پروانه: " +
        LAWYER_AUTHORITIES[
            data.licenseAuthority
        ],

        "کانون یا واحد مربوط: " +
        data.authorityBranch,

        "شماره تلفن همراه فرضی: " +
        data.phone,

        "محل فعالیت: " +
        data.workProvince +
        " ـ " +
        data.workCity,

        "خدمات مورد تقاضا: " +
        services,

        "محدوده جغرافیایی فعالیت: " +
        LAWYER_AREA_TITLES[
            data.activityArea
        ],

        "اینجانب در چارچوب این نمونه آزمایشی، مفاد زیر را مطالعه و تأیید می‌کنم:",

        "۱. اطلاعات و مستندات ارائه‌شده در فرایند ثبت‌نام باید صحیح و معتبر باشند.",

        "۲. برخورداری از پروانه معتبر وکالت و رعایت مقررات حرفه‌ای از شرایط همکاری در نسخه عملیاتی خواهد بود.",

        "۳. بررسی و استعلام صلاحیت حرفه‌ای از مرجع صدور پروانه، تابع ضوابط قانونی و مجوزهای لازم خواهد بود.",

        "۴. حفظ محرمانگی اطلاعات و مستندات کاربران و رعایت حقوق آنان ضروری است.",

        "۵. رعایت قوانین و مقررات حاکم بر فعالیت حرفه‌ای و ضوابط معتبر پلتفرم الزامی خواهد بود.",

        "۶. تغییر در وضعیت پروانه وکالت یا صلاحیت حرفه‌ای باید مطابق ضوابط به مدیریت پلتفرم اعلام شود.",

        "۷. ثبت درخواست عضویت به معنای پذیرش نهایی، تأیید صلاحیت یا اعطای تیک آبی نیست.",

        "۸. آغاز همکاری واقعی منوط به احراز شرایط قانونی و پذیرش نهایی درخواست خواهد بود.",

        "۹. این فرم صرفاً آزمایشی است و تأیید آن موجب ایجاد رابطه قراردادی واقعی نمی‌شود.",

        "نام متقاضی: " + data.name,

        "شماره اختصاصی فرم: " + formId,

        "نسخه فرم: " + MEMBERSHIP_FORM_VERSION,

        "تاریخ تولید فرم: " +
        new Date(createdAt)
        .toLocaleString("fa-IR")

    ];

    return {

        id: formId,

        version: MEMBERSHIP_FORM_VERSION,

        createdAt: createdAt,

        title: "فرم درخواست عضویت و همکاری",

        paragraphs: paragraphs,

        dataSnapshot: JSON.stringify(data),

        demo: true

    };

}


// نمایش فرم عضویت

function renderMembershipForm() {

    const data = collectLawyerData();

    const snapshot = JSON.stringify(data);

    if (

        !membershipForm ||

        membershipForm.dataSnapshot !== snapshot

    ) {

        membershipForm =
            createMembershipForm(data);

        invalidateMembershipConfirmation();

    }

    const container =
        document.getElementById(
            "membershipFormContent"
        );

    container.textContent = "";

    const title = document.createElement("h3");

    title.textContent = membershipForm.title;

    container.appendChild(title);

    membershipForm.paragraphs.forEach(

        paragraph => {

            const row =
                document.createElement("p");

            row.textContent = paragraph;

            container.appendChild(row);

        }

    );

}


// تأیید الکترونیکی آزمایشی فرم

function updateMembershipConfirmation() {

    const checkbox =
        document.getElementById(
            "acceptMembershipForm"
        );

    const status =
        document.getElementById(
            "membershipConfirmationStatus"
        );

    if (!checkbox || !status) return;

    if (!checkbox.checked || !membershipForm) {

        membershipConfirmation = null;

        checkbox.checked = false;

        status.textContent =
            "⚪ فرم هنوز تأیید نشده است.";

        status.style.color = "";

        return;

    }

    if (

        membershipForm.dataSnapshot !==

        JSON.stringify(collectLawyerData())

    ) {

        checkbox.checked = false;

        membershipConfirmation = null;

        renderMembershipForm();

        return;

    }

    membershipConfirmation = {

        formId: membershipForm.id,

        formVersion: membershipForm.version,

        confirmedAt: new Date().toISOString(),

        method: "demo-checkbox",

        confirmed: true,

        demo: true

    };

    status.textContent =

        "✅ فرم به‌صورت آزمایشی تأیید شد.";

    status.style.color = "#16865c";

}


// اعتبارسنجی تأیید فرم

function validateMembershipConfirmation() {

    if (

        !membershipForm ||

        !membershipConfirmation ||

        !document.getElementById(
            "acceptMembershipForm"
        ).checked ||

        membershipConfirmation.confirmed !== true ||

        membershipConfirmation.formId !==
            membershipForm.id ||

        membershipConfirmation.formVersion !==
            membershipForm.version ||

        membershipForm.dataSnapshot !==
            JSON.stringify(collectLawyerData())

    ) {

        alert(

            "لطفاً فرم درخواست عضویت را مطالعه و تأیید کنید."

        );

        renderMembershipForm();

        return false;

    }

    return true;

}


// دریافت نسخه متنی فرم

function exportMembershipForm(
    form,
    confirmation
) {

    if (!form || !Array.isArray(form.paragraphs)) {

        alert("فرم درخواست عضویت موجود نیست.");

        return;

    }

    const lines = [

        form.title,

        "نسخه آزمایشی ـ فاقد اعتبار قراردادی",

        "",

        ...form.paragraphs,

        ""

    ];

    if (confirmation &&
        confirmation.confirmed === true) {

        lines.push(

            "وضعیت: تأیید آزمایشی شده",

            "تاریخ تأیید: " +

            new Date(
                confirmation.confirmedAt
            ).toLocaleString("fa-IR"),

            "روش تأیید: انتخاب گزینه تأیید آزمایشی"

        );

    } else {

        lines.push(

            "وضعیت: پیش‌نویس تأییدنشده"

        );

    }

    lines.push(

        "",

        "این سند امضای الکترونیکی معتبر ندارد."

    );

    const blob = new Blob(

        ["\uFEFF" + lines.join("\n\n")],

        {type: "text/plain;charset=utf-8"}

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = form.id + ".txt";

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(

        () => URL.revokeObjectURL(url),

        3000

    );

}


function downloadMembershipForm() {

    renderMembershipForm();

    exportMembershipForm(

        membershipForm,

        membershipConfirmation

    );

}


function downloadSavedMembershipForm() {

    const application =
        getSavedLawyerApplication();

    if (!application ||
        !application.membershipForm) {

        alert(

            "فرم عضویت ثبت‌شده در این نسخه موجود نیست."

        );

        return;

    }

    exportMembershipForm(

        application.membershipForm,

        application.membershipConfirmation

    );

}


// شرایط و مقررات

function showLawyerRules() {

    showLawyerPage("rules");

}


function returnFromLawyerRules() {

    showLawyerStep(5);

}


// ذخیره درخواست آزمایشی

function saveLawyerApplication(application) {

    if (

        !application ||

        application.demo !== true ||

        application.phone !== "09000000000" ||

        application.nationalCode !== "0000000000" ||

        !/^TEST-[0-9]{1,10}$/i.test(
            application.licenseNumber
        ) ||

        !application.membershipConfirmation ||

        application.membershipConfirmation
            .confirmed !== true

    ) {

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

        if (

            application.demo !== true ||

            application.phone !== "09000000000" ||

            application.nationalCode !== "0000000000"

        ) {

            return null;

        }

        return application;

    } catch {

        return null;

    }

}


// ارسال نهایی درخواست عضویت

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

    if (!validateMembershipConfirmation()) {

        showLawyerStep(5);

        return;

    }

    const data = collectLawyerData();

    lawyerApplication = {

        ...data,

        trackingCode:
            generateLawyerTrackingCode(),

        createdAt:
            new Date().toISOString(),

        acceptedRules: true,

        membershipForm:

            JSON.parse(
                JSON.stringify(membershipForm)
            ),

        membershipConfirmation:

            JSON.parse(
                JSON.stringify(
                    membershipConfirmation
                )
            ),

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
        "شماره فرم عضویت",
        lawyerApplication.membershipForm.id

    );

    appendLawyerDetail(

        container,
        "تاریخ تأیید آزمایشی فرم",

        new Date(

            lawyerApplication
            .membershipConfirmation
            .confirmedAt

        ).toLocaleString("fa-IR")

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


// پیگیری درخواست

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
        "فرم عضویت",

        lawyerApplication.membershipConfirmation
            ?.confirmed

            ? "تأیید آزمایشی شده"

            : "ثبت نشده"

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

        if (

            !application ||

            session.demo !== true ||

            session.role !== "lawyer" ||

            !Number.isFinite(session.expiresAt) ||

            Date.now() >= session.expiresAt ||

            session.trackingCode !==
                application.trackingCode

        ) {

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
        "فرم عضویت",

        lawyerApplication.membershipConfirmation
            ?.confirmed

            ? "تأیید آزمایشی شده"

            : "ثبت نشده"

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

        const sections =
            document.querySelectorAll(

                "#step1, #step2, #step3, #step4"

            );

        sections.forEach(section => {

            section.addEventListener(

                "input",

                invalidateMembershipConfirmation

            );

            section.addEventListener(

                "change",

                invalidateMembershipConfirmation

            );

        });

        lawyerApplication =
            getSavedLawyerApplication();

        if (getLawyerSession()) {

            renderLawyerProfile();

        } else {

            goLawyerAuthHome();

        }

    }

);