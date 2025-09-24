
// ===== Interceptor global para enviar JWT en todas las peticiones =====
(function() {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        // Si no hay token, redirigir al login inmediatamente
        window.location.replace('login.html');
        return;
    }

    // Función para parsear JWT y chequear expiración
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch {
            return null;
        }
    }

    function isTokenExpired(token) {
        const payload = parseJwt(token);
        if (!payload || !payload.exp) return true;
        return Date.now() > payload.exp * 1000;
    }

    if (isTokenExpired(token)) {
        localStorage.removeItem('jwtToken');
        window.location.replace('login.html');
        return;
    }

    // Interceptar fetch y agregar Authorization header
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        let [resource, config] = args;
        config = config || {};
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${localStorage.getItem('jwtToken')}`;

        const res = await originalFetch(resource, config);
        if (res.status === 401 || res.status === 403) {
            // Redirigir si el backend rechaza el token
            window.location.replace('login.html');
        }
        return res;
    };

    // Interceptar XMLHttpRequest (por si hay librerías que lo usen)
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
        this.addEventListener('load', function() {
            if (this.status === 401 || this.status === 403) {
                window.location.replace('login.html');
            }
        });
        originalXhrOpen.apply(this, args);
    };
})();
