var API = "https://fr3dbg-production.up.railway.app";

/* ── TAB SWITCH ── */
function switchTab(tab) {
  document.getElementById("panelLogin").classList.toggle("active",    tab === "login");
  document.getElementById("panelRegister").classList.toggle("active", tab === "register");
  document.getElementById("tabLogin").classList.toggle("active",      tab === "login");
  document.getElementById("tabRegister").classList.toggle("active",   tab === "register");
  hideAlert("loginAlert");
  hideAlert("regAlert");
}

/* ── ALERTS ── */
function showAlert(id, msg, type) {
  var el    = document.getElementById(id);
  var msgEl = document.getElementById(id + "Msg");
  el.className = "alert " + (type || "danger") + " show";
  if (msgEl) msgEl.textContent = msg;
}
function hideAlert(id) {
  document.getElementById(id).classList.remove("show");
}

/* ── FIELD HINTS ── */
function setHint(id, msg, ok) {
  var el = document.getElementById(id);
  el.textContent = msg;
  el.className   = "field-hint show " + (ok ? "ok" : "err");
}
function clearHint(id) {
  document.getElementById(id).className = "field-hint";
}
function setInputState(inputId, state) {
  var el = document.getElementById(inputId);
  if (!el) return;
  el.className = state === true ? "success" : state === false ? "error" : "";
}
function clearFieldErr(inputId) {
  setInputState(inputId, null);
  var hintId = "hint" + inputId.charAt(0).toUpperCase() + inputId.slice(1);
  clearHint(hintId);
}

/* ── PHONE FORMAT: 90 123 45 67 ── */
function formatPhone(el) {
  var digits = el.value.replace(/\D/g, "").slice(0, 9);
  var out = "";
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += " " + digits.slice(5, 7);
  if (digits.length > 7) out += " " + digits.slice(7, 9);
  el.value = out;

  if (digits.length === 9) {
    setInputState("regPhone", true);
    clearHint("hintPhone");
  } else if (digits.length > 0) {
    setInputState("regPhone", false);
    setHint("hintPhone", "9 ta raqam kiriting (masalan: 90 123 45 67)", false);
  } else {
    setInputState("regPhone", null);
    clearHint("hintPhone");
  }
}

/* ── PASSWORD CHECK ── */
function checkPassword() {
  var v = document.getElementById("regPassword").value;
  if (!v) { setInputState("regPassword", null); clearHint("hintPassword"); return; }
  if (v.length < 6) {
    setInputState("regPassword", false);
    setHint("hintPassword", "Parol kamida 6 ta belgi bo'lishi kerak", false);
  } else {
    setInputState("regPassword", true);
    setHint("hintPassword", "Parol yaxshi ✓", true);
  }
}

/* ── USERNAME CHECK ── */
function checkUsername() {
  var v = document.getElementById("regUsername").value.trim();
  if (!v) return;
  if (v.length < 3) {
    setInputState("regUsername", false);
    setHint("hintUsername", "Username kamida 3 ta belgi bo'lishi kerak", false);
  } else {
    setInputState("regUsername", true);
    clearHint("hintUsername");
  }
}

/* ── LOGIN ── */
async function doLogin() {
  var username = document.getElementById("loginUsername").value.trim();
  var password = document.getElementById("loginPassword").value;

  hideAlert("loginAlert");

  if (!username || !password) {
    showAlert("loginAlert", "Barcha maydonlarni to'ldiring", "danger");
    return;
  }

  setLoading("loginBtn", true);

  try {
    var res  = await fetch(API + "/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username: username, password: password })
    });
    var data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token",    data.token);
      localStorage.setItem("userId",   data.userId);
      localStorage.setItem("username", data.username);
      localStorage.setItem("joinedAt", data.joinedAt || new Date().toISOString());
      window.location.href = "../pages/dashboard.html";
    } else {
      showAlert("loginAlert", data.message || "Username yoki parol noto'g'ri", "danger");
    }
  } catch(e) {
    showAlert("loginAlert", "Server bilan bog'lanib bo'lmadi", "danger");
  } finally {
    setLoading("loginBtn", false);
  }
}

/* ── REGISTER ── */
async function doRegister() {
  var username = document.getElementById("regUsername").value.trim();
  var phone    = document.getElementById("regPhone").value.replace(/\D/g, "");
  var password = document.getElementById("regPassword").value;

  hideAlert("regAlert");

  if (!username || !phone || !password) {
    showAlert("regAlert", "Barcha maydonlarni to'ldiring", "warning");
    return;
  }
  if (username.length < 3) {
    showAlert("regAlert", "Username kamida 3 ta belgi bo'lishi kerak", "warning");
    return;
  }
  if (phone.length !== 9) {
    showAlert("regAlert", "Telefon raqamni to'liq kiriting (9 ta raqam)", "warning");
    return;
  }
  if (password.length < 6) {
    showAlert("regAlert", "Parol kamida 6 ta belgi bo'lishi kerak", "warning");
    return;
  }

  setLoading("regBtn", true);

  try {
    var res  = await fetch(API + "/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        username: username,
        phone:    "+998" + phone,
        password: password
      })
    });
    var data = await res.json();

    // Username band bo'lsa — 409 yoki xabar ichida
    if (res.status === 409 ||
        (data.message && /exist|taken|already|mavjud|band/i.test(data.message))) {
      showAlert("regAlert",
        "😅 Oops! Biroz kech qoldingiz — \"" + username + "\" username allaqachon olib bo'lindi. Boshqa nom tanlang!",
        "warning"
      );
      setInputState("regUsername", false);
      setHint("hintUsername", "Bu username band. Boshqasini sinab ko'ring 👇", false);
      document.getElementById("regUsername").focus();
      return;
    }

    if (res.ok && data.token) {
      localStorage.setItem("token",    data.token);
      localStorage.setItem("userId",   data.userId);
      localStorage.setItem("username", data.username);
      localStorage.setItem("joinedAt", new Date().toISOString());
      window.location.href = "../pages/dashboard.html";
    } else {
      showAlert("regAlert", data.message || "Ro'yxatdan o'tishda xato yuz berdi", "danger");
    }
  } catch(e) {
    showAlert("regAlert", "Server bilan bog'lanib bo'lmadi", "danger");
  } finally {
    setLoading("regBtn", false);
  }
}

/* ── LOADING STATE ── */
function setLoading(btnId, on) {
  var btn = document.getElementById(btnId);
  btn.disabled = on;
  btn.classList.toggle("loading", on);
}

/* ── ENTER KEY ── */
document.addEventListener("keydown", function(e) {
  if (e.key !== "Enter") return;
  var loginActive = document.getElementById("panelLogin").classList.contains("active");
  if (loginActive) doLogin(); else doRegister();
});