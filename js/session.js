// ماژول مدیریت نشست آزمایشی کاربران
// Version 7.2

const SESSION_KEY = "legal_platform_demo_session";
const CUSTOMER_KEY = "legal_platform_demo_customer";

function saveCustomer(customer) {

    if (!customer ||
        customer.phone !== "09000000000") {

        return false;

    }

    sessionStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify(customer)
    );

    return true;

}

function getSavedCustomer() {

    try {

        const data = sessionStorage.getItem(
            CUSTOMER_KEY
        );

        const customer = data
            ? JSON.parse(data)
            : null;

        return customer &&
            customer.phone === "09000000000"
            ? customer
            : null;

    } catch {

        return null;

    }

}

function createSession(customer) {

    if (!saveCustomer(customer)) return false;

    const session = {

        customerId: customer.id,

        role: "customer",

        loginAt: Date.now(),

        expiresAt: Date.now() + 3600000,

        demo: true

    };

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

    return true;

}

function getSession() {

    try {

        const data = sessionStorage.getItem(
            SESSION_KEY
        );

        if (!data) return null;

        const session = JSON.parse(data);

        if (session.demo !== true ||
            session.role !== "customer" ||
            !Number.isFinite(session.expiresAt) ||
            Date.now() >= session.expiresAt) {

            clearSession();

            return null;

        }

        return session;

    } catch {

        clearSession();

        return null;

    }

}

function isLoggedIn() {

    const session = getSession();

    const customer = getSavedCustomer();

    return Boolean(
        session &&
        customer &&
        session.customerId === customer.id
    );

}

function getCurrentCustomer() {

    if (!isLoggedIn()) return null;

    return getSavedCustomer();

}

function clearSession() {

    sessionStorage.removeItem(SESSION_KEY);

}

function clearCustomerData() {

    clearSession();

    sessionStorage.removeItem(CUSTOMER_KEY);

}