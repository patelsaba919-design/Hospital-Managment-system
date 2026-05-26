import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "hospital-super-secure-jwt-secret-key-2026";

// Hash a password using SHA-256
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Generate an authentic JWT token (Header.Payload.Signature) signed via HMAC-SHA256
export function generateToken(payload: { id: string; email: string; role: string; name: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  
  // Attach expiry of 24h
  const payloadWithExpiry = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };
  const encodedPayload = Buffer.from(JSON.stringify(payloadWithExpiry)).toString("base64url");
  
  // Calculate signature
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify and retrieve payload from a signed token
export function verifyToken(token: string): { id: string; email: string; role: string; name: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString());
    
    // Verify expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
      name: decodedPayload.name
    };
  } catch (err) {
    return null;
  }
}
