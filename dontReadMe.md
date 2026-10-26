# CRUD_-simples-

request guy: express - app.ts<br>
response guy: express - app.ts<br>
service guy: express - app.ts<br>
repository guy: mongoose - repository.ts<br>
model guy: mongoose - pasta model<br>
DTO guy: typescript - interfaces.ts<br>

idéia = estoque de comida

atual:<br>
[x] - implementar request-check em queries e body<br>

proximo:<br>
[ ] - implementar morgan<br>
[ ] - implementar isness<br>


a fazer:<br>
- implementar throwlhos<br>
- teste de autorização (vai ter que criar otro token)<br>
- colocar token reutilizável no postman<br>
- listagem de endpoint, explicação e exemplo no postman<br>
- listagem de endpoint, explicação e exemplo no readme<br>
- descobrir como será a apresentação<br>
- aumentar test coverage<br>
- refazer com os padrões de codigo da AGX<br>


parece extra:
- garantir mais validação no rc (id, validade e talvez mais pros nome e qtd)<br>
- mais teste de validação (teste uni de erro nos middleware checkers)<br>
- tabela output no site responser sem o campo message, fala co zarco ou PR(vish)<br>
- site request-check "You can change the default required field message by adding (a this, <--- caught in 4K) line of code:"<br>