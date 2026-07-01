import { CheckCircle2, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { getFriendlyErrorMessage } from "../../../shared/api/api-error";
import { hasErrors, isEmail, mapDetailsToErrors, minLength, required, type ValidationErrors } from "../../../shared/forms/validation";
import { BrandMark } from "../../../shared/ui/BrandMark";
import { Button } from "../../../shared/ui/Button";
import { Notice } from "../../../shared/ui/Notice";
import { PasswordField } from "../../../shared/ui/PasswordField";
import { TextField } from "../../../shared/ui/TextField";
import { AuthVisualPanel } from "../components/AuthVisualPanel";
import { register } from "../auth-api";

type RegisterField = "username" | "email" | "password" | "confirmPassword";

export function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<ValidationErrors<RegisterField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const nextErrors: ValidationErrors<RegisterField> = {
      username:
        required(form.username, "İstifadəçi adını daxil edin.") ??
        minLength(form.username, 3, "İstifadəçi adı ən azı 3 simvol olmalıdır."),
      email: required(form.email, "E-poçt ünvanını daxil edin.") ?? (isEmail(form.email) ? undefined : "E-poçt formatı düzgün deyil."),
      password:
        required(form.password, "Şifrəni daxil edin.") ??
        minLength(form.password, 8, "Şifrə ən azı 8 simvol olmalıdır."),
      confirmPassword:
        required(form.confirmPassword, "Şifrə təsdiqini daxil edin.") ??
        (form.password === form.confirmPassword ? undefined : "Şifrələr uyğun gəlmir.")
    };

    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined
      });
      setSuccessMessage("Qeydiyyat tamamlandı. E-poçtunuzu yoxlayın və sonra giriş edin.");
    } catch (error) {
      setFormError(getFriendlyErrorMessage(error, "Məlumatları yoxlayın və yenidən cəhd edin."));
      if (error && typeof error === "object" && "details" in error) {
        setErrors(mapDetailsToErrors<RegisterField>((error as { details?: Record<string, string> }).details, [
          "username",
          "email",
          "password",
          "confirmPassword"
        ]));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell auth-shell--register auth-card--entrance">
      <AuthVisualPanel
        eyebrow="MIZAN üzvlüyü"
        title="Yeni imkanlara bir addımda qoşulun."
        description="Hesabınızı yaradın, seçimlərinizi qoruyun və gələcək MIZAN xidmətlərinə hazır olun."
      />
      <section className="auth-form-panel" aria-labelledby="register-title">
        <div className="auth-form-panel__brand">
          <BrandMark compact />
          <span>
            <strong>Mizan.az</strong>
            Yeni hesab
          </span>
        </div>
        <div className="auth-card__header auth-card__header--split">
          <span className="auth-form-panel__eyebrow">
            <Sparkles size={17} aria-hidden="true" />
            MIZAN dünyasına başlayın
          </span>
          <h1 id="register-title">Yeni hesab yaradın</h1>
          <p>Məlumatlarınızı daxil edin. Təsdiq keçidi e-poçtunuza göndəriləcək.</p>
        </div>
        {formError ? <Notice tone="danger" message={formError} /> : null}
        {successMessage ? <Notice tone="success" title="Qeydiyyat tamamlandı" message={successMessage} /> : null}
        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <TextField
              label="İstifadəçi adı"
              name="username"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              error={errors.username}
              autoComplete="username"
            />
            <TextField
              label="E-poçt"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <TextField
              label="Ad"
              name="firstName"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              autoComplete="given-name"
            />
            <TextField
              label="Soyad"
              name="lastName"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              autoComplete="family-name"
            />
          </div>
          <PasswordField
            label="Şifrə"
            name="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordField
            label="Şifrə təkrarı"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button fullWidth type="submit" isLoading={isSubmitting} icon={<CheckCircle2 size={19} />}>
            Qeydiyyatdan keç
          </Button>
        </form>
        <p className="auth-switch">
          Artıq hesabınız var? <Link to="/login">Daxil olun</Link>
        </p>
      </section>
    </div>
  );
}
