// توابع مشترک پلتفرم خدمات حقوقی
// Version 6.4

function showPage(id) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    window.scrollTo(0, 0);

}

function goCustomer() {

    window.location.href = "customer.html?v=6.4";

}

function goLawyer() {

    window.location.href = "lawyer.html?v=6.4";

}

function goHome() {

    window.location.href = "index.html?v=6.4";

}

function money(amount) {

    return amount.toLocaleString("fa-IR") + " تومان";

}

function isVerified(lawyer) {

    return lawyer.experience >= 5 &&
        [
            "کارشناسی ارشد حقوق",
            "دکتری حقوق"
        ].includes(lawyer.degree) &&
        lawyer.cases >= 150 &&
        !lawyer.disciplinary;

}

function statusText(lawyer) {

    if (lawyer.status === "online") {

        return '<span class="online">● آماده مشاوره</span>';

    }

    if (lawyer.status === "busy") {

        return '<span class="busy">● در حال مشاوره</span>';

    }

    return '<span class="offline">● آفلاین ـ امکان رزرو</span>';

}

function comingSoon() {

    alert("این بخش در نسخه‌های بعدی فعال خواهد شد.");

}