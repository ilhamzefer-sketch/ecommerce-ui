import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getFriendlyErrorMessage } from "../../../shared/api/api-error";
import { BrandMark } from "../../../shared/ui/BrandMark";
import { Notice } from "../../../shared/ui/Notice";
import { PageLoader } from "../../../shared/ui/PageLoader";
import { verifyEmail } from "../auth-api";

type VerifyState =
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [state, setState] = useState<VerifyState>(
    token ? { status: "loading" } : { status: "error", message: "E-poçt təsdiq tokeni tapılmadı." }
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    verifyEmail(token)
      .then((response) => {
        if (isMounted) {
          setState({ status: "success", message: response.message ?? "E-poçt ünvanınız təsdiqləndi." });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({ status: "error", message: getFriendlyErrorMessage(error) });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <section className="auth-card auth-card--entrance" aria-labelledby="verify-title">
      <BrandMark />
      <div className="auth-card__header">
        <h1 id="verify-title">E-poçt təsdiqi</h1>
        <p>Hesabınızı aktivləşdirmək üçün təsdiq tokeni backendə göndərilir.</p>
      </div>
      {state.status === "loading" ? <PageLoader label="E-poçt təsdiqlənir" /> : null}
      {state.status === "success" ? (
        <Notice tone="success" title="Təsdiq tamamlandı" message={state.message} />
      ) : null}
      {state.status === "error" ? <Notice tone="danger" title="Təsdiq alınmadı" message={state.message} /> : null}
      <div className="auth-result-icon" aria-hidden="true">
        {state.status === "success" ? <CheckCircle2 size={42} /> : <XCircle size={42} />}
      </div>
      <p className="auth-switch">
        <Link to="/login">Giriş səhifəsinə qayıt</Link>
      </p>
    </section>
  );
}
