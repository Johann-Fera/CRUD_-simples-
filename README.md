# CRUD_-simples-

request guy: express - main.ts<br>
response guy: express - main.ts<br>
service guy: express - main.ts<br>
repository guy: mongoose - repository.ts<br>
model guy: mongoose - pasta model<br>
DTO guy: typescript - ? (ainda não tem)<br>

idéia = estoque de comida (ferrece, não pensei em algo melhor)

atual:<br>
[x] - mexe co repository, pois o deno não gosta de switch (era só colocar chaves...)<br>
[x] - planejar cenários de erro<br>
[x] - fazer um get/find com query para não ficar separando gets<br>
[x] - fazer testes de integração, só to fazendo e2e<br>
[x] - refazer testes no padrão AGX<br>

proximo:<br>

[ ] - fazer um readme melhor para se organizar<br>
[ ] - criar uma transação, faz comidas fora da validade, podre, sei la. Transfira a qtd de uma para outra (ou faça uma collection de venda)<br>
[ ] - colocar query em put e delete também<br>
[ ] - usar melhor validation no mongoose<br>
[ ] - melhorar o schema de comida<br>
[ ] - fazer um DTO para melhorar os passa e repassa de cliente e servidor<br>

a fazer:<br>
- entender autenticação<br>
- parar de usar any e tipificar as coisas<br>
- e mais muita coisa séloco
