function limpa(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 @.\-]/g, "")
    .trim();
}

function f(id, value) {
  const v = String(value);
  return id + String(v.length).padStart(2, "0") + v;
}

function crc16(s) {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function normalizaChave(chave) {
  const c = chave.trim();
  if (c.includes("@")) return c.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(c)) return c.toLowerCase();
  const nums = c.replace(/\D/g, "");
  if (c.startsWith("+")) return "+" + nums;
  if (nums.length === 11 || nums.length === 14) return nums;
  if (nums.length === 10 || nums.length === 11) return "+55" + nums;
  return c;
}

export function pixPayload({ chave, nome, cidade, valor, descricao, txid = "***" }) {
  const conta =
    f("00", "br.gov.bcb.pix") +
    f("01", normalizaChave(chave)) +
    (descricao ? f("02", limpa(descricao).slice(0, 40)) : "");
  const p =
    f("00", "01") +
    f("26", conta) +
    f("52", "0000") +
    f("53", "986") +
    (valor > 0 ? f("54", valor.toFixed(2)) : "") +
    f("58", "BR") +
    f("59", limpa(nome).slice(0, 25)) +
    f("60", limpa(cidade).slice(0, 15)) +
    f("62", f("05", txid)) +
    "6304";
  return p + crc16(p);
}

export const brl = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const hojeISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const dataBr = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

export function mensagemCobranca(c) {
  return (
    `Olá${c.cliente ? ", " + c.cliente : ""}! Segue a cobrança` +
    `${c.servico ? " de " + c.servico : ""}: *${brl(c.valor)}*` +
    `${c.vence ? "\nVencimento: " + dataBr(c.vence) : ""}` +
    `\n\nPix copia e cola:\n${c.payload}`
  );
}

export function linkWhats(whats, texto) {
  const num = (whats || "").replace(/\D/g, "");
  const tel = num ? (num.startsWith("55") ? num : "55" + num) : "";
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
}

export function vencimentoDoMes(mes, dia) {
  const [ano, m] = mes.split("-").map(Number);
  const ultimo = new Date(ano, m, 0).getDate();
  return `${mes}-${String(Math.min(dia, ultimo)).padStart(2, "0")}`;
}