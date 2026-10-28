import jwt from "jsonwebtoken";

const secret = Deno.env.get("JWT_secret");
// talvez fazer um segundo token para simular menos aturização, mas ainda sim, autenticação
const token = jwt.sign(
  { role: "admin", expiresIn: 10 * 365 * 24 * 60 * 60 },
  secret
);
const token2 = jwt.sign(
  { role: "no one", expiresIn: 10 * 365 * 24 * 60 * 60 },
  secret
);
console.log("admin-> "+token);
console.log("no one-> "+token2);