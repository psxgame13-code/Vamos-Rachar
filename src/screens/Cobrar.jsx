import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { pixPayload, brl, hojeISO, mensagemCobranca, linkWhats } from "../pix.js";
import { IconWhats, IconCopy, IconCheck, IconEdit } from "../icons.jsx";

export default function Cobrar({
  perfil, setPerfil, clientes, setClientes, setCobrancas, setRecorrencias, rascunho, limparRascunho,
}) {
  const pronto = perfil.chave && perfil.nome && perfil.cidade;
  const [editando, setEditando] = useState(!pronto);

  const [cliente, setCliente] = useState("");
  const [whats, setWhats] = useState("");
  const [servico, setServico] = useState("");
  const [cents, setCents] = useState(0);
  const [vence, setVence] = useState("");
  const [repetir, setRepetir] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!rascunho) return;
    setCliente(rascunho.cliente || "");
    setWhats(rascunho.whats || "");
    setServico(rascunho.servico || "");
    setCents(Math.round(rascunho.valor * 100));
    setVence("");
    setRepetir(false);
    setResultado(null);
    limparRascunho();
  }, [rascunho]);

  const set = (k) => (e) => setPerfil({ ...perfil, [k]: e.target.value });
  const onValor = (e) => setCents(Number(e.target.value.replace(/\D/g, "").slice(0, 9) || 0));
  const valorTxt = (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

  function onCliente(e) {
    const nome = e.target.value;
    setCliente(nome);
    const achado = clientes.find((c) => c.nome.toLowerCase() === nome.trim().toLowerCase());
    if (achado && !whats) setWhats(achado.whats);
  }

  async function gerar() {
    setErro("");
    const v = cents / 100;
    if (!perfil.chave || !perfil.nome || !perfil.cidade) {
      setEditando(true);
      return setErro("Preencha chave Pix, nome e cidade.");
    }
    if (!(v > 0)) return setErro("Informe um valor maior que zero.");
    if (repetir && !vence) return setErro("Para repetir todo mês, informe o primeiro vencimento.");

    const payload = pixPayload({ ...perfil, valor: v, descricao: servico });
    const qr = await QRCode.toDataURL(payload, { margin: 1, width: 480 });

    const id = Date.now().toString(36);
    const nova = {
      id,
      recId: repetir ? "r" + id : undefined,
      cliente: cliente.trim(),
      whats,
      servico: servico.trim(),
      valor: v,
      vence,
      criadaEm: hojeISO(),
      pago: false,
      payload,
    };
    setCobrancas((lista) => [nova, ...lista]);

    if (repetir) {
      setRecorrencias((lista) => [
        {
          id: nova.recId,
          cliente: nova.cliente,
          whats: nova.whats,
          servico: nova.servico,
          valor: v,
          dia: Number(vence.slice(8, 10)),
          ultimoMes: vence.slice(0, 7), // este mês já foi gerado agora
          ativa: true,
        },
        ...lista,
      ]);
    }

    if (nova.cliente) {
      setClientes((lista) => {
        const outros = lista.filter((c) => c.nome.toLowerCase() !== nova.cliente.toLowerCase());
        return [{ nome: nova.cliente, whats: nova.whats }, ...outros].slice(0, 200);
      });
    }

    setResultado({ ...nova, qr, dia: repetir ? Number(vence.slice(8, 10)) : null });
    setCopiado(false);
    setEditando(false);
    setRepetir(false);
    setTimeout(() => document.getElementById("recibo")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(resultado.payload);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar aqui. Abra o app em uma nova aba.");
    }
  }

  function enviar() {
    window.open(linkWhats(resultado.whats, mensagemCobranca(resultado)), "_blank");
  }

  return (
    <div className="stack">
      <section className="hero">
        <span className="eyebrow">Valor a cobrar</span>
        <div className="amount">
          <span className="cur">R$</span>
          <input className="amount-input" value={valorTxt} onChange={onValor} inputMode="numeric" aria-label="Valor" />
        </div>
      </section>

      <section className="card">
        <div className="grid2">
          <label className="field">Cliente
            <input list="clientes-lista" value={cliente} onChange={onCliente} placeholder="João" />
            <datalist id="clientes-lista">
              {clientes.map((c) => <option key={c.nome} value={c.nome} />)}
            </datalist>
          </label>
          <label className="field">WhatsApp
            <input value={whats} onChange={(e) => setWhats(e.target.value)} inputMode="tel" placeholder="51 99999-9999" />
          </label>
        </div>
        <label className="field">Serviço
          <input value={servico} onChange={(e) => setServico(e.target.value)} placeholder="Mensalidade" />
        </label>
        <label className="field">
          {repetir ? "Primeiro vencimento" : "Vencimento"} {!repetir && <em>opcional</em>}
          <input type="date" value={vence} onChange={(e) => setVence(e.target.value)} />
        </label>

        <div className="divider" />
        <label className="row-between switch-row">
          <span>
            Repetir todo mês
            <small className="sub">
              {repetir && vence
                ? `Cria uma cobrança nova todo dia ${Number(vence.slice(8, 10))}`
                : "Ideal para mensalidades"}
            </small>
          </span>
          <input type="checkbox" className="switch" checked={repetir} onChange={(e) => setRepetir(e.target.checked)} />
        </label>
      </section>

      <section className="card">
        {!editando && pronto ? (
          <div className="profile">
            <div className="avatar">{perfil.nome.trim()[0]?.toUpperCase()}</div>
            <div className="profile-info">
              <strong>{perfil.nome}</strong>
              <small>Pix · {perfil.chave}</small>
            </div>
            <button className="ghost icon" onClick={() => setEditando(true)} aria-label="Editar">
              <IconEdit />
            </button>
          </div>
        ) : (
          <>
            <h2>Quem recebe</h2>
            <p className="hint">Ficam salvos somente neste aparelho.</p>
            <label className="field">Chave Pix
              <input value={perfil.chave} onChange={set("chave")} placeholder="CPF, e-mail, aleatória ou +5551..." />
            </label>
            <div className="grid2">
              <label className="field">Nome no banco
                <input value={perfil.nome} onChange={set("nome")} maxLength={25} />
              </label>
              <label className="field">Cidade
                <input value={perfil.cidade} onChange={set("cidade")} maxLength={15} />
              </label>
            </div>
            <p className="hint">Para chave de celular, digite com +55 (ex.: +5551999999999).</p>
            {pronto && <button className="ghost" onClick={() => setEditando(false)}>Concluir</button>}
          </>
        )}
      </section>

      {erro && <p className="erro">{erro}</p>}
      <button className="primary big-btn" onClick={gerar}>Gerar cobrança</button>

      {resultado && (
        <section className="receipt" id="recibo">
          <div className="receipt-top">
            <span className="eyebrow">Cobrança Pix</span>
            <h2>{brl(resultado.valor)}</h2>
            {(resultado.cliente || resultado.servico) && (
              <p>{[resultado.cliente, resultado.servico].filter(Boolean).join(" · ")}</p>
            )}
            {resultado.dia && <p className="rec-note">↻ Repete todo dia {resultado.dia}</p>}
          </div>
          <div className="tear" />
          <div className="receipt-body">
            <div className="qr"><img src={resultado.qr} alt="QR Code Pix" /></div>
            <div className="actions">
              <button className="secondary" onClick={copiar}>
                {copiado ? <><IconCheck /> Copiado</> : <><IconCopy /> Copiar Pix</>}
              </button>
              <button className="primary" onClick={enviar}>
                <IconWhats /> WhatsApp
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}