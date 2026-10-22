# Instruções de execução


- Tenha o deno instalado no computador
- Clone o repositório
- Criar .env no mesmo nivel do .env.example e com as chaves dele 
- Colocar os valores corretos para as chaves
- para conseguir o JWT_secret, gere ele com 'deno eval "const bytes = crypto.getRandomValues(new Uint8Array(32)); console.log(btoa(String.fromCharCode(...bytes)))"'
- para conseguir a API_token, gere ela com "deno --env-file=.env .\generate_token.ts"
- Rode "cd .\crud_simples\", para entrar na pasta do backend
- Rode "deno --env-file=.env -N -E -S -R  main.ts" para iniciar

# Rodar testes
- Rode "cd .\crud_simples\", para entrar na pasta do backend
- Rode "deno test --allow-net --env-file=.env -E" para iniciar os testes