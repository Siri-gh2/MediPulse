// signin.js - simplified: accept any credentials and redirect

const url = "https://pococare-assignment.vercel.app/"; // not used for now
const backendURL = "https://pococare1.onrender.com/"; // not used (kept for future)

const spinner = document.getElementById("spinner");

document.querySelector("#signup").addEventListener("click", () => {
  window.location.href = `./signup.html`;
});

document.querySelector("#index h1").addEventListener("click", () => {
  window.location.href = `../index.html`;
});

// admin
document.querySelector("#admin").addEventListener("click", () => {
  window.location.href = `./admin.html`;
});

document.querySelector("#home").addEventListener("click", () => {
  window.location.href = `../index.html`;
});

const patientForm = document.querySelector(".patient");
if (patientForm) {
  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // show spinner for a very short time to simulate action
    if (spinner) spinner.removeAttribute("hidden");

    let enteredEmail = document.getElementById("patientEmail").value.trim();
    let enteredPass = document.getElementById("patientPassword").value.trim();

    if (enteredEmail === "" || enteredPass === "") {
      if (spinner) spinner.setAttribute("hidden", "");
      return alert("Enter all the fields");
    }

    // Simulate "validation" delay (100-300ms) then succeed
    setTimeout(() => {
      // create fake token & id & name for localStorage
      const fakeToken = "fake-token-" + Date.now();
      const fakeId = "patient-" + Math.floor(Math.random() * 100000);
      const fakeName = enteredEmail.split("@")[0] || "Patient";

      localStorage.setItem("token", fakeToken);
      localStorage.setItem("name", fakeName);
      localStorage.setItem("id", fakeId);

      if (spinner) spinner.setAttribute("hidden", "");
      alert("Login successful (demo)");
      // clear inputs (optional)
      document.getElementById("patientEmail").value = "";
      document.getElementById("patientPassword").value = "";

      window.location.href = `./patientdashboard.html`;
    }, 150);
  });
}

const doctorForm = document.querySelector(".doctor");
if (doctorForm) {
  doctorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (spinner) spinner.removeAttribute("hidden");

    let enteredEmail = document.getElementById("doctorEmail").value.trim();
    let enteredPass = document.getElementById("doctorPassword").value.trim();

    if (enteredEmail === "" || enteredPass === "") {
      if (spinner) spinner.setAttribute("hidden", "");
      return alert("Enter all the fields");
    }

    setTimeout(() => {
      const fakeToken = "fake-token-" + Date.now();
      const fakeId = "doctor-" + Math.floor(Math.random() * 100000);
      const fakeName = enteredEmail.split("@")[0] || "Doctor";

      localStorage.setItem("token", fakeToken);
      localStorage.setItem("name", fakeName);
      localStorage.setItem("id", fakeId);

      if (spinner) spinner.setAttribute("hidden", "");
      alert("Login successful (demo)");
      document.getElementById("doctorEmail").value = "";
      document.getElementById("doctorPassword").value = "";

      window.location.href = `./doctordashboard.html`;
    }, 150);
  });
}
