const form = document.getElementById('contact-form');
const departmentSelect = document.getElementById('department');

const departmentEmails = {
events: "events@stjohnschurchcommunity.org",
enquiries: "enquiries@stjohnschurchcommunity.org",
church: "church@stjohnschurchcommunity.org",
safeguarding: "safeguarding@stjohnschurchcommunity.org",
};

form.addEventListener('submit', function (e) {
const department = departmentSelect.value;

if (!department || !departmentEmails[department]) {
    alert("Please select a valid department.");
    e.preventDefault();
    return;
}

// Set the correct action dynamically before submitting
form.action = `https://formsubmit.co/${encodeURIComponent(departmentEmails[department])}`;
});