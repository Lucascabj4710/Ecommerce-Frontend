document.addEventListener("DOMContentLoaded", () => {

  // Buscar links en el menú
  const iniciarSesion = Array.from(document.querySelectorAll('a[href="login.html"]'))
                             .find(a => a.textContent.trim() === "Iniciar sesión");
  const registrarme = Array.from(document.querySelectorAll('a[href="register.html"]'))
                           .find(a => a.textContent.trim() === "Registrarme");
  const panelAdmin = Array.from(document.querySelectorAll('a[href="admin.html"]'))
                          .find(a => a.textContent.trim() === "Panel de control ADMIN");
  const perfilUser = Array.from(document.querySelectorAll('a[href="dashboard.html"]'))
                          .find(a => a.textContent.trim() === "Mi perfil");
  const logoutBtn = Array.from(document.querySelectorAll('a[href="logout.php"]'))
                         .find(a => a.textContent.trim() === "Cerrar sesión");

  // Función para decodificar JWT
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Token inválido", err);
      return null;
    }
  }

  // Función para actualizar menú según estado del usuario
  function actualizarMenu() {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      // Usuario logueado
      if (iniciarSesion) iniciarSesion.parentElement.style.display = "none";
      if (registrarme) registrarme.parentElement.style.display = "none";
      if (logoutBtn) logoutBtn.parentElement.style.display = "list-item";
      if (perfilUser) perfilUser.parentElement.style.display = "list-item";

      const payload = parseJwt(token);
      const roles = payload?.authorities || payload?.roles || [];

      // Panel de control ADMIN solo para admins
      if (panelAdmin) panelAdmin.parentElement.style.display = roles.includes("ROLE_ADMIN") ? "list-item" : "none";

    } else {
      // Usuario no logueado
      if (iniciarSesion) iniciarSesion.parentElement.style.display = "list-item";
      if (registrarme) registrarme.parentElement.style.display = "list-item";
      if (logoutBtn) logoutBtn.parentElement.style.display = "none";
      if (panelAdmin) panelAdmin.parentElement.style.display = "none";
      if (perfilUser) perfilUser.parentElement.style.display = "none";
    }
  }

  actualizarMenu();

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("jwtToken");
      actualizarMenu();
      window.location.href = "login.html"; // redirige al login
    });
  }

});
