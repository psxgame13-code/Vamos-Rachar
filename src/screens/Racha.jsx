import { useState } from 'react';
import { brl } from '../pix.js';
import { IconWhats } from '../icons.jsx';

export default function Racha() {
  const [cents, setCents] = useState(0);
  const [pessoas, setPessoas] = useState(4);
  const [servico, setServico] = useState(true);
  const [nomes, setNomes] = useState('');

  const onValor = (e) =>
    setCents(Number(e.target.value.replace(/\D/g, '').slice(0, 9) || 0));
  const valorTxt = (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const t = cents / 100;
  const comServico = servico ? t * 1.1 : t;
  const porPessoa = pessoas > 0 ? comServico / pessoas : 0;
  const lista = nomes
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  const texto =
    `Conta: ${brl(comServico)}${servico ? ' (com 10%)' : ''}\n` +
    `${pessoas} pessoas = ${brl(porPessoa)} cada` +
    (lista.length
      ? '\n\n' + lista.map((n) => `${n}: ${brl(porPessoa)}`).join('\n')
      : '');

  return (
    <div className="stack">
      <section className="hero">
        <span className="eyebrow">Total da conta</span>
        <div className="amount">
          <span className="cur">R$</span>
          <input
            className="amount-input"
            value={valorTxt}
            onChange={onValor}
            inputMode="numeric"
            aria-label="Total"
          />
        </div>
      </section>

      <section className="card">
        <div className="row-between">
          <span>Pessoas</span>
          <div className="stepper">
            <button
              onClick={() => setPessoas(Math.max(1, pessoas - 1))}
              aria-label="Menos"
            >
              −
            </button>
            <strong>{pessoas}</strong>
            <button onClick={() => setPessoas(pessoas + 1)} aria-label="Mais">
              +
            </button>
          </div>
        </div>

        <div className="divider" />

        <label className="row-between switch-row">
          <span>Incluir 10% de serviço</span>
          <input
            type="checkbox"
            className="switch"
            checked={servico}
            onChange={(e) => setServico(e.target.checked)}
          />
        </label>

        <div className="divider" />

        <label className="field">
          Nomes <em>opcional, separe por vírgula</em>
          <input
            value={nomes}
            onChange={(e) => setNomes(e.target.value)}
            placeholder="Ana, João, Maria"
          />
        </label>
      </section>

      {t > 0 && (
        <section className="result">
          <span className="eyebrow">Cada um paga</span>
          <h2>{brl(porPessoa)}</h2>
          <small>Total com serviço: {brl(comServico)}</small>
          {lista.length > 0 && (
            <ul>
              {lista.map((n) => (
                <li key={n}>
                  <span>{n}</span>
                  <strong>{brl(porPessoa)}</strong>
                </li>
              ))}
            </ul>
          )}
          <button
            className="primary"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(texto)}`,
                '_blank'
              )
            }
          >
            <IconWhats /> Compartilhar no WhatsApp
          </button>
        </section>
      )}
    </div>
  );
}
