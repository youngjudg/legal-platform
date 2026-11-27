// ماژول اعتبارسنجی اطلاعات وکلا
// Version 8.0

const LAWYER_PROVINCES = [

    "آذربایجان شرقی",
    "آذربایجان غربی",
    "اردبیل",
    "اصفهان",
    "البرز",
    "ایلام",
    "بوشهر",
    "تهران",
    "چهارمحال و بختیاری",
    "خراسان جنوبی",
    "خراسان رضوی",
    "خراسان شمالی",
    "خوزستان",
    "زنجان",
    "سمنان",
    "سیستان و بلوچستان",
    "فارس",
    "قزوین",
    "قم",
    "کردستان",
    "کرمان",
    "کرمانشاه",
    "کهگیلویه و بویراحمد",
    "گلستان",
    "گیلان",
    "لرستان",
    "مازندران",
    "مرکزی",
    "هرمزگان",
    "همدان",
    "یزد"

];

const LAWYER_SPECIALTIES = [

    "حقوقی و مدنی",
    "کیفری",
    "خانواده",
    "ملکی و ثبتی",
    "قراردادها",
    "کار و تأمین اجتماعی",
    "تجاری و شرکت‌ها",
    "چک و سفته",
    "اداری و شهرداری",
    "ارث و امور حسبی",
    "بین‌المللی و مهاجرت",
    "سایر موضوعات"

];

const LAWYER_AUTHORITIES = {

    bar: "کانون وکلای دادگستری",

    judiciary:
        "مرکز وکلا، کارشناسان رسمی و مشاوران خانواده قوه قضائیه"

};

function lawyerValue(id) {

    const element = document.getElementById(id);

    return element ? element.value.trim() : "";

}

function lawyerNormalizeDigits(value) {

    return String(value)

        .replace(/[۰-۹]/g, d =>
            "۰۱۲۳۴۵۶۷۸۹".indexOf(d))

        .replace(/[٠-٩]/g, d =>
            "٠١٢٣٤٥٦٧٨٩".indexOf(d))

        .trim();

}

function lawyerValidName(name) {

    return name.length >= 3 &&
           name.length <= 80 &&
           /^[\p{L}\p{M}\s‌]+$/u.test(name);

}

function lawyerValidNumber(value, min, max) {

    const normalized =
        lawyerNormalizeDigits(value);

    if (!/^\d+$/.test(normalized)) {

        return false;

    }

    const number = Number(normalized);

    return Number.isInteger(number) &&
           number >= min &&
           number <= max;

}

function lawyerValidationError(message, id) {

    alert(message);

    if (id) {

        const element =
            document.getElementById(id);

        if (element) element.focus();

    }

    return false;

}

function fillLawyerSelect(id, items, placeholder) {

    const select = document.getElementById(id);

    if (!select) return;

    select.textContent = "";

    const first = document.createElement("option");

    first.value = "";

    first.textContent = placeholder;

    select.appendChild(first);

    items.forEach(item => {

        const option =
            document.createElement("option");

        option.value = item;

        option.textContent = item;

        select.appendChild(option);

    });

}

function updateLicenseAuthority() {

    const authority =
        lawyerValue("licenseAuthority");

    const field =
        document.getElementById("authorityBranchField");

    const label =
        document.getElementById("authorityBranchLabel");

    if (!authority) {

        field.hidden = true;

        fillLawyerSelect(
            "authorityBranch",
            [],
            "انتخاب کنید"
        );

        return;

    }

    field.hidden = false;

    if (authority === "bar") {

        label.textContent =
            "کانون وکلای دادگستری مربوط";

        const branches = LAWYER_PROVINCES.map(
            province => "گزینه آزمایشی ـ " + province
        );

        fillLawyerSelect(

            "authorityBranch",

            branches,

            "انتخاب کانون مربوط"

        );

    } else if (authority === "judiciary") {

        label.textContent =
            "واحد استانی مرکز وکلا";

        const branches = LAWYER_PROVINCES.map(
            province => "واحد آزمایشی استان " + province
        );

        fillLawyerSelect(

            "authorityBranch",

            branches,

            "انتخاب واحد استانی"

        );

    }

}

function initializeLawyerSpecialties() {

    const container =
        document.getElementById("specialtyList");

    if (!container) return;

    container.textContent = "";

    LAWYER_SPECIALTIES.forEach(specialty => {

        const label =
            document.createElement("label");

        label.className = "checkItem";

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.name = "lawyerSpecialty";

        checkbox.value = specialty;

        label.appendChild(checkbox);

        label.appendChild(
            document.createTextNode(specialty)
        );

        container.appendChild(label);

    });

}

function getSelectedLawyerSpecialties() {

    return Array.from(

        document.querySelectorAll(
            'input[name="lawyerSpecialty"]:checked'
        )

    ).map(item => item.value);

}

function getSelectedLawyerServices() {

    return Array.from(

        document.querySelectorAll(
            'input[name="lawyerService"]:checked'
        )

    ).map(item => item.value);

}

function validateLawyerStep1() {

    const name = lawyerValue("lawyerName");

    const nationalCode = lawyerNormalizeDigits(
        lawyerValue("nationalCode")
    );

    const phone = lawyerNormalizeDigits(
        lawyerValue("lawyerPhone")
    );

    if (!lawyerValidName(name)) {

        return lawyerValidationError(

            "نام و نام خانوادگی آزمایشی معتبر وارد کنید.",

            "lawyerName"

        );

    }

    if (nationalCode !== "0000000000") {

        return lawyerValidationError(

            "فقط از کد ملی فرضی 0000000000 استفاده کنید.",

            "nationalCode"

        );

    }

    if (phone !== "09000000000") {

        return lawyerValidationError(

            "فقط از شماره همراه آزمایشی 09000000000 استفاده کنید.",

            "lawyerPhone"

        );

    }

    return true;

}

function validateLawyerStep2() {

    const license =
        lawyerValue("licenseNumber");

    if (!/^TEST-[0-9]{1,10}$/i.test(license)) {

        return lawyerValidationError(

            "شماره پروانه فرضی مانند TEST-1001 وارد کنید.",

            "licenseNumber"

        );

    }

    if (!LAWYER_AUTHORITIES[
        lawyerValue("licenseAuthority")
    ]) {

        return lawyerValidationError(

            "مرجع صدور پروانه را انتخاب کنید.",

            "licenseAuthority"

        );

    }

    if (!lawyerValue("authorityBranch")) {

        return lawyerValidationError(

            "کانون یا واحد استانی مربوط را انتخاب کنید.",

            "authorityBranch"

        );

    }

    if (!LAWYER_PROVINCES.includes(
        lawyerValue("workProvince")
    )) {

        return lawyerValidationError(

            "استان محل فعالیت را انتخاب کنید.",

            "workProvince"

        );

    }

    if (!lawyerValue("workCity")) {

        return lawyerValidationError(

            "شهر محل فعالیت را وارد کنید.",

            "workCity"

        );

    }

    if (!lawyerValidNumber(
        lawyerValue("experience"), 0, 70
    )) {

        return lawyerValidationError(

            "سابقه وکالت باید عددی بین صفر تا ۷۰ باشد.",

            "experience"

        );

    }

    if (!["bachelor", "master", "doctorate"].includes(
        lawyerValue("degree")
    )) {

        return lawyerValidationError(

            "مدرک تحصیلی را انتخاب کنید.",

            "degree"

        );

    }

    if (!lawyerValue("university")) {

        return lawyerValidationError(

            "نام دانشگاه فرضی را وارد کنید.",

            "university"

        );

    }

    if (!lawyerValue("studyField")) {

        return lawyerValidationError(

            "رشته و گرایش تحصیلی را وارد کنید.",

            "studyField"

        );

    }

    if (!lawyerValidNumber(
        lawyerValue("caseCount"), 0, 100000
    )) {

        return lawyerValidationError(

            "تعداد پرونده‌های آزمایشی را وارد کنید.",

            "caseCount"

        );

    }

    if (!["yes", "no"].includes(
        lawyerValue("disciplinaryHistory")
    )) {

        return lawyerValidationError(

            "وضعیت سابقه محکومیت انتظامی را مشخص کنید.",

            "disciplinaryHistory"

        );

    }

    if (getSelectedLawyerSpecialties().length === 0) {

        return lawyerValidationError(

            "حداقل یک حوزه تخصصی انتخاب کنید."

        );

    }

    if (!lawyerValue("resume")) {

        return lawyerValidationError(

            "رزومه کاری فرضی را وارد کنید.",

            "resume"

        );

    }

    if (!["license", "province", "country"].includes(
        lawyerValue("activityArea")
    )) {

        return lawyerValidationError(

            "محدوده جغرافیایی فعالیت را انتخاب کنید.",

            "activityArea"

        );

    }

    return true;

}

function validateLawyerStep3() {

    if (getSelectedLawyerServices().length === 0) {

        return lawyerValidationError(

            "حداقل یک خدمت حقوقی انتخاب کنید."

        );

    }

    return true;

}

function validateLawyerStep5() {

    if (!document.getElementById(
        "confirmInformation"
    ).checked) {

        return lawyerValidationError(

            "لطفاً اطلاعات واردشده را تأیید کنید."

        );

    }

    if (!document.getElementById(
        "acceptLawyerRules"
    ).checked) {

        return lawyerValidationError(

            "لطفاً شرایط و مقررات را بپذیرید."

        );

    }

    return true;

}

document.addEventListener("DOMContentLoaded", () => {

    fillLawyerSelect(

        "workProvince",

        LAWYER_PROVINCES,

        "انتخاب استان"

    );

    initializeLawyerSpecialties();

    updateLicenseAuthority();

});