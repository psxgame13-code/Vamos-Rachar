import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase.js";

function mapCobranca(row) {
  return {
    id: row.id,
    recId: row.rec_id || undefined,
    cliente: row.cliente || "",
    whats: row.whats || "",
    servico: row.servico || "",
    valor: Number(row.valor),
    vence: row.vence || "",
    criadaEm: row.criada_em,
    pago: !!row.pago,
    payload: row.payload || "",
  };
}

function mapRecorrencia(row) {
  return {
    id: row.id,
    cliente: row.cliente || "",
    whats: row.whats || "",
    servico: row.servico || "",
    valor: Number(row.valor),
    dia: row.dia,
    ultimoMes: row.ultimo_mes,
    ativa: !!row.ativa,
  };
}

function mapCliente(row) {
  return { id: row.id, nome: row.nome, whats: row.whats || "" };
}

export function useCloudData(userId) {
  const [perfil, setPerfilState] = useState({ chave: "", nome: "", cidade: "" });
  const [clientes, setClientesState] = useState([]);
  const [cobrancas, setCobrancasState] = useState([]);
  const [recorrencias, setRecorrenciasState] = useState([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const uid = userId;
  const loaded = useRef(false);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    loaded.current = false;
    setReady(false);

    (async () => {
      try {
        const [p, c, co, r] = await Promise.all([
          supabase.from("profiles").select("chave,nome,cidade").eq("id", uid).maybeSingle(),
          supabase.from("clientes").select("id,nome,whats").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("cobrancas").select("*").eq("user_id", uid).order("criada_em", { ascending: false }),
          supabase.from("recorrencias").select("*").eq("user_id", uid),
        ]);

        if (cancelled) return;

        if (p.error) throw p.error;
        if (c.error) throw c.error;
        if (co.error) throw co.error;
        if (r.error) throw r.error;

        setPerfilState(p.data || { chave: "", nome: "", cidade: "" });
        setClientesState((c.data || []).map(mapCliente));
        setCobrancasState((co.data || []).map(mapCobranca));
        setRecorrenciasState((r.data || []).map(mapRecorrencia));
        setSyncError("");
        loaded.current = true;
      } catch (err) {
        console.error(err);
        setSyncError(err.message || "Erro ao carregar dados");
        try {
          const raw = localStorage.getItem(`cf_cache_${uid}`);
          if (raw) {
            const cache = JSON.parse(raw);
            if (cache.perfil) setPerfilState(cache.perfil);
            if (cache.clientes) setClientesState(cache.clientes);
            if (cache.cobrancas) setCobrancasState(cache.cobrancas);
            if (cache.recorrencias) setRecorrenciasState(cache.recorrencias);
          }
        } catch {}
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => {
    if (!uid || !ready) return;
    try {
      localStorage.setItem(
        `cf_cache_${uid}`,
        JSON.stringify({ perfil, clientes, cobrancas, recorrencias })
      );
    } catch {}
  }, [uid, ready, perfil, clientes, cobrancas, recorrencias]);

  const setPerfil = useCallback(
    (next) => {
      setPerfilState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        if (uid) {
          supabase
            .from("profiles")
            .upsert({
              id: uid,
              chave: value.chave || "",
              nome: value.nome || "",
              cidade: value.cidade || "",
              updated_at: new Date().toISOString(),
            })
            .then(({ error }) => error && console.error(error));
        }
        return value;
      });
    },
    [uid]
  );

  const setClientes = useCallback(
    (next) => {
      setClientesState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        if (uid && loaded.current) {
          const rows = value.map((c) => ({
            user_id: uid,
            nome: c.nome,
            whats: c.whats || "",
          }));
          (async () => {
            const nomes = new Set(value.map((c) => c.nome));
            const { data: existing } = await supabase
              .from("clientes")
              .select("id,nome")
              .eq("user_id", uid);
            const toDelete = (existing || []).filter((e) => !nomes.has(e.nome)).map((e) => e.id);
            if (toDelete.length) {
              await supabase.from("clientes").delete().in("id", toDelete);
            }
            if (rows.length) {
              await supabase.from("clientes").upsert(rows, { onConflict: "user_id,nome" });
            }
          })().catch(console.error);
        }
        return value;
      });
    },
    [uid]
  );

  const setCobrancas = useCallback(
    (next) => {
      setCobrancasState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        if (uid && loaded.current) {
          (async () => {
            const ids = new Set(value.map((c) => c.id));
            const { data: existing } = await supabase
              .from("cobrancas")
              .select("id")
              .eq("user_id", uid);
            const toDelete = (existing || []).filter((e) => !ids.has(e.id)).map((e) => e.id);
            if (toDelete.length) {
              await supabase.from("cobrancas").delete().in("id", toDelete);
            }
            const rows = value.map((c) => ({
              id: c.id,
              user_id: uid,
              rec_id: c.recId || null,
              cliente: c.cliente || "",
              whats: c.whats || "",
              servico: c.servico || "",
              valor: c.valor,
              vence: c.vence || null,
              criada_em: c.criadaEm,
              pago: !!c.pago,
              payload: c.payload || "",
            }));
            if (rows.length) {
              await supabase.from("cobrancas").upsert(rows);
            }
          })().catch(console.error);
        }
        return value;
      });
    },
    [uid]
  );

  const setRecorrencias = useCallback(
    (next) => {
      setRecorrenciasState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        if (uid && loaded.current) {
          (async () => {
            const ids = new Set(value.map((r) => r.id));
            const { data: existing } = await supabase
              .from("recorrencias")
              .select("id")
              .eq("user_id", uid);
            const toDelete = (existing || []).filter((e) => !ids.has(e.id)).map((e) => e.id);
            if (toDelete.length) {
              await supabase.from("recorrencias").delete().in("id", toDelete);
            }
            const rows = value.map((r) => ({
              id: r.id,
              user_id: uid,
              cliente: r.cliente || "",
              whats: r.whats || "",
              servico: r.servico || "",
              valor: r.valor,
              dia: r.dia,
              ultimo_mes: r.ultimoMes,
              ativa: !!r.ativa,
            }));
            if (rows.length) {
              await supabase.from("recorrencias").upsert(rows);
            }
          })().catch(console.error);
        }
        return value;
      });
    },
    [uid]
  );

  return {
    perfil,
    setPerfil,
    clientes,
    setClientes,
    cobrancas,
    setCobrancas,
    recorrencias,
    setRecorrencias,
    ready,
    syncError,
  };
}