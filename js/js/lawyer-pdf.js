// ماژول طراحی و چاپ فرم عضویت وکلا
// Version 8.2

function escapeMembershipText(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#39;");

}


function printMembershipPDF(form, confirmation) {

    if (!form || !Array.isArray(form.paragraphs)) {

        alert("فرم درخواست عضویت موجود نیست.");

        return;

    }

    const safe = escapeMembershipText;

    const confirmed = Boolean(

        confirmation &&
        confirmation.confirmed === true

    );

    const confirmationDate = confirmed

        ? new Date(
            confirmation.confirmedAt
          ).toLocaleString("fa-IR")

        : "تأیید نشده";


    let data = {};

    try {

        data = JSON.parse(form.dataSnapshot);

    } catch {

        data = {};

    }


    const details = [

        ["نام و نام خانوادگی", data.name],

        ["کد ملی فرضی", data.nationalCode],

        ["شماره پروانه آزمایشی", data.licenseNumber],

        ["شماره همراه فرضی", data.phone],

        ["استان محل فعالیت", data.workProvince],

        ["شهر محل فعالیت", data.workCity],

        ["سابقه وکالت", data.experience + " سال"],

        ["دانشگاه", data.university],

        ["رشته تحصیلی", data.studyField],

        ["حوزه تخصصی",
            (data.specialties || []).join("، ")]

    ];


    const tableRows = details.map(item => `

        <tr>

            <th>${safe(item[0])}</th>

            <td>${safe(item[1])}</td>

        </tr>

    `).join("");


    const paragraphs = form.paragraphs.map(

        paragraph => `

            <p>${safe(paragraph)}</p>

        `

    ).join("");


    const printWindow = window.open(

        "",

        "_blank"

    );


    if (!printWindow) {

        alert(

            "مرورگر اجازه باز کردن صفحه چاپ را نداد."

        );

        return;

    }


    printWindow.document.open();

    printWindow.document.write(`

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1">

<title>فرم درخواست عضویت و همکاری</title>

<style>

@page {

    size: A4;

    margin: 20mm;

}

* {

    box-sizing: border-box;

}

body {

    direction: rtl;

    font-family: Tahoma, Arial, sans-serif;

    font-size: 14pt;

    line-height: 1.9;

    color: #222;

    background: white;

    margin: 0;

}

.header {

    text-align: center;

    border-bottom: 3px solid #b89b52;

    padding-bottom: 20px;

    margin-bottom: 25px;

}

.logo {

    font-size: 36pt;

    color: #183153;

}

.platformName {

    font-size: 22pt;

    font-weight: bold;

    color: #183153;

}

.subtitle {

    font-size: 13pt;

    color: #555;

}

h1 {

    font-size: 20pt;

    text-align: center;

    color: #183153;

    margin: 25px 0;

}

h2 {

    font-size: 16pt;

    color: #183153;

    border-right: 5px solid #b89b52;

    padding-right: 12px;

    margin-top: 30px;

    break-after: avoid;

}

p {

    text-align: right;

    margin: 12px 0;

    overflow-wrap: anywhere;

    orphans: 3;

    widows: 3;

}

table {

    width: 100%;

    border-collapse: collapse;

    margin: 20px 0;

    font-size: 13pt;

}

th, td {

    border: 1px solid #aaa;

    padding: 12px;

    text-align: right;

    overflow-wrap: anywhere;

}

th {

    width: 38%;

    background: #edf1f6;

    color: #183153;

}

tr {

    break-inside: avoid;

}

.metadata {

    border: 1px solid #bbb;

    padding: 15px;

    font-size: 12pt;

    overflow-wrap: anywhere;

}

.confirmation {

    border: 2px solid #183153;

    padding: 20px;

    margin-top: 30px;

    border-radius: 8px;

    break-inside: avoid;

}

.demoNotice {

    border: 1px solid #b89b52;

    background: #faf6eb;

    padding: 12px;

    margin: 20px 0;

    font-size: 12pt;

}

.footer {

    margin-top: 30px;

    border-top: 2px solid #b89b52;

    padding-top: 15px;

    text-align: center;

    font-size: 11pt;

    color: #666;

}

.printButton {

    display: block;

    width: 100%;

    padding: 15px;

    margin-bottom: 25px;

    background: #183153;

    color: white;

    border: none;

    border-radius: 8px;

    font-size: 16px;

    cursor: pointer;

}

@media screen {

    body {

        max-width: 794px;

        margin: 0 auto;

        padding: 20px;

    }

}

@media print {

    .printButton {

        display: none;

    }

    body {

        padding: 0;

    }

    * {

        -webkit-print-color-adjust: exact;

        print-color-adjust: exact;

    }

}

</style>

</head>

<body>

<button class="printButton"
onclick="window.print()">

ذخیره به‌صورت PDF / چاپ فرم

</button>

<div class="header">

    <div class="logo">⚖</div>

    <div class="platformName">

        پلتفرم خدمات حقوقی

    </div>

    <div class="subtitle">

        سامانه عضویت و احراز صلاحیت وکلا

    </div>

</div>

<h1>

فرم درخواست عضویت و همکاری

</h1>

<div class="metadata">

    <p>

        شماره اختصاصی فرم:

        ${safe(form.id)}

    </p>

    <p>

        نسخه فرم:

        ${safe(form.version)}

    </p>

    <p>

        تاریخ تولید:

        ${safe(
            new Date(form.createdAt)
            .toLocaleString("fa-IR")
        )}

    </p>

</div>

<div class="demoNotice">

این سند نمونه آزمایشی است و فاقد اعتبار
قراردادی و امضای الکترونیکی معتبر است.

</div>

<h2>

بخش اول ـ مشخصات متقاضی

</h2>

<table>

    ${tableRows}

</table>

<h2>

بخش دوم ـ درخواست عضویت و تعهدات

</h2>

${paragraphs}

<h2>

بخش سوم ـ وضعیت تأیید الکترونیکی

</h2>

<div class="confirmation">

    <p>

        نام متقاضی:

        ${safe(data.name)}

    </p>

    <p>

        وضعیت فرم:

        ${confirmed

            ? "تأیید آزمایشی شده"

            : "پیش‌نویس تأییدنشده"

        }

    </p>

    <p>

        تاریخ و ساعت تأیید:

        ${safe(confirmationDate)}

    </p>

    <p>

        روش تأیید:

        ${confirmed

            ? "تأیید الکترونیکی آزمایشی"

            : "هنوز تأیید نشده است"

        }

    </p>

</div>

<div class="footer">

    پلتفرم خدمات حقوقی

    <br>

    سامانه اختصاصی وکلا

    <br>

    سند آزمایشی ـ نسخه V8.2

</div>

</body>

</html>

    `);

    printWindow.document.close();

    printWindow.focus();

}