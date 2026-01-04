const loginBtn = document.getElementById("loginBtn");

document.getElementById("notificationBtn").onclick = () => {
    window.location.href = "notifications.html";
};

// login state = token existence
const token = localStorage.getItem("token");

if (token) {
    loginBtn.innerText = "Profile";
} else {
    loginBtn.innerText = "Login";
}

loginBtn.addEventListener("click", () => {
    if (token) {
        window.location.href = "profile.html";
    } else {
        window.location.href = "login.html";
    }
});

//real users
const profilesContainer = document.getElementById("profiles");

// fetch users

let myUserId = null;

// STEP 1: If logged in, get my user ID
async function getMyId() {
    if (!token) return null;

    try {
        const res = await fetch("http://socialportfolio-backend.onrender.com/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();
        if (data.success) {
            return data.user._id;
        }
    } catch (err) {
        console.error(err);
    }

    return null;
}

// STEP 2: Load users and filter
async function loadUsers() {
    myUserId = await getMyId();

    const res = await fetch("http://socialportfolio-backend.onrender.com/users");
    const data = await res.json();

    if (!data.success) return;

    profilesContainer.innerHTML = "";

    data.users.forEach(user => {
        // hide my own profile
        if (myUserId && user._id === myUserId) return;

        const card = document.createElement("div");
        card.className = "profile-card";

        const name = document.createElement("h3");
        name.innerText = user.username;

        const viewBtn = document.createElement("button");
        viewBtn.innerText = "View Profile";

        viewBtn.addEventListener("click", () => {
            window.location.href = `user.html?id=${user._id}`;
        });

        card.appendChild(name);
        card.appendChild(viewBtn);
        profilesContainer.appendChild(card);
    });
}

// run
loadUsers();

// search functionality
const searchInput = document.getElementById("searchInput");

let debounceTimer = null;

// get my id if logged in (for hiding self)
async function getMyId() {
    if (!token) return null;

    const res = await fetch("http://socialportfolio-backend.onrender.com/me", {
        headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    return data.success ? data.user._id : null;
}

// load users (with optional search)
async function loadUsers(searchText = "") {
    const url = searchText
        ? `http://socialportfolio-backend.onrender.com/users?search=${encodeURIComponent(searchText)}`
        : `http://socialportfolio-backend.onrender.com/users`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) return;

    profilesContainer.innerHTML = "";

    if (data.users.length === 0) {
        profilesContainer.innerHTML = "<p>No users found</p>";
        return;
    }

    data.users.forEach(user => {
        if (myUserId && user._id === myUserId) return;

        const card = document.createElement("div");
        card.className = "profile-card";

        const name = document.createElement("h3");
        name.innerText = user.username;

        const viewBtn = document.createElement("button");
        viewBtn.innerText = "View Profile";
        viewBtn.onclick = () => {
            window.location.href = `user.html?id=${user._id}`;
        };

        card.appendChild(name);
        card.appendChild(viewBtn);
        profilesContainer.appendChild(card);
    });
}

// debounce handler
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        const value = searchInput.value.trim();
        loadUsers(value);
    }, 400); // ⏳ debounce delay
});

// INIT
(async function init() {
    myUserId = await getMyId();
    loadUsers();
})();
