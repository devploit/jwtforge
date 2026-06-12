/**
 * Clearly-fake example tokens for first-run empty states.
 * None of these are real credentials. The HS256 sample is signed with the
 * secret "secret" so the brute-force demo finds it instantly.
 */

export const SAMPLES: { id: string; label: string; description: string; token: string }[] = [
  {
    id: "hs256-weak",
    label: "HS256 (weak secret)",
    description: 'Signed with the secret "secret" — brute-forceable in milliseconds.',
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3IiwibmFtZSI6IkRlbW8gVXNlciIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MDA2NTM2MjJ9._QFBoQuGxSyeRbFjw51U2tpS459u9UsPiIoK15vNz3k",
  },
  {
    id: "alg-none",
    label: "alg:none",
    description: "Unsigned token declaring the 'none' algorithm.",
    token:
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0.",
  },
  {
    id: "rs256",
    label: "RS256 (asymmetric)",
    description: "RSA-signed token — candidate for RS→HS algorithm confusion.",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0xIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOmZhbHNlLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJhdWQiOiJhcGkiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTkwMDY1MzYyMn0.NHVaYe26MbtOYhSKkoKYdFVomg4i8ZJd8_-RU8VNbftc4TSMb4bXP3l3YlNWACwyXPGffz5aXHc6lty1Y2t4SWRqGteragsVdZufDn5BlnJl9pdR_kdVFUsra2rWKEofkZeIC4yWytE58sMIihvo9H1ScmmVwBcQP6XETqYd0aSHp1gOa9RdUPDvoXQ5oqygTqVtxaDr6wUFKrKItgBMzWIdNZ6y7O9E0DhEPTbE9rfBo6KTFsHAZnMg4k68CDp2woYIaXbmYTWcvbzIuHO7_37GT79XdIwkm95QJ7hYC9RiwrV7mesbY4PAahERJawntho0my942XheVLmGwLMBkQ",
  },
];
