# CRUD_-simples-

request guy: express - main.ts<br>
response guy: express - main.ts<br>
service guy: typescript? - (acho que nun vai ter não)<br>
repository guy: mongoose - repository.ts<br>
model guy: mongoose - pasta model<br>
DTO guy: typescript - ? (ainda não tem)<br>

idéia = estoque de comida (ferrece, não pensei em algo melhor)

atual:<br>
[x] - fazer um put pra "/comida" pra muda a quantidade de abacates para quantidade de comidas na collection;<br>
[x] - fazer um delete pra "/comida" suma cas comida do post<br>

proximo:<br>
[ ] - mexe co repository, pois o deno não gosta de switch<br>
[ ] - planejar cenários de erro<br>
[ ] - fazer um readme melhor para se organizar<br>
[ ] - criar uma transação, faz comidas fora da valdiade, podre, sei la. Transfira a qtd de uma para outra (ou faça uma collection de venda)<br>
[ ] - (talvez) fazer um read/find com query para não ficar separando reads<br>
[ ] - como fazer testes unitarios e de integração? só to fazendo e2e<br>
[ ] - fazer testes no padrão AGX<br>

a fazer:<br>
- usar melhor validation no mongoose<br>
- entender autenticação<br>
- melhorar o schema de comida<br>
- fazer um DTO para melhorar os passa e repassa de cliente e servidor<br>
- parar de usar any e tipificar as coisas<br>
- e mais muita coisa séloco
