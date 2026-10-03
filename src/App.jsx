import { useState, useEffect } from 'react';
import Cobrar from './screens/Cobrar.jsx';
import Historico from './screens/Historico.jsx';
import Racha from './screens/Racha.jsx';
import { IconCobrar, IconRacha, LogoMark, IconLista } from './icons.jsx';
import { useStored } from './useStored.js';
import { hojeISO, pixPayload, vencimentoDoMes } from './pix.js';

export default function App() {
  const [tab, setTab] = useState('cobrar');
  const [cobrancas, setCobrancas] = useStored('cobrancas', []);
  const [clientes, setClientes] = useStored('clientes', []);
  const [recorrencias, setRecorrencias] = useStored('recorrencias', []);
  const [perfil, setPerfil] = useStored('perfil', {
    chave: '',
    nome: '',
    cidade: '',
  });
  const [rascunho, setRascunho] = useState(null);

  const hoje = hojeISO();
  const vencidas = cobrancas.filter(
    (c) => !c.pago && c.vence && c.vence < hoje
  ).length;

  useEffect(() => {
    if (!perfil.chave || !perfil.nome || !perfil.cidade) return;
    const mes = hojeISO().slice(0, 7);
    const devidas = recorrencias.filter((r) => r.ativa && r.ultimoMes < mes);
    if (devidas.length === 0) return;

    const novas = devidas.map((r, i) => {
      const vence = vencimentoDoMes(mes, r.dia);
      return {
        id: Date.now().toString(36) + i,
        recId: r.id,
        cliente: r.cliente,
        whats: r.whats,
        servico: r.servico,
        valor: r.valor,
        vence,
        criadaEm: hojeISO(),
        pago: false,
        payload: pixPayload({
          ...perfil,
          valor: r.valor,
          descricao: r.servico,
        }),
      };
    });
    const ids = new Set(devidas.map((r) => r.id));
    setCobrancas((l) => [...novas, ...l]);
    setRecorrencias((l) =>
      l.map((r) => (ids.has(r.id) ? { ...r, ultimoMes: mes } : r))
    );
  }, [recorrencias, perfil]);

  function recobrar(c) {
    setRascunho(c);
    setTab('cobrar');
  }

  return (
    <div className="app">
      <header className="top">
        <div className="logo" aria-hidden>
          <LogoMark size={24} />
        </div>
        <div className="brand">
          <h1>
            Cobra <span>Fácil</span>
          </h1>
          <p>Pix na hora. Sem complicação.</p>
        </div>
      </header>

      <main key={tab} className="screen">
        {tab === 'cobrar' && (
          <Cobrar
            perfil={perfil}
            setPerfil={setPerfil}
            clientes={clientes}
            setClientes={setClientes}
            setCobrancas={setCobrancas}
            setRecorrencias={setRecorrencias}
            rascunho={rascunho}
            limparRascunho={() => setRascunho(null)}
          />
        )}
        {tab === 'historico' && (
          <Historico
            cobrancas={cobrancas}
            setCobrancas={setCobrancas}
            recorrencias={recorrencias}
            setRecorrencias={setRecorrencias}
            onRecobrar={recobrar}
          />
        )}
        {tab === 'racha' && <Racha />}
      </main>

      <nav className="tabbar">
        <button
          className={tab === 'cobrar' ? 'on' : ''}
          onClick={() => setTab('cobrar')}
        >
          <IconCobrar /> <span>Cobrar</span>
        </button>
        <button
          className={tab === 'historico' ? 'on' : ''}
          onClick={() => setTab('historico')}
        >
          <IconLista /> <span>Cobranças</span>
          {vencidas > 0 && <i className="badge">{vencidas}</i>}
        </button>
        <button
          className={tab === 'racha' ? 'on' : ''}
          onClick={() => setTab('racha')}
        >
          <IconRacha /> <span>Racha-conta</span>
        </button>
      </nav>
    </div>
  );
}
