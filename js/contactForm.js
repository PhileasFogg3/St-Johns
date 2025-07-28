const form = document.getElementById('contact-form');
const departmentSelect = document.getElementById('department');

const departmentEmails = {
events: "events@example.com",
bookings: "bookings@example.com",
church: "church@example.com",
test: "philip.beswick@hotmail.com"
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