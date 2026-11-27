// ماژول ثبت‌نام و ورود مشتریان
// Version 7.2

const DEMO_OTP = "123456";

let pendingCustomer = null;
let authMode = "";
let currentCustomer = null;
let registeredCustomer = null;
let otpExpiresAt = 0;
let otpAttempts = 0;

function normalizeDigits(value) {

    return value
        .replace(/[۰-۹]/g, d =>
            "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, d =>
            "٠١٢٣٤٥٦٧٨٩".indexOf(d))
        .trim();

}

function validPhone(phone) {

    return /^09[0-9]{9}$/.test(phone);

}

function validName(name) {

    return name.length >= 3 &&
           name.length <= 80 &&
           /^[\p{L}\p{M}\s‌]+$/u.test(name);

}

function registerCustomer() {

    const name = document
        .getElementById("fullName")
        .value.trim();

    const phone = normalizeDigits(
        document.getElementById("registerPhone").value
    );

    const accepted = document
        .getElementById("acceptRules")
        .checked;

    if (!validName(name)) {

        alert("لطفاً نام آزمایشی معتبر وارد کنید.");

        return;

    }

    if (!validPhone(phone)) {

        alert("شماره همراه باید ۱۱ رقمی و با 09 شروع شود.");

        return;

    }

    if (phone !== "09000000000") {

        alert("فقط از شماره آزمایشی 09000000000 استفاده کنید.");

        return;

    }

    if (!accepted) {

        alert("لطفاً قوانین و مقررات را بپذیرید.");

        return;

    }

    registeredCustomer = getSavedCustomer();

    if (registeredCustomer &&
        registeredCustomer.phone === phone) {

        alert("این حساب آزمایشی قبلاً ثبت شده است.");

        showPage("login");

        return;

    }

    pendingCustomer = {

        name: name,

        phone: phone,

        acceptedRules: true,

        createdAt: new Date().toISOString(),

        status: "آزمایشی"

    };

    authMode = "register";

    startOTP();

}

function loginCustomer() {

    const phone = normalizeDigits(
        document.getElementById("loginPhone").value
    );

    if (!validPhone(phone)) {

        alert("شماره همراه معتبر وارد کنید.");

        return;

    }

    registeredCustomer = getSavedCustomer();

    if (!registeredCustomer ||
        registeredCustomer.phone !== phone) {

        alert("ابتدا یک حساب آزمایشی ایجاد کنید.");

        return;

    }

    pendingCustomer = registeredCustomer;

    authMode = "login";

    startOTP();

}

function startOTP() {

    otpExpiresAt = Date.now() + 120000;

    otpAttempts = 0;

    document.getElementById("otpCode").value = "";

    document.getElementById("otpSummary").textContent =
        "شماره آزمایشی: " + pendingCustomer.phone +
        " | اعتبار رمز: ۲ دقیقه";

    showPage("otp");

}

function verifyOTP() {

    if (!pendingCustomer) {

        showPage("home");

        return;

    }

    if (Date.now() >= otpExpiresAt) {

        alert("اعتبار رمز پایان یافته است.");

        return;

    }

    if (otpAttempts >= 5) {

        alert("لطفاً رمز جدید دریافت کنید.");

        return;

    }

    const code = normalizeDigits(
        document.getElementById("otpCode").value
    );

    otpAttempts++;

    if (code !== DEMO_OTP) {

        alert("رمز واردشده صحیح نیست.");

        return;

    }

    if (authMode === "register") {

        registeredCustomer = pendingCustomer;

        registeredCustomer.id =
            "CUSTOMER-TEST-" +
            Date.now().toString(36).toUpperCase();

    }

    currentCustomer = registeredCustomer;

    currentCustomer.lastLogin =
        new Date().toISOString();

    try {

        if (!createSession(currentCustomer)) {

            alert("ایجاد نشست آزمایشی ناموفق بود.");

            return;

        }

    } catch {

        alert("مرورگر امکان ذخیره نشست را فراهم نمی‌کند.");

        return;

    }

    pendingCustomer = null;

    authMode = "";

    otpExpiresAt = 0;

    otpAttempts = 0;

    document.getElementById("otpCode").value = "";

    renderProfile();

}

function resendOTP() {

    if (!pendingCustomer) {

        showPage("home");

        return;

    }

    startOTP();

    alert("رمز آزمایشی جدید: 123456");

}

function renderProfile() {

    currentCustomer = getCurrentCustomer();

    if (!currentCustomer) {

        alert("ابتدا وارد حساب کاربری شوید.");

        showPage("login");

        return;

    }

    const container =
        document.getElementById("profileContent");

    container.textContent = "";

    const details = [

        ["نام و نام خانوادگی",
            currentCustomer.name],

        ["شماره همراه",
            currentCustomer.phone],

        ["شناسه مشتری",
            currentCustomer.id],

        ["وضعیت حساب",
            "فعال ـ آزمایشی"],

        ["تأیید شماره همراه",
            "شبیه‌سازی شده"],

        ["تاریخ عضویت",
            new Date(currentCustomer.createdAt)
            .toLocaleDateString("fa-IR")],

        ["آخرین ورود",
            new Date(currentCustomer.lastLogin)
            .toLocaleString("fa-IR")]

    ];

    details.forEach(item => {

        const row = document.createElement("p");

        row.textContent =
            item[0] + ": " + item[1];

        container.appendChild(row);

    });

    showPage("profile");

}

function editProfile() {

    currentCustomer = getCurrentCustomer();

    if (!currentCustomer) {

        showPage("login");

        return;

    }

    document.getElementById("editName").value =
        currentCustomer.name;

    showPage("editProfile");

}

function saveProfile() {

    currentCustomer = getCurrentCustomer();

    if (!currentCustomer) {

        showPage("login");

        return;

    }

    const name = document
        .getElementById("editName")
        .value.trim();

    if (!validName(name)) {

        alert("لطفاً نام آزمایشی معتبر وارد کنید.");

        return;

    }

    currentCustomer.name = name;

    try {

        if (!saveCustomer(currentCustomer)) {

            alert("ذخیره تغییرات ناموفق بود.");

            return;

        }

    } catch {

        alert("ذخیره اطلاعات آزمایشی امکان‌پذیر نیست.");

        return;

    }

    alert("تغییرات آزمایشی ذخیره شد.");

    renderProfile();

}

function logoutCustomer() {

    if (!confirm("آیا می‌خواهید از حساب کاربری خارج شوید؟")) {

        return;

    }

    clearSession();

    currentCustomer = null;

    pendingCustomer = null;

    authMode = "";

    otpExpiresAt = 0;

    otpAttempts = 0;

    document.getElementById("profileContent").textContent =
        "اطلاعات حساب کاربری آزمایشی";

    document.getElementById("editName").value = "";

    document.getElementById("otpCode").value = "";

    showPage("home");

    alert("با موفقیت از حساب کاربری خارج شدید.");

}

document.addEventListener("DOMContentLoaded", () => {

    registeredCustomer = getSavedCustomer();

    currentCustomer = getCurrentCustomer();

    const profileButton = document.querySelector(
        '#home button[onclick="showPage(\'profile\')"]'
    );

    if (profileButton) {

        profileButton.onclick = renderProfile;

    }

    if (currentCustomer) {

        renderProfile();

    }

});