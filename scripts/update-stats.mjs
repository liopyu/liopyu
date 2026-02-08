import fs from "node:fs/promises";

let humanize = (n) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2).replace(/\.?0+$/, "")}K`;
  return String(n);
};

let getText = async (url) => {
  let res = await fetch(url, {
    headers: {
      "user-agent": "LiopyuProfileStats/1.0"
    }
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return await res.text();
};

let parseCurseForgeDownloads = (html) => {
  let m = html.match(/([0-9]+(?:\.[0-9]+)?)\s*([KMB])\s*Downloads/i);
  if (!m) m = html.match(/([0-9]+(?:\.[0-9]+)?)\s*([KMB])\s*downloads/i);
  if (!m) throw new Error("Could not parse CurseForge downloads");
  let v = Number(m[1]);
  let u = m[2].toUpperCase();
  if (u === "K") return Math.round(v * 1_000);
  if (u === "M") return Math.round(v * 1_000_000);
  if (u === "B") return Math.round(v * 1_000_000_000);
  return Math.round(v);
};

let parseModrinthDownloads = (html) => {
  let m = html.match(/([0-9]+(?:\.[0-9]+)?)\s*([KMB])\s*downloads/i);
  if (!m) throw new Error("Could not parse Modrinth downloads");
  let v = Number(m[1]);
  let u = m[2].toUpperCase();
  if (u === "K") return Math.round(v * 1_000);
  if (u === "M") return Math.round(v * 1_000_000);
  if (u === "B") return Math.round(v * 1_000_000_000);
  return Math.round(v);
};

let cfHtml = await getText("https://www.curseforge.com/members/liopyu/projects");
let mrHtml = await getText("https://modrinth.com/user/Liopyu");

let curseforge = parseCurseForgeDownloads(cfHtml);
let modrinth = parseModrinthDownloads(mrHtml);
let total = curseforge + modrinth;

let now = new Date();
let yyyy = now.getUTCFullYear();
let mm = String(now.getUTCMonth() + 1).padStart(2, "0");
let dd = String(now.getUTCDate()).padStart(2, "0");

let data = {
  curseforge,
  modrinth,
  total,
  curseforgeHuman: humanize(curseforge),
  modrinthHuman: humanize(modrinth),
  totalHuman: humanize(total),
  updatedAt: `${yyyy}-${mm}-${dd}`
};

await fs.writeFile("stats.json", JSON.stringify(data, null, 2) + "\n", "utf8");
