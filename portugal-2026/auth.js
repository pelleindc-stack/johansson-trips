(() => {
  const storageKey = 'johansson-trips-access-v1';
  const username = 'johansson';
  const password = 'trip';
  const root = document.documentElement;
  const styles = document.createElement('style');
  styles.textContent = `
    html.auth-required body { background: #f6f1e7; }
    html.auth-required body > :not(.auth-gate) { display: none !important; }
    .auth-gate { position: fixed; inset: 0; z-index: 9999; display: grid !important; place-items: center; width: auto !important; max-width: none !important; min-height: 100dvh; margin: 0 !important; padding: max(24px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom)); background: radial-gradient(circle at 100% 0, #d7efeb 0, transparent 38%), #f6f1e7; }
    .auth-card { width: min(100%, 390px); padding: 28px; border: 1px solid #d7dfdc; border-radius: 24px; background: #fffefa; color: #12383d; box-shadow: 0 18px 44px rgba(20,57,58,.15); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif; }
    .auth-kicker { margin: 0 0 4px; color: #075d68; font-size: .72rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.auth-card h1 { margin: 0 0 8px; font-size: 1.8rem; letter-spacing: -.04em; }.auth-card > p { margin: 0; color: #526d71; }.auth-card form { display: grid; gap: 13px; margin-top: 22px; }.auth-card label { display: grid; gap: 5px; color: #12383d; font-size: .8rem; font-weight: 800; }.auth-card input { width: 100%; min-height: 48px; padding: 10px 12px; border: 1px solid #b8cac7; border-radius: 12px; color: #12383d; background: white; font: inherit; }.auth-card button { min-height: 50px; border: 0; border-radius: 13px; color: white; background: #075d68; font: inherit; font-weight: 800; cursor: pointer; }.auth-card button:focus-visible,.auth-card input:focus-visible { outline: 3px solid #ffbd4a; outline-offset: 2px; }.auth-error { margin: -3px 0 0; color: #8d3427; font-size: .85rem; font-weight: 700; }.auth-card small { display: block; margin-top: 18px; color: #526d71; font-size: .76rem; line-height: 1.35; }`;
  document.head.append(styles);

  const hasAccess = () => {
    try { return localStorage.getItem(storageKey) === 'granted'; } catch { return false; }
  };
  const setAccess = () => { try { localStorage.setItem(storageKey, 'granted'); } catch {} };

  if (hasAccess()) return;
  root.classList.add('auth-required');

  const mount = () => {
    const gate = document.createElement('main');
    gate.className = 'auth-gate';
    gate.innerHTML = `
      <section class="auth-card" aria-labelledby="auth-title">
        <p class="auth-kicker">Johansson Trips</p>
        <h1 id="auth-title">Welcome back</h1>
        <p>Enter the shared trip login to open itineraries, maps and offline details.</p>
        <form>
          <label>Username<input name="username" autocomplete="username" autocapitalize="none" required></label>
          <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
          <p class="auth-error" role="alert" hidden>That username or password is not correct.</p>
          <button type="submit">Open trips</button>
        </form>
        <small>This device stays signed in for offline access.</small>
      </section>`;
    document.body.append(gate);
    const form = gate.querySelector('form');
    const error = gate.querySelector('.auth-error');
    const firstInput = gate.querySelector('input');
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      if (data.get('username') === username && data.get('password') === password) {
        setAccess();
        root.classList.remove('auth-required');
        gate.remove();
      } else {
        error.hidden = false;
        form.querySelector('[name="password"]').select();
      }
    });
    firstInput.focus();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
