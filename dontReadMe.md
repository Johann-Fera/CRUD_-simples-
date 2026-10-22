# CRUD_-simples-

request guy: express - app.ts<br>
response guy: express - app.ts<br>
service guy: express - app.ts<br>
repository guy: mongoose - repository.ts<br>
model guy: mongoose - pasta model<br>
DTO guy: typescript - interfaces.ts<br>

idéia = estoque de comida (ferrece, não pensei em algo melhor)

atual:<br>
[x] - entender autenticação<br>
[x] - teste de autenticação<br>
[x] - instrução de execução no readme<br>
[x] - como rodar testes no readme<br>

proximo:<br>
[ ] - ARRUMAR TESTES<br>
[ ] - refazer com os padrões de codigo da AGX<br>
[ ] - implementar os pacotes obrigatórios<br>
[ ] - log via morgan<br>
[ ] - listagem de endpoint, explicação e exemplo no postman<br>
[ ] - listagem de endpoint, explicação e exemplo no readme<br>

a fazer:<br>
- erros com padrão responser e throwlhos<br>

parece extra:
- teste de autorização (vai ter que criar otro token)<br>
- garantir mais validação (validação nas rotas)<br>
- teste de validação (teste uni de erro nas rotas)<br>


vamo então:

jwt-secret X
script de gerar token X
coloca o token na env X
middleware de autentica X
colocar auth em tudo menos get X
criar/mudar testes