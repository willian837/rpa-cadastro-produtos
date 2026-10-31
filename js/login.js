(function () {
  'use strict';

  const LOGIN_KEY = 'cadastro_produtos_logado';
  const LOGIN_USER = 'demo';
  const LOGIN_PASS = 'demo1234';

  const loginForm = document.getElementById('loginForm');
  const loginUsuario = document.getElementById('loginUsuario');
  const loginSenha = document.getElementById('loginSenha');
  const loginError = document.getElementById('loginError');

  if (localStorage.getItem(LOGIN_KEY) === 'true') {
    window.location.replace('index.html');
    return;
  }

  loginForm.addEventListener('submit', event => {
    event.preventDefault();

    const usuario = loginUsuario.value.trim().toLowerCase();
    const senha = loginSenha.value.trim();

    if (usuario !== LOGIN_USER || senha !== LOGIN_PASS) {
      loginError.textContent = 'Usuário ou senha inválidos.';
      loginError.classList.add('show');
      loginSenha.value = '';
      loginSenha.focus();
      return;
    }

    try {
      localStorage.setItem(LOGIN_KEY, 'true');
    } catch (error) {
      console.error('Não foi possível iniciar a sessão.', error);
      loginError.textContent = 'Não foi possível iniciar a sessão neste navegador.';
      loginError.classList.add('show');
      return;
    }

    window.location.replace('index.html');
  });
})();
