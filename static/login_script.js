    document.getElementById('switch-to-signup').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').parentElement.style.display = 'none';
        document.getElementById('signup-card').style.display = 'block';
    });
    
    document.getElementById('switch-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('signup-card').style.display = 'none';
        document.getElementById('login-form').parentElement.style.display = 'block';
    });