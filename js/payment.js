// ماژول پرداخت و مدیریت تراکنش‌ها
// Version 6.4

function createInvoice() {

    if (!selectedLawyer || !booking) return;

    request.status = "در انتظار پرداخت";

    document.getElementById("invoiceContent").innerHTML = `

        وکیل: ${selectedLawyer.name}

        <br>

        موضوع: ${topic}

        <br>

        نوع مشاوره: ${type}

        <br>

        زمان: ${booking}

        <br>

        مدت مشاوره: ۳۰ دقیقه

        <br>

        <hr>

        <strong>
            مبلغ قابل پرداخت:
            ${money(request.amount)}
        </strong>

    `;

    document.getElementById("paymentAmount").textContent =
        "مبلغ آزمایشی: " + money(request.amount);

    document.getElementById("acceptRules").checked = false;

    updatePayment();

    showPage("invoice");

}

function updatePayment() {

    document.getElementById("payButton").disabled =
        !document.getElementById("acceptRules").checked;

}

function paymentSuccess() {

    if (!selectedLawyer || !booking) return;

    if (!document.getElementById("acceptRules").checked) {

        alert("لطفاً ابتدا شرایط مشاوره را بپذیرید.");

        return;

    }

    if (trackingCode) return;

    trackingCode =
        "TEST-" + Date.now().toString(36).toUpperCase();

    request.status =
        immediate ? "پرداخت موفق" : "رزرو شده";

    request.paidAt = new Date().toISOString();

    request.trackingCode = trackingCode;

    request.refundAmount = 0;

    document.getElementById("receiptContent").innerHTML = `

        کد پیگیری:

        <strong dir="ltr">${trackingCode}</strong>

        <br>

        وکیل: ${selectedLawyer.name}

        <br>

        موضوع: ${topic}

        <br>

        نوع مشاوره: ${type}

        <br>

        زمان: ${booking}

        <br>

        مدت مشاوره: ۳۰ دقیقه

        <br>

        مبلغ آزمایشی: ${money(request.amount)}

        <br>

        تاریخ ثبت:
        ${new Date().toLocaleString("fa-IR")}

        <br>

        وضعیت: ${request.status}

    `;

    const roomButton =
        document.getElementById("roomButton");

    roomButton.disabled = !immediate;

    roomButton.textContent =
        immediate
        ? "ورود به اتاق مشاوره"
        : "در انتظار زمان رزرو";

    showPage("receipt");

}

function paymentFailure() {

    if (!selectedLawyer || !booking || trackingCode) return;

    request.status = "پرداخت ناموفق";

    showPage("failed");

}

function cancelRequest() {

    if (trackingCode || sessionActive) {

        alert("لغو درخواست پس از پرداخت در این نسخه فعال نیست.");

        return;

    }

    if (!confirm("آیا از لغو درخواست اطمینان دارید؟")) {

        return;

    }

    clearInterval(timerInterval);

    sessionActive = false;

    request.status = "لغو شده";
    request.amount = 0;
    request.commission = null;
    request.lawyerShare = null;
    request.refundAmount = 0;

    delete request.paidAt;
    delete request.trackingCode;
    delete request.review;

    selectedLawyer = null;
    booking = "";
    trackingCode = "";
    immediate = false;
    deadline = 0;

    document.getElementById("acceptRules").checked = false;

    updatePayment();

    showPage("home");

}