/**
 * Formulare (Kontakt auf der Startseite + Croissant-Einladung): clientseitige Validierung
 * + Versand per fetch an /api/contact. Gilt für jedes Formular mit [data-contact-form].
 * Ohne JavaScript funktionieren die Formulare als klassischer POST
 * (die Function antwortet dann mit einer Weiterleitung).
 * Die eigentliche Prüfung passiert immer serverseitig (functions/api/contact.ts).
 */

function setup(form: HTMLFormElement) {
  const ts = form.querySelector<HTMLInputElement>('[data-ts]');
  if (ts) ts.value = String(Date.now());

  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const ok = form.querySelector<HTMLElement>('[data-ok]')!;
  const err = form.querySelector<HTMLElement>('[data-err]')!;
  /** Optional: Bereich, der nach erfolgreichem Absenden ausgeblendet wird (z. B. die Felder) */
  const fields = form.querySelector<HTMLElement>('[data-form-fields]');
  const required = [...form.querySelectorAll<HTMLInputElement>('input[required]:not([type="radio"])')];

  const validate = (input: HTMLInputElement) => {
    const valid = input.checkValidity() && input.value.trim() !== '';
    input.setAttribute('aria-invalid', String(!valid));
    const msg = document.getElementById(`${input.id}-err`);
    if (msg) msg.hidden = valid;
    return valid;
  };

  required.forEach((input) =>
    input.addEventListener('blur', () => {
      if (input.value) validate(input);
    }),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    ok.hidden = true;
    err.hidden = true;

    const invalid = required.filter((input) => !validate(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    // Designwelt mitsenden, in der das Formular abgeschickt wurde (minimal / louder)
    const designField = form.querySelector<HTMLInputElement>('[data-design-field]');
    if (designField) designField.value = document.documentElement.dataset.design ?? '';

    submit.disabled = true;
    submit.textContent = submit.dataset.sending ?? '…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      required.forEach((i) => i.removeAttribute('aria-invalid'));
      if (fields) fields.hidden = true;
      ok.hidden = false;
    } catch {
      err.hidden = false;
    } finally {
      submit.disabled = false;
      submit.textContent = submit.dataset.label ?? '';
      if (ts) ts.value = String(Date.now());
      status.focus();
    }
  });
}

document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(setup);

export {};
