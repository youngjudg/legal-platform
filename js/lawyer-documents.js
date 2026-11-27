// ماژول مدیریت مدارک و مستندات وکلا
// Version 8.1

const LAWYER_DOCUMENT_TYPES = {

    license: {

        title: "تصویر پروانه معتبر وکالت",

        statusId: "licenseDocumentStatus"

    },

    identity: {

        title: "تصویر کارت ملی",

        statusId: "identityDocumentStatus"

    },

    degree: {

        title: "مدارک تحصیلی",

        statusId: "degreeDocumentStatus"

    },

    video: {

        title: "تقاضای تصویری ثبت‌نام",

        statusId: "videoDocumentStatus"

    }

};

let lawyerDocuments = {};


// ثبت آزمایشی مدارک

function simulateDocument(type) {

    const definition =
        LAWYER_DOCUMENT_TYPES[type];

    if (!definition) return;

    if (lawyerDocuments[type]) {

        const replace = confirm(

            "این مدرک آزمایشی قبلاً ثبت شده است. آیا جایگزین شود؟"

        );

        if (!replace) return;

    }

    lawyerDocuments[type] = {

        type: type,

        title: definition.title,

        id: "DOC-TEST-" +
            type.toUpperCase() +
            "-" +
            Date.now().toString(36).toUpperCase(),

        submittedAt: new Date().toISOString(),

        status: "pending",

        simulated: true

    };

    updateLawyerDocumentStatus(type);

    invalidateMembershipConfirmation();

    alert(

        definition.title +
        " به‌صورت آزمایشی ثبت شد."

    );

}


// به‌روزرسانی وضعیت مدارک

function updateLawyerDocumentStatus(type) {

    const definition =
        LAWYER_DOCUMENT_TYPES[type];

    if (!definition) return;

    const element =
        document.getElementById(
            definition.statusId
        );

    if (!element) return;

    const record = lawyerDocuments[type];

    if (record) {

        element.textContent =
            "✅ ثبت آزمایشی شد ـ در انتظار بررسی";

        element.style.color = "#16865c";

    } else {

        element.textContent = "ثبت نشده";

        element.style.color = "";

    }

}


// حذف مدرک آزمایشی

function removeLawyerDocument(type) {

    if (!LAWYER_DOCUMENT_TYPES[type]) return;

    if (!lawyerDocuments[type]) return;

    if (!confirm(
        "آیا مدرک آزمایشی حذف شود؟"
    )) {

        return;

    }

    delete lawyerDocuments[type];

    updateLawyerDocumentStatus(type);

    invalidateMembershipConfirmation();

}


// تعیین مدارک الزامی

function getRequiredLawyerDocuments() {

    const required = [

        "license",

        "identity",

        "video"

    ];

    const degree = lawyerValue("degree");

    if (

        degree === "master" ||

        degree === "doctorate"

    ) {

        required.push("degree");

    }

    return required;

}


// تشخیص نقص مدارک

function getMissingLawyerDocuments() {

    return getRequiredLawyerDocuments()

        .filter(type => !lawyerDocuments[type])

        .map(type =>
            LAWYER_DOCUMENT_TYPES[type].title
        );

}


// اعتبارسنجی مرحله چهارم

function validateLawyerStep4() {

    const missing =
        getMissingLawyerDocuments();

    if (missing.length > 0) {

        alert(

            "لطفاً مدارک آزمایشی زیر را تکمیل کنید:\n\n" +

            missing.join("\n")

        );

        return false;

    }

    const iban = lawyerValue("iban");

    if (
        iban !== "IR000000000000000000000000"
    ) {

        alert(

            "در نسخه آزمایشی فقط شماره شبای فرضی مجاز است."

        );

        return false;

    }

    return true;

}


// دریافت اطلاعات مدارک

function getLawyerDocuments() {

    return JSON.parse(
        JSON.stringify(lawyerDocuments)
    );

}


// تهیه خلاصه وضعیت مدارک

function getLawyerDocumentSummary() {

    return Object.keys(
        LAWYER_DOCUMENT_TYPES
    ).map(type => {

        const definition =
            LAWYER_DOCUMENT_TYPES[type];

        const record =
            lawyerDocuments[type];

        return {

            title: definition.title,

            submitted: Boolean(record),

            required:
                getRequiredLawyerDocuments()
                .includes(type),

            status: record

                ? "ثبت آزمایشی ـ در انتظار بررسی"

                : "ثبت نشده"

        };

    });

}


// محاسبه درصد تکمیل مدارک

function getLawyerDocumentProgress() {

    const required =
        getRequiredLawyerDocuments();

    const completed = required.filter(

        type => Boolean(lawyerDocuments[type])

    ).length;

    return {

        total: required.length,

        completed: completed,

        remaining:
            required.length - completed,

        percent: Math.round(

            completed /
            required.length * 100

        )

    };

}


// لغو تأیید قبلی فرم در صورت تغییر مدارک

function invalidateMembershipConfirmation() {

    const checkbox =
        document.getElementById(
            "acceptMembershipForm"
        );

    if (checkbox) {

        checkbox.checked = false;

    }

    const confirmation =
        document.getElementById(
            "confirmInformation"
        );

    if (confirmation) {

        confirmation.checked = false;

    }

    const status =
        document.getElementById(
            "membershipConfirmationStatus"
        );

    if (status) {

        status.textContent =
            "⚪ فرم هنوز تأیید نشده است.";

        status.style.color = "";

    }

    if (
        typeof updateMembershipConfirmation
        === "function"
    ) {

        updateMembershipConfirmation();

    }

}


// بازنشانی مدارک

function resetLawyerDocuments() {

    lawyerDocuments = {};

    Object.keys(
        LAWYER_DOCUMENT_TYPES
    ).forEach(type => {

        updateLawyerDocumentStatus(type);

    });

    invalidateMembershipConfirmation();

}


// راه‌اندازی اولیه

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Object.keys(
            LAWYER_DOCUMENT_TYPES
        ).forEach(type => {

            updateLawyerDocumentStatus(type);

        });

    }

);