import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../supabase.js";
import { brl, dataBr } from "../pix.js";
import { LogoMark, IconCopy, IconCheck } from "../icons.jsx";

export default function PublicPix({ id }) {
  const [data, setData] = useState(null);
  const [qr, setQr] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErro("");
      try {
        const { data: rows, error } = await supabase.rpc("get_cobranca_publica", {
          p_id: id,
        });
        if (error) throw error;
        const row = Array.isArray(rows) ? rows[0] : rows;
        if (!row || !row.payload) {
          setErro("Cobrança não encontrada ou indisponível.");
          return;
        }
        if (cancel) return;
        setData(row);
        const url = await QRCode.toDataURL(row.payload, { margin: 2, width: 520 });
        if (!cancel) setQr(url);
      } catch (e) {
        console.error(e);
        if (!cancel) setErro(e.message || "Não foi possível carregar o Pix.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  async function copiar() {
    if (!data?.payload) return;
    try {
      await navigator.clipboard.writeText(data.payload);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErro("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  return (
    <div className="login-page public-pix">
      <div className="login-card" style={{ maxWidth: 420 }}>
        <div className="login-brand">
          <div className="logo" aria-hidden>
            <LogoMark size={28} />
          </div>
          <div>
            <h1>
              Cobra <span>Fácil</span>
            </h1>
            <p>Pagamento via Pix</p>
          </div>
        </div>

        {loading && <p className="login-lead">Carregando cobrança…</p>}
        {erro && !loading && <p className="login-erro">{erro}</p>}

        {data && !loading && (
          <>
            <div className="public-resumo">
              {data.cliente ? <strong>{data.cliente}</strong> : null}
              {data.servico ? <span className="sub">{data.servico}</span> : null}
              <div className="public-valor">{brl(Number(data.valor))}</div>
              {data.vence ? (
                <span className="sub">Vencimento: {dataBr(data.vence)}</span>
              ) : null}
            </div>

            {qr && (
              <div className="public-qr">
                <img src={qr} alt="QR Code Pix" />
              </div>
            )}

            <p className="login-lead" style={{ marginBottom: 0 }}>
              Escaneie o QR no app do banco ou copie o código abaixo.
            </p>

            <button type="button" className="primary" onClick={copiar}>
              {copiado ? (
                <>
                  <IconCheck /> Código copiado!
                </>
              ) : (
                <>
                  <IconCopy /> Copiar código Pix
                </>
              )}
            </button>

            <details className="public-codigo">
              <summary>Ver código Pix</summary>
              <p className="public-payload">{data.payload}</p>
            </details>
          </>
        )}
      </div>
    </div>
  );
}