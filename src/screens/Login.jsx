import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { LogoMark } from "../icons.jsx";

export default function Login() {
  const { signInWithPassword, signUp } = useAuth();
  const [modo, setModo] = useState("entrar"); // entrar | cadastro
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setMsg("");
    setBusy(true);
    try {
      if (senha.length < 6) {
        throw new Error("Senha com pelo menos 6 caracteres.");
      }
      if (modo === "cadastro") {
        await signUp(email, senha);
        setMsg("Conta criada! Entrando…");
      } else {
        await signInWithPassword(email, senha);
      }
    } catch (err) {
      setErro(err.message || "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo" aria-hidden>
            <LogoMark size={28} />
          </div>
          <div>
            <h1>
              SEV<span>MEI</span>
            </h1>
            <p>Pix na hora para MEI e autônomos.</p>
          </div>
        </div>

        <p className="login-lead">
          Entre para salvar cobranças na nuvem e usar em qualquer celular.
        </p>

        <div className="segmented login-tabs">
          <button
            type="button"
            className={modo === "entrar" ? "on" : ""}
            onClick={() => setModo("entrar")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={modo === "cadastro" ? "on" : ""}
            onClick={() => setModo("cadastro")}
          >
            Criar conta
          </button>
        </div>

        <form className="stack" onSubmit={enviar} style={{ gap: 12 }}>
          <label className="field">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </label>

          <label className="field">
            Senha
            <input
              type="password"
              required
              autoComplete={modo === "cadastro" ? "new-password" : "current-password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
          </label>

          {erro && <p className="login-erro">{erro}</p>}
          {msg && <p className="login-ok">{msg}</p>}

          <button className="primary" type="submit" disabled={busy}>
            {busy ? "Aguarde…" : modo === "cadastro" ? "Criar conta" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}