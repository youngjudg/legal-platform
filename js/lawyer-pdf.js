// Membership PDF Module
// Version 8.2

function escapeMembershipText(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


function printMembershipPDF(
    form,
    confirmation
) {

    if (!form ||
        !Array.isArray(form.paragraphs)) {

        alert("فرم عضویت موجود نیست.");

        return;

    }

    let data = {};

    try {

        data = JSON.parse(form.dataSnapshot);

    } catch {

        data = {};

    }

    const confirmed =
        confirmation?.confirmed === true;

    const confirmationDate = confirmed

        ? new Date(
            confirmation.confirmedAt
          ).toLocaleString("fa-IR")

        : "هنوز تأیید نشده است";


    const rows = [

        ["نام و نام خانوادگی", data.name],

        ["کد ملی فرضی", data.nationalCode],

        ["شماره پروانه آزمایشی", data.licenseNumber],

        ["شماره همراه فرضی", data.phone],

        ["استان محل فعالیت", data.workProvince],

        ["شهر محل فعالیت", data.workCity],

        ["سابقه وکالت", data.experience + " سال"],

        ["دانشگاه", data.university],

        ["رشته تحصیلی", data.studyField],

        ["حوزه‌های تخصصی",

            Array.isArray(data.specialties)

                ? data.specialties.join("، ")

                : ""

        ]

    ];


    const tableRows = rows.map(row => `

        <tr>

            <th>
                ${escapeMembershipText(row[0])}
            </th>

            <td>
                ${escapeMembershipText(row[1])}
            </td>

        </tr>

    `).join("");


    const paragraphs = form.paragraphs.map(

        paragraph => `

            <p>
                ${escapeMembershipText(paragraph)}
            </p>

        `

    ).join("");


    const printWindow = window.open(

        "",

        "_blank"

    );


    if (!printWindow) {

        alert(

            "مرورگر اجازه باز شدن صفحه چاپ را نمی‌دهد."

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

    margin: 0;

    background: #ffffff;

    color: #222222;

    font-family: Tahoma, Arial, sans-serif;

    font-size: 14pt;

    line-height: 1.9;

    direction: rtl;

    text-align: right;

}

.document {

    max-width: 794px;

    margin: auto;

    padding: 20px;

}

.header {

    text-align: center;

    color: #183153;

    border-bottom: 4px solid #c5a059;

    padding-bottom: 18px;

    margin-bottom: 20px;

}

.logo {

    font-size: 42pt;

    color: #183153;

}

.platformName {

    font-size: 20pt;

    font-weight: bold;

}

h1 {

    font-size: 20pt;

    color: #183153;

    text-align: center;

    margin: 20px 0;

}

h2 {

    font-size: 16pt;

    color: #183153;

}

.metadata {

    font-size: 12pt;

    background: #f4f6f9;

    border: 1px solid #d5dce5;

    padding: 12px;

    margin: 20px 0;

    overflow-wrap: anywhere;

}

.notice {

    background: #fff8e5;

    border: 1px solid #c5a059;

    padding: 12px;

    font-size: 12pt;

    margin: 15px 0;

}

table {

    width: 100%;

    border-collapse: collapse;

    margin: 20px 0;

    font-size: 13pt;

}

th, td {

    border: 1px solid #b8c1cd;

    padding: 10px;

    text-align: right;

    vertical-align: top;

    overflow-wrap: anywhere;

}

th {

    width: 40%;

    background: #edf1f6;

    color: #183153;

}

tr {

    break-inside: avoid;

    page-break-inside: avoid;

}

p {

    margin: 10px 0;

    overflow-wrap: anywhere;

    orphans: 3;

    widows: 3;

}

.confirmation {

    margin-top: 25px;

    border: 2px solid #183153;

    padding: 15px;

    background: #f4f6f9;

    break-inside: avoid;

    page-break-inside: avoid;

}

.footer {

    border-top: 2px solid #c5a059;

    margin-top: 30px;

    padding-top: 15px;

    font-size: 11pt;

    text-align: center;

    color: #555555;

}

.printButton {

    display: block;

    width: 100%;

    padding: 15px;

    margin: 20px 0;

    border: none;

    border-radius: 8px;

    background: #183153;

    color: white;

    font-size: 16px;

    cursor: pointer;

}

@media print {

    .printButton {

        display: none !important;

    }

    .document {

        max-width: none;

        padding: 0;

    }

    body {

        -webkit-print-color-adjust: exact;

        print-color-adjust: exact;

    }

}

</style>

</head>

<body>

<div class="document">

<button class="printButton"
onclick="window.print()">

📥 ذخیره به‌صورت PDF / چاپ فرم

</button>

<div class="header">

<div class="logo">⚖</div>

<div class="platformName">

پلتفرم خدمات حقوقی

</div>

<div>

سامانه ثبت‌نام و احراز صلاحیت وکلا

</div>

</div>

<h1>

فرم درخواست عضویت و همکاری

</h1>

<div class="metadata">

<div>

شماره اختصاصی فرم:

${escapeMembershipText(form.id)}

</div>

<div>

نسخه فرم:

${escapeMembershipText(form.version)}

</div>

<div>

تاریخ تولید:

${escapeMembershipText(

    new Date(form.createdAt)
    .toLocaleString("fa-IR")

)}

</div>

</div>

<div class="notice">

این سند صرفاً نمونه آزمایشی است
و فاقد اعتبار قراردادی و حقوقی است.

</div>

<h2>مشخصات متقاضی عضویت</h2>

<table>

<tbody>

${tableRows}

</tbody>

</table>

<h2>متن درخواست و تعهدات متقاضی</h2>

${paragraphs}

<div class="confirmation">

<h2>وضعیت تأیید الکترونیکی فرم</h2>

<p>

وضعیت:

${confirmed

    ? "تأیید آزمایشی شده"

    : "تأیید نشده"

}

</p>

<p>

تاریخ تأیید:

${escapeMembershipText(confirmationDate)}

</p>

<p>

روش تأیید: تأیید الکترونیکی آزمایشی

</p>

<p>

این تأیید، امضای الکترونیکی معتبر
محسوب نمی‌شود.

</p>

</div>

<div class="footer">

پلتفرم خدمات حقوقی

<br>

سند تولیدشده توسط سامانه ثبت‌نام وکلا

<br>

نسخه آزمایشی V8.2

</div>

</div>

</body>

</html>

    `);

    printWindow.document.close();

    printWindow.focus();

}