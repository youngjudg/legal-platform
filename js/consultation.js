// ماژول مدیریت مشاوره حقوقی
// Version 6.4

let topic = "";
let type = "";
let selectedLawyer = null;
let booking = "";
let trackingCode = "";
let immediate = false;
let timerInterval = null;
let deadline = 0;
let sessionActive = false;
let rating = 0;

const request = {
    status: "",
    amount: 0,
    commission: null,
    lawyerShare: null,
    refundAmount: 0
};

function getPrice(lawyer) {

    if (type === "صوتی") {
        return lawyer.price + 100000;
    }

    if (type === "تصویری") {
        return lawyer.price + 200000;
    }

    return lawyer.price;

}

function initializeTopics() {

    const container = document.getElementById("topicList");

    container.textContent = "";

    topics.forEach(t => {

        const button = document.createElement("button");

        button.textContent = t;

        button.onclick = () => selectTopic(t);

        container.appendChild(button);

    });

}

function selectTopic(t) {

    topic = t;

    document.getElementById("topicText").textContent =
        "موضوع انتخاب‌شده: " + topic;

    showPage("types");

}

function selectType(t) {

    type = t;

    document.getElementById("consultationSummary").textContent =
        "موضوع: " + topic + " | نوع مشاوره: " + type;

    renderLawyers();

    showPage("lawyers");

}

function renderLawyers() {

    let list = lawyers.filter(l =>
        l.specialties.includes(topic)
    );

    const status = document.getElementById("status").value;
    const verified = document.getElementById("verified").value;
    const city = document.getElementById("city").value;
    const sort = document.getElementById("sort").value;

    if (status !== "all") {
        list = list.filter(l => l.status === status);
    }

    if (verified === "yes") {
        list = list.filter(isVerified);
    }

    if (city !== "all") {
        list = list.filter(l => l.city === city);
    }

    if (sort === "cheap") {
        list.sort((a, b) => getPrice(a) - getPrice(b));
    }

    if (sort === "expensive") {
        list.sort((a, b) => getPrice(b) - getPrice(a));
    }

    if (sort === "experience") {
        list.sort((a, b) => b.experience - a.experience);
    }

    if (sort === "rating") {
        list.sort((a, b) => b.rating - a.rating);
    }

    document.getElementById("lawyerList").innerHTML =
        list.map(l => `

        <div class="card">

            <div class="avatar">⚖</div>

            <h3>
                ${l.name}
                ${isVerified(l)
                    ? '<span class="blue">✔ ممتاز</span>'
                    : ""}
            </h3>

            ${statusText(l)}

            <br>

            📍 ${l.city}

            <br>

            سابقه: ${l.experience} سال

            <br>

            مدرک: ${l.degree}

            <br>

            تخصص: ${l.specialties.join("، ")}

            <br>

            <span class="rating">
                ⭐ ${l.rating} از ۵
            </span>

            <br>

            تعداد مشاوره: ${l.consultations}

            <br>

            مدت مشاوره: ۳۰ دقیقه

            <br>

            <strong>
                تعرفه: ${money(getPrice(l))}
            </strong>

            <button onclick="showProfile(${l.id})">
                مشاهده رزومه کامل
            </button>

            <button class="primary"
                onclick="chooseLawyer(${l.id})">
                انتخاب وکیل
            </button>

        </div>

        `).join("") ||

        '<p class="description">وکیلی مطابق فیلترها یافت نشد.</p>';

}

function showProfile(id) {

    const l = lawyers.find(x => x.id === id);

    if (!l) return;

    document.getElementById("profileContent").innerHTML = `

        <div class="card">

            <div class="avatar">⚖</div>

            <h3>
                ${l.name}
                ${isVerified(l)
                    ? '<span class="blue">✔ ممتاز</span>'
                    : ""}
            </h3>

            <div class="notice">
                اطلاعات آزمایشی و فرضی
            </div>

            ${statusText(l)}

            <br>

            شماره پروانه: آزمایشی-${l.id}

            <br>

            محل فعالیت: ${l.city}

            <br>

            مدرک تحصیلی: ${l.degree}

            <br>

            سابقه وکالت: ${l.experience} سال

            <br>

            تعداد پرونده‌ها: ${l.cases}

            <br>

            تعداد مشاوره‌ها: ${l.consultations}

            <br>

            محکومیت انتظامی:
            ${l.disciplinary ? "دارد" : "ندارد"} (فرضی)

            <br>

            حوزه تخصص:
            ${l.specialties.join("، ")}

            <br>

            امتیاز: ${l.rating} از ۵

            <br>

            وکیل ممتاز:
            ${isVerified(l) ? "بله" : "خیر"}

            <br>

            تعرفه: ${money(getPrice(l))}

            <button class="primary"
                onclick="chooseLawyer(${l.id})">
                انتخاب این وکیل
            </button>

        </div>

    `;

    showPage("profile");

}

document.addEventListener(
    "DOMContentLoaded",
    initializeTopics
);