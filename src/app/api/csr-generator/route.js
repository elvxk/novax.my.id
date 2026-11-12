import { apiSuccess, apiError } from "@/lib/api-response";
import forge from "node-forge";

function isValidDomain(domain) {
  if (!domain) return false;
  const cleaned = domain.trim().toLowerCase();
  return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(cleaned);
}

function isValidKeySize(keySize) {
  const validSizes = [512, 1024, 2048, 4096];
  return validSizes.includes(keySize);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

  const { domain, keySize, country, state, locality, organization, organizationalUnit, email, subjectAltNames } = body;

  if (!domain || !isValidDomain(domain)) {
    return apiError("A valid domain name is required", 400, "INVALID_DOMAIN");
  }

  const keySizeNum = parseInt(keySize, 10);
  if (!isValidKeySize(keySizeNum)) {
    return apiError(
      "Invalid key size. Must be one of: 512, 1024, 2048, 4096",
      400,
      "INVALID_KEY_SIZE"
    );
  }

  try {
    const keys = forge.pki.rsa.generateKeyPair(keySizeNum);

    const csr = forge.pki.createCertificationRequest();

    const subject = [];
    if (country) subject.push({ shortName: "c", value: country.trim() });
    if (state) subject.push({ shortName: "st", value: state.trim() });
    if (locality) subject.push({ shortName: "l", value: locality.trim() });
    if (organization) subject.push({ name: "organizationName", value: organization.trim() });
    if (organizationalUnit) subject.push({ shortName: "ou", value: organizationalUnit.trim() });
    if (email) subject.push({ name: "emailAddress", value: email.trim() });

    csr.setSubject(subject);

    if (subjectAltNames && Array.isArray(subjectAltNames)) {
      const altNames = subjectAltNames
        .filter((name) => name && typeof name === "string")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      if (altNames.length > 0) {
        csr.setAttributes([
          {
            name: "extensionRequest",
            extensions: [
              {
                name: "subjectAltName",
                altNames: altNames.map((value) => ({
                  type: 2,
                  value,
                })),
              },
            ],
          },
        ]);
      }
    }

    csr.sign(keys.privateKey);

    const pem = forge.pki.certificationRequestToPem(csr);

    const subjectString = csr.getSubjectString();

    let sanDNS = [];
    try {
      const extAttr = csr.getAttribute({ name: "extensionRequest" });
      if (extAttr && Array.isArray(extAttr.extensions)) {
        extAttr.extensions.forEach((ext) => {
          if (ext.name === "subjectAltName") {
            ext.altNames.forEach((alt) => {
              if (alt.value) sanDNS.push(alt.value);
            });
          }
        });
      }
    } catch (err) {
      // Ignore SAN parsing errors
    }

    return apiSuccess({
      success: true,
      pem,
      keySize: keySizeNum,
      domain,
      subject: subjectString,
      sanDns: sanDNS.length > 0 ? sanDNS : undefined,
      created: new Date().toISOString(),
      message: "Certificate Signing Request generated successfully",
    });
  } catch (err) {
    console.error("CSR generation error:", err);
    return apiError(
      "CSR generation failed: " + (err.message || "Unknown error"),
      500,
      "CSR_GENERATION_ERROR"
    );
  }
}
