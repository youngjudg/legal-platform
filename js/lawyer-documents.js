// ماژول مدیریت مدارک و مستندات وکلا
// Version 8.0

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

    application: {

        title: "فرم تقاضای ثبت‌نام",

        statusId: "applicationDocumentStatus"

    },

    video: {

        title: "تقاضای تصویری ثبت‌نام",

        statusId: "videoDocumentStatus"

    }

};

let lawyerDocuments = {};

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

    alert(

        definition.title +
        " به‌صورت آزمایشی ثبت شد."

    );

}

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

}

function getRequiredLawyerDocuments() {

    const required = [

        "license",

        "identity",

        "application",

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

function getMissingLawyerDocuments() {

    return getRequiredLawyerDocuments()

        .filter(type => !lawyerDocuments[type])

        .map(type =>
            LAWYER_DOCUMENT_TYPES[type].title
        );

}

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

function getLawyerDocuments() {

    return JSON.parse(
        JSON.stringify(lawyerDocuments)
    );

}

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

function resetLawyerDocuments() {

    lawyerDocuments = {};

    Object.keys(
        LAWYER_DOCUMENT_TYPES
    ).forEach(type => {

        updateLawyerDocumentStatus(type);

    });

}

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