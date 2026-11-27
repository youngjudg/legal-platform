// ماژول رزرو و نوبت‌دهی مشاوره
// Version 6.4

function chooseLawyer(id) {

    const lawyer = lawyers.find(l => l.id === id);

    if (!lawyer) return;

    clearInterval(timerInterval);

    sessionActive = false;

    selectedLawyer = lawyer;

    request.status = "در انتظار پرداخت";
    request.amount = getPrice(selectedLawyer);
    request.commission = null;
    request.lawyerShare = null;
    request.refundAmount = 0;

    delete request.review;

    trackingCode = "";
    booking = "";
    immediate = false;

    document.getElementById("bookingSummary").innerHTML = `

        <strong>${selectedLawyer.name}</strong>

        <br>

        ${statusText(selectedLawyer)}

        <br>

        موضوع: ${topic}

        <br>

        نوع مشاوره: ${type}

        <br>

        مدت مشاوره: ۳۰ دقیقه

        <br>

        هزینه: ${money(request.amount)}

    `;

    document.getElementById("instantOption").style.display =
        selectedLawyer.status === "online"
        ? "block"
        : "none";

    const now = new Date();

    const today = new Date(
        now.getTime() -
        now.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);

    const dateInput =
        document.getElementById("bookingDate");

    dateInput.min = today;
    dateInput.value = today;

    showPage("booking");

}

function instantBooking() {

    if (!selectedLawyer) return;

    if (selectedLawyer.status !== "online") {

        alert("وکیل در حال حاضر آماده مشاوره فوری نیست.");

        return;

    }

    immediate = true;

    booking = "مشاوره فوری";

    createInvoice();

}

function reserveBooking() {

    if (!selectedLawyer) return;

    const date =
        document.getElementById("bookingDate").value;

    const time =
        document.getElementById("bookingTime").value;

    if (!date) {

        alert("لطفاً تاریخ مشاوره را انتخاب کنید.");

        return;

    }

    if (!time) {

        alert("لطفاً ساعت مشاوره را انتخاب کنید.");

        return;

    }

    const appointment =
        new Date(date + "T" + time);

    if (Number.isNaN(appointment.getTime())) {

        alert("تاریخ یا ساعت انتخاب‌شده معتبر نیست.");

        return;

    }

    if (appointment <= new Date()) {

        alert("لطفاً زمانی در آینده انتخاب کنید.");

        return;

    }

    immediate = false;

    booking =
        appointment.toLocaleDateString("fa-IR") +
        " ساعت " + time;

    createInvoice();

}