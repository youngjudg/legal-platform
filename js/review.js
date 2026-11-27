// ماژول امتیازدهی و ثبت نظرات مشتریان
// Version 6.4

function setRating(value) {

    if (!Number.isInteger(value) ||
        value < 0 ||
        value > 5) return;

    rating = value;

    document.querySelectorAll(".stars button")
        .forEach((button, index) => {

            button.classList.toggle(
                "selected",
                index < value
            );

            button.setAttribute(
                "aria-pressed",
                String(index < value)
            );

        });

    const descriptions = {
        1: "بسیار ضعیف",
        2: "ضعیف",
        3: "متوسط",
        4: "خوب",
        5: "عالی"
    };

    document.getElementById("ratingText").textContent =
        value
        ? "امتیاز انتخاب‌شده: " +
          value +
          " از ۵ ـ " +
          descriptions[value]
        : "";

}

function submitReview() {

    if (request.status !== "تکمیل شده") return;

    if (!selectedLawyer || !trackingCode) return;

    if (request.review) {

        alert("نظر شما قبلاً ثبت شده است.");

        return;

    }

    if (rating < 1 || rating > 5) {

        alert("لطفاً امتیاز خود را انتخاب کنید.");

        return;

    }

    const reviewText =
        document.getElementById("reviewText")
        .value.trim();

    if (reviewText.length > 1000) {

        alert("حداکثر طول نظر ۱۰۰۰ کاراکتر است.");

        return;

    }

    request.review = {

        lawyerId: selectedLawyer.id,

        trackingCode: trackingCode,

        rating: rating,

        text: reviewText,

        createdAt: new Date().toISOString(),

        status: "آزمایشی"

    };

    showPage("completed");

}