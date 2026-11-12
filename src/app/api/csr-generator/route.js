import { apiSuccess, apiError } from "@/lib/api-response";
import forge from "node-forge";

function isValidDomain(domain) {
  if (!domain) return false;
  const cleaned = domain.trim().toLowerCase();
  // Valid domain or wildcard domain (*.example.com)
  return /^(\*\.)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(cleaned);
}

function isValidKeySize(keySize) {
  const validSizes = [1024, 2048, 4096];
  return validSizes.includes(keySize);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const {
    domain,
    keySize = 2048,
    country,
    state,
    locality,
    organization,
    organizationalUnit,
    email,
    subjectAltNames,
  } = body;

  const cleanDomain = domain?.trim().toLowerCase();

  if (!cleanDomain || !isValidDomain(cleanDomain)) {
    return apiError(
      "A valid domain name is required (e.g. example.com or *.example.com)",
      400,
      "INVALID_DOMAIN"
    );
  }

  const keySizeNum = parseInt(keySize, 10) || 2048;
  if (!isValidKeySize(keySizeNum)) {
    return apiError(
      "Invalid key size. Supported key sizes: 1024, 2048, 4096",
      400,
      "INVALID_KEY_SIZE"
    );
  }

  if (country && !/^[A-Za-z]{2}$/.test(country.trim())) {
    return apiError(
      "Country must be a valid 2-letter ISO code (e.g. ID, US, SG)",
      400,
      "INVALID_COUNTRY"
    );
  }

  try {
    // 1. Generate RSA key pair
    const keys = forge.pki.rsa.generateKeyPair(keySizeNum);

    // 2. Create Certification Request (CSR)
    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;

    // 3. Populate Subject attributes (RFC 5280 / PKCS#10)
    const subject = [{ name: "commonName", value: cleanDomain }];

    if (country) {
      subject.push({ name: "countryName", value: country.trim().toUpperCase() });
    }
    if (state) {
      subject.push({ name: "stateOrProvinceName", value: state.trim() });
    }
    if (locality) {
      subject.push({ name: "localityName", value: locality.trim() });
    }
    if (organization) {
      subject.push({ name: "organizationName", value: organization.trim() });
    }
    if (organizationalUnit) {
      subject.push({ name: "organizationalUnitName", value: organizationalUnit.trim() });
    }
    if (email) {
      subject.push({ name: "emailAddress", value: email.trim().toLowerCase() });
    }

    csr.setSubject(subject);

    // 4. Populate Subject Alternative Names (SANs)
    const sansSet = new Set();
    // Common Name is always included as first SAN
    sansSet.add(cleanDomain);

    if (Array.isArray(subjectAltNames)) {
      subjectAltNames.forEach((name) => {
        if (typeof name === "string") {
          const s = name.trim().toLowerCase();
          if (isValidDomain(s)) sansSet.add(s);
        }
      });
    } else if (typeof subjectAltNames === "string") {
      subjectAltNames
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(isValidDomain)
        .forEach((s) => sansSet.add(s));
    }

    const sanDns = Array.from(sansSet);

    csr.setAttributes([
      {
        name: "extensionRequest",
        extensions: [
          {
            name: "subjectAltName",
            altNames: sanDns.map((value) => ({
              type: 2, // DNS type
              value,
            })),
          },
        ],
      },
    ]);

    // 5. Sign the CSR with the private key (SHA-256)
    csr.sign(keys.privateKey, forge.md.sha256.create());

    // 6. Verify signature
    if (!csr.verify()) {
      throw new Error("CSR self-signature verification failed");
    }

    // 7. Export PEM strings
    const csrPem = forge.pki.certificationRequestToPem(csr);
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

    return apiSuccess({
      csr: csrPem,
      privateKey: privateKeyPem,
      keySize: keySizeNum,
      domain: cleanDomain,
      subject: {
        commonName: cleanDomain,
        country: country?.trim().toUpperCase() || null,
        state: state?.trim() || null,
        locality: locality?.trim() || null,
        organization: organization?.trim() || null,
        organizationalUnit: organizationalUnit?.trim() || null,
        email: email?.trim().toLowerCase() || null,
      },
      sanDns,
      created: new Date().toISOString(),
    });
  } catch (err) {
    return apiError(
      `CSR generation failed: ${err.message || "Unknown cryptographic error"}`,
      500,
      "CSR_GENERATION_ERROR"
    );
  }
}
