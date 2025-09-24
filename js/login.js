if (localStorage.getItem("jwtToken")) {
    window.location.href = "../html/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:8080/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                message.style.color = "red";
                message.textContent = "Usuario o contraseña incorrectos";
                return;
            }

            const data = await response.json();

            localStorage.setItem("jwtToken", data.token);

            const payloadBase64 = data.token.split(".")[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            const roles = payload.authorities || payload.roles || [];
            localStorage.setItem("roles", JSON.stringify(roles));

            message.style.color = "green";
            message.textContent = "Login exitoso! Redirigiendo...";

            setTimeout(() => {
                window.location.href = "../html/index.html";
            }, 1000);

        } catch (error) {
            console.error(error);
            message.style.color = "red";
            message.textContent = "Error al conectar con el servidor";
        }
    });

    // 👁 Toggle mostrar/ocultar contraseña
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");

    togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePassword.innerHTML = isPassword
            ? '<i class="fa-regular fa-eye-slash"></i>'
            : '<i class="fa-regular fa-eye"></i>';
    });
});
