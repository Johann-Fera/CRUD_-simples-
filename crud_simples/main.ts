import { connectdb, disconnectFromMongoDB } from './repository.ts';
import { app } from "./app.ts";

const port = 3000;

connectdb();

const server : ReturnType<typeof app.listen> = app.listen(port, () => {
  console.log('rodando local em: http://localhost:3000/');
});

Deno.addSignalListener("SIGINT", () => {
  console.log("\nEncerrando...");
  server.close(() => {
    disconnectFromMongoDB();
    Deno.exit(0);
  });
});