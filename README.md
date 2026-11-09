# Nova-X (`novax.my.id`)

Platform utilitas dan diagnostik jaringan, keamanan server, dan sistem web yang dirancang untuk pengembang, administrator sistem, dan peneliti keamanan.

Aplikasi dapat diakses langsung melalui [novax.my.id](https://novax.my.id).

---

## ⚡ Fitur & Alat

- **DNS Lookup & Reverse DNS (`/tools/dns-lookup`)**: Resolusi rekaman DNS otoritatif (A, AAAA, MX, NS, TXT, CNAME, SOA) via Google DoH serta reverse DNS (PTR).
- **IP Geolocation (`/tools/ip-geo`)**: Deteksi lokasi geografis, visualisasi peta interaktif Leaflet, informasi ASN, dan perutean ISP untuk alamat IPv4/IPv6.
- **Proxy Viewer (`/tools/proxy-viewer`)**: Pratinjau VirtualHost pada IP server atau host staging sebelum perubahan DNS publik disebarkan.
- **License Checker (`/tools/license-check`)**: Audit lisensi server multi-registry untuk cPanel/WHM, CloudLinux OS, Imunify360, dan JetBackup.
- **SMTP Sender (`/tools/smtp-sender`)**: Verifikasi pengiriman email outbound melalui server SMTP dengan dukungan STARTTLS, SSL/TLS, dan custom template.
- **WHOIS & RDAP (`/tools/dns-lookup`)**: Pengecekan registrar domain, status lifecycle lock, dan tanggal kedaluwarsa via bootstrap ICANN RDAP.

---

## 🚀 Memulai Proyek

### Prasyarat

- [Bun](https://bun.sh) (runtime dan package manager utama)

### Instalasi & Pengembangan

1. Clone repositori:
   ```bash
   git clone https://github.com/elvxk/novax.git
   cd novax
   ```

2. Pasang dependensi:
   ```bash
   bun install
   ```

3. Jalankan server lokal:
   ```bash
   bun dev
   ```

4. Akses melalui browser pada [http://localhost:3000](http://localhost:3000).

### Build Produksi

```bash
bun run build
bun run start
```

---

## 📖 Dokumentasi API

Seluruh alat pada Nova-X dapat diakses secara terprogram melalui REST API publik yang mendukung CORS dan rate limiting standar internasional (IETF RFC 6585).

- **Dokumentasi Lengkap & Playground Interaktif**: [novax.my.id/docs](https://novax.my.id/docs)
- **Base URL Produksi**: `https://novax.my.id/api`

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
