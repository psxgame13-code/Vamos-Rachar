import { useState } from 'react';
import { brl, dataBr, hojeISO, mensagemCobranca, linkWhats } from '../pix.js';
import { IconWhats, IconCheck, IconRepeat, IconTrash } from '../icons.jsx';

export default function Historico({
  cobrancas,
  setCobrancas,
  recorrencias,
  setRecorrencias,
  onRecobrar,
}) {
  const [filtro, setFiltro] = useState('pendentes');
  const hoje = hojeISO();

  const vencida = (c) => !c.pago && c.vence && c.vence < hoje;

  const aReceber = cobrancas
    .filter((c) => !c.pago)
    .reduce((s, c) => s + c.valor, 0);
  const recebido = cobrancas
    .filter((c) => c.pago)
    .reduce((s, c) => s + c.valor, 0);

  const lista = cobrancas
    .filter((c) =>
      filtro === 'pendentes' ? !c.pago : filtro === 'pagas' ? c.pago : true
    )
    .sort((a, b) => Number(vencida(b)) - Number(vencida(a)));

  const alterna = (id) =>
    setCobrancas(
      cobrancas.map((c) =>
        c.id === id
          ? { ...c, pago: !c.pago, pagoEm: !c.pago ? hoje : undefined }
          : c
      )
    );

  const remove = (id) => {
    if (window.confirm('Apagar esta cobrança do histórico?')) {
      setCobrancas(cobrancas.filter((c) => c.id !== id));
    }
  };

  const reenviar = (c) =>
    window.open(linkWhats(c.whats, mensagemCobranca(c)), '_blank');

  const pausa = (id) =>
    setRecorrencias(
      recorrencias.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r))
    );

  const apagaRec = (id) => {
    if (
      window.confirm(
        'Parar de gerar esta mensalidade? As cobranças já criadas continuam no histórico.'
      )
    ) {
      setRecorrencias(recorrencias.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="stack">
      <section className="summary">
        <div>
          <span className="eyebrow">A receber</span>
          <strong>{brl(aReceber)}</strong>
        </div>
        <div>
          <span className="eyebrow">Recebido</span>
          <strong className="ok">{brl(recebido)}</strong>
        </div>
      </section>

      <div className="segmented">
        {[
          ['pendentes', 'Pendentes'],
          ['pagas', 'Pagas'],
          ['todas', 'Todas'],
        ].map(([k, nome]) => (
          <button
            key={k}
            className={filtro === k ? 'on' : ''}
            onClick={() => setFiltro(k)}
          >
            {nome}
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <p className="empty">
          {cobrancas.length === 0
            ? 'Nenhuma cobrança ainda. Gere a primeira na aba Cobrar.'
            : 'Nada por aqui.'}
        </p>
      )}

      {lista.map((c) => (
        <article key={c.id} className={'item' + (c.pago ? ' paid' : '')}>
          <div className="item-head">
            <div>
              <strong>{c.cliente || 'Sem nome'}</strong>
              <small>
                {(c.servico || 'Cobrança Pix') + (c.recId ? ' · ↻ mensal' : '')}
              </small>
            </div>
            <div className="item-value">
              <strong>{brl(c.valor)}</strong>
              {c.pago ? (
                <span className="tag ok">Paga</span>
              ) : vencida(c) ? (
                <span className="tag late">Venceu {dataBr(c.vence)}</span>
              ) : (
                <span className="tag">
                  {c.vence ? 'Vence ' + dataBr(c.vence) : 'Pendente'}
                </span>
              )}
            </div>
          </div>

          <div className="item-actions">
            {!c.pago && (
              <button className="primary" onClick={() => reenviar(c)}>
                <IconWhats /> Cobrar
              </button>
            )}
            <button onClick={() => alterna(c.id)}>
              <IconCheck /> {c.pago ? 'Desfazer' : 'Já paguei'}
            </button>
            <button
              className="icon-only"
              onClick={() => onRecobrar(c)}
              aria-label="Nova cobrança igual"
              title="Nova cobrança igual"
            >
              <IconRepeat />
            </button>
            <button
              className="icon-only"
              onClick={() => remove(c.id)}
              aria-label="Apagar"
            >
              <IconTrash />
            </button>
          </div>
        </article>
      ))}

      {recorrencias.length > 0 && (
        <section className="card">
          <h2>Mensalidades</h2>
          <p className="hint">
            Uma cobrança é criada sozinha todo mês, quando você abre o app.
          </p>
          {recorrencias.map((r) => (
            <div key={r.id} className={'rec' + (r.ativa ? '' : ' off')}>
              <div className="rec-info">
                <strong>{r.cliente || 'Sem nome'}</strong>
                <small>
                  {brl(r.valor)} · todo dia {r.dia}
                  {r.servico ? ' · ' + r.servico : ''}
                </small>
              </div>
              <button onClick={() => pausa(r.id)}>
                {r.ativa ? 'Pausar' : 'Ativar'}
              </button>
              <button
                className="icon-only"
                onClick={() => apagaRec(r.id)}
                aria-label="Remover"
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
