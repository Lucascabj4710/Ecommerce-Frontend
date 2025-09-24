document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    const profileForm = document.getElementById("profileForm");
    const message = document.getElementById("message");
    const logoutBtn = document.getElementById("logoutBtn");

    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    const formInputs = profileForm.querySelectorAll("input");

    const username = parseJwt(token).sub;

    const setEditMode = () => {
        formInputs.forEach(input => input.readOnly = false);
        editBtn.style.display = "none";
        saveBtn.style.display = "block";
        cancelBtn.style.display = "block";
        document.getElementById("name").focus();
    };

    const setReadOnlyMode = () => {
        formInputs.forEach(input => input.readOnly = true);
        editBtn.style.display = "block";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
        message.textContent = "";
    };

    async function loadProfile() {
        try {
            const response = await fetch(`http://localhost:8080/client/getUserActive/${username}`, { headers });
            if (!response.ok) throw new Error("No se pudieron obtener los datos");

            const user = await response.json();

            document.getElementById("name").value = user.name;
            document.getElementById("lastName").value = user.lastName;
            document.getElementById("phoneNumber").value = user.phoneNumber;
            document.getElementById("dni").value = user.dni;
            document.getElementById("email").value = user.email;

            setReadOnlyMode();

        } catch (err) {
            message.textContent = err.message;
            message.style.color = "red";
        }
    }

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        message.textContent = "";

        const updatedClient = {
            name: document.getElementById("name").value,
            lastname: document.getElementById("lastName").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            dni: document.getElementById("dni").value,
            email: document.getElementById("email").value
        };

        try {
            const response = await fetch(`http://localhost:8080/client/update/${username}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(updatedClient)
            });

            if (!response.ok) throw new Error("Error al actualizar perfil");

            message.textContent = "Perfil actualizado correctamente";
            message.style.color = "green";
            loadProfile();
        } catch (err) {
            message.textContent = err.message;
            message.style.color = "red";
        }
    });

    editBtn.addEventListener("click", setEditMode);
    cancelBtn.addEventListener("click", loadProfile);

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "login.html";
    });

    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')));
    }

    loadProfile();
});