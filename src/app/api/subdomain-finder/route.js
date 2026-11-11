export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOH = process.env.DOH_BASE_URL || "https://dns.google/resolve";

const WORDLIST = [
  "www","mail","smtp","pop","pop3","imap","ftp","sftp","ssh",
  "cpanel","whm","webmail","autodiscover","autoconfig","mx","ns","ns1","ns2","ns3","ns4",
  "api","api2","v1","v2","v3","app","apps","dev","staging","stage","beta","alpha","demo",
  "test","qa","uat","sandbox","preview","lab","labs",
  "admin","panel","dashboard","portal","console","manage","manager","control","cp",
  "shop","store","cart","checkout","pay","payment","billing","invoice","crm","erp",
  "blog","news","media","cdn","static","assets","img","images","files","docs","wiki",
  "help","support","helpdesk","ticket","status","monitor","ping",
  "vpn","remote","rdp","gateway","proxy","fw","firewall","router",
  "db","database","mysql","postgres","redis","mongo","elastic","search",
  "git","gitlab","github","ci","cd","jenkins","build","deploy",
  "chat","meet","video","voice","stream","live",
  "forum","community","members","account","auth","login","sso","id","oauth",
  "mobile","m","wap","pwa","web",
  "intranet","internal","private","local","corp","office","hr",
  "backup","archive","log","logs","data","analytics","stats","metrics","grafana","kibana",
  "mail2","smtp2","mx1","mx2","smtp1","relay",
  "cloud","s3","storage","bucket","repo","registry",
  "api-dev","api-staging","api-prod","api-v1","api-v2",
  "new","old","legacy","classic","next","v","www2","www3",
];

async function lookupA(name) {
  try {
    const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=A`, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Answer || []).filter((r) => r.type === 1).map((r) => r.data);
  } catch {
    return [];
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const rawDomain = searchParams.get("domain") || "";
  const domain = rawDomain.trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/:\d+$/, "");

  if (!domain || !/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) {
    return new Response(JSON.stringify({ error: "Invalid domain" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const CONCURRENCY = 10;

  const stream = new ReadableStream({
    async start(controller) {
      // Send total count first
      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "start", total: WORDLIST.length }) + "\n")
      );

      // Process in batches of CONCURRENCY
      for (let i = 0; i < WORDLIST.length; i += CONCURRENCY) {
        const batch = WORDLIST.slice(i, i + CONCURRENCY).map((word, j) => {
          const fqdn = `${word}.${domain}`;
          return lookupA(fqdn).then((ips) => {
            const payload = ips.length > 0
              ? { type: "found", subdomain: fqdn, ips }
              : { type: "miss", subdomain: fqdn };
            controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
          });
        });
        await Promise.all(batch);
      }

      controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
