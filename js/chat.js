// ماژول اتاق اختصاصی مشاوره
// Version 6.4

function enterRoom() {

    if (!selectedLawyer || !immediate || !trackingCode) return;

    if (request.status === "تکمیل شده") return;

    if (sessionActive) {

        showPage("room");

        return;

    }

    request.status = "در حال مشاوره";

    request.startedAt = new Date().toISOString();

    document.getElementById("roomContent").innerHTML = `

        <strong>${selectedLawyer.name}</strong>

        ${isVerified(selectedLawyer)
            ? '<span class="blue">✔ ممتاز</span>'
            : ""}

        <br>

        تخصص: ${selectedLawyer.specialties.join("، ")}

        <br>

        موضوع: ${topic}

        <br>

        نوع مشاوره: ${type}

        <br>

        کد پیگیری: ${trackingCode}

    `;

    document.getElementById("chatBox").textContent = "";

    document.getElementById("messageInput").value = "";

    document.getElementById("messageInput").disabled = false;

    document.getElementById("sendButton").disabled = false;

    document.getElementById("attachButton").disabled = false;

    sessionActive = true;

    deadline = Date.now() + 30 * 60 * 1000;

    request.duration = 30;

    addMessage(
        "پاسخ خودکار آزمایشی: به اتاق اختصاصی مشاوره خوش آمدید.",
        "lawyer"
    );

    clearInterval(timerInterval);

    timerInterval = setInterval(updateTimer, 1000);

    updateTimer();

    showPage("room");

}

function updateTimer() {

    if (!sessionActive) return;

    const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000)
    );

    const minutes = Math.floor(remaining / 60);

    const seconds = remaining % 60;

    document.getElementById("timer").textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

    document.getElementById("timeWarning").hidden =
        remaining > 300;

    if (remaining === 0) {

        endSession();

    }

}

function addMessage(text, sender) {

    const box = document.getElementById("chatBox");

    const message = document.createElement("div");

    message.className =
        "message " +
        (sender === "user"
            ? "userMessage"
            : "lawyerMessage");

    const content = document.createElement("div");

    content.textContent = text;

    message.appendChild(content);

    const time = document.createElement("div");

    time.className = "messageTime";

    time.textContent = new Date().toLocaleTimeString(
        "fa-IR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    message.appendChild(time);

    box.appendChild(message);

    box.scrollTop = box.scrollHeight;

}

function sendMessage() {

    if (!sessionActive || Date.now() >= deadline) return;

    const input =
        document.getElementById("messageInput");

    const text = input.value.trim();

    if (!text) return;

    if (text.length > 5000) {

        alert("حداکثر طول هر پیام ۵۰۰۰ کاراکتر است.");

        return;

    }

    addMessage(text, "user");

    input.value = "";

    addMessage(
        "پاسخ خودکار آزمایشی: پیام شما ثبت شد.",
        "lawyer"
    );

}

function sendAttachment() {

    const input =
        document.getElementById("attachment");

    const file = input.files[0];

    if (!sessionActive ||
        Date.now() >= deadline ||
        !file) {

        input.value = "";

        return;

    }

    if (!file.type.startsWith("image/") &&
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")) {

        alert("فقط تصویر یا فایل PDF آزمایشی انتخاب کنید.");

        input.value = "";

        return;

    }

    if (file.size > 10 * 1024 * 1024) {

        alert("حداکثر حجم فایل آزمایشی ۱۰ مگابایت است.");

        input.value = "";

        return;

    }

    addMessage(
        "📎 فایل انتخاب‌شده: " + file.name,
        "user"
    );

    addMessage(
        "فقط نام فایل نمایش داده شد. فایل به سرور ارسال نشده است.",
        "lawyer"
    );

    input.value = "";

}

function testCall(callType) {

    if (!sessionActive || Date.now() >= deadline) return;

    alert(
        "تماس " + callType +
        " آزمایشی است و ارتباط واقعی برقرار نمی‌شود."
    );

}

function extendTime(minutes) {

    if (!sessionActive || Date.now() >= deadline) return;

    if (![15, 30].includes(minutes)) return;

    deadline += minutes * 60 * 1000;

    request.duration += minutes;

    addMessage(
        "تمدید آزمایشی مشاوره به مدت " +
        minutes +
        " دقیقه.",
        "lawyer"
    );

    updateTimer();

    showPage("room");

}

function finishConsultation() {

    if (!sessionActive) return;

    if (confirm("آیا می‌خواهید مشاوره پایان یابد؟")) {

        endSession();

    }

}

function endSession() {

    if (!sessionActive) return;

    clearInterval(timerInterval);

    timerInterval = null;

    sessionActive = false;

    request.status = "تکمیل شده";

    request.endedAt = new Date().toISOString();

    document.getElementById("messageInput").disabled = true;

    document.getElementById("sendButton").disabled = true;

    document.getElementById("attachButton").disabled = true;

    rating = 0;

    setRating(0);

    document.getElementById("reviewText").value = "";

    showPage("review");

}