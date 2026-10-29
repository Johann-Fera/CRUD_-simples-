# Instruções de execução


- Tenha o deno instalado no computador
- Clone o repositório
- Criar .env no mesmo nivel do .env.example e com as chaves dele 
- Colocar os valores corretos para as chaves
- para conseguir o JWT_secret, gere ele com `deno eval "const bytes = crypto.getRandomValues(new Uint8Array(32)); console.log(btoa(String.fromCharCode(...bytes)))"`
- Rode `cd crud_simples`, para entrar na pasta do backend
- para conseguir a API_token e o noRole_token, gere eles com `deno --env-file=.env generate_token.ts`
- Rode `deno --env-file=.env -N -E -S -R  main.ts` para iniciar

# Rodar testes
- Rode `cd crud_simples`, para entrar na pasta do backend
- Rode `deno test --allow-net --env-file=.env -E` para iniciar os testes

#### Postman: https://documenter.getpostman.com/view/58740317/2sBYHVwzAv

## Endpoints
- findQuery: GET http://localhost:3000/
- saveComida: POST http://localhost:3000/comida
- updateComId: PUT http://localhost:3000/comida/:id
- deleteQuery: DELETE http://localhost:3000/comida
- transferirExpirada: POST http://localhost:3000/comida/expirou

### findQuery
Rota para pegar uma lista de comidas com (ou sem) uma query.

exemplo de sucesso:
GET `http://localhost:3000/?nome=banana&quantidade=3`
```JSON
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "comidas retornadas",
  "data": [
    {
      "_id": "6ae0ab4278df6bcd4ed97b17",
      "nome": "banana",
      "quantidade": 3,
      "validade": true
    }
  ]
}
```
exemplo de erro:
GET `http://localhost:3000/?nome=banana&quantidade=banana`
```JSON
{
  "status": "UNPROCESSABLE_ENTITY",
  "code": 422,
  "success": false,
  "message": "Unprocessable Entity",
  "errors": {
    "code": 422,
    "status": "UNPROCESSABLE_ENTITY",
    "message": "quantidade deve ser number"
  }
}
```
### saveComida
Rota para colocar uma comida no banco.

exemplo de sucesso:
POST `http://localhost:3000/comida`
```
--body '{
    "nome": "comida",
    "quantidade": 10
}'
```
```JSON
{
  "status": "CREATED",
  "code": 201,
  "success": true,
  "message": "comidas criada",
  "data": "6ae23a657528021214d5183b"
}
```
exemplo de erro:
POST `http://localhost:3000/comida`
```
--body '{
    "nome": "comida",
    "quantidade": -1
}'
```
```JSON
{
  "status": "UNPROCESSABLE_ENTITY",
  "code": 422,
  "success": false,
  "message": "Unprocessable Entity",
  "errors": {
    "code": 422,
    "status": "UNPROCESSABLE_ENTITY",
    "message": "quantidade inválida",
    "errors": [
      {
        "field": "quantidade",
        "message": "a quantidade não deve ser negativa"
      }
    ]
  }
}
```
### updateComId
Rota para atualizar uma comida no banco

exemplo de sucesso:
PUT `http://localhost:3000/comida/6ae0ab01cf1a525cc411e8b4`
```
--body '{
    "nome": "abacate", 
    "quantidade": 10
}'
```
```JSON
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "comidas atualizada",
  "data": {
    "_id": "6ae0ab01cf1a525cc411e8b4",
    "nome": "abacate",
    "quantidade": 10,
    "validade": true
  }
}
```
exemplo de erro:
PUT `http://localhost:3000/comida/6ae0ab01cf1a525cc411e8b4`
```
--body '{
    "nome": 50, 
    "quantidade": 20
}'
```
```JSON
{
  "status": "UNPROCESSABLE_ENTITY",
  "code": 422,
  "success": false,
  "message": "Unprocessable Entity",
  "errors": {
    "code": 422,
    "status": "UNPROCESSABLE_ENTITY",
    "message": "nome deve ser string"
  }
}
```
### deleteQuery
Rota para excluir comidas do banco

exemplo de sucesso:
DELETE `http://localhost:3000/comida?quantidade=10`
exemplo de erro:
DELETE `http://localhost:3000/comida`
```JSON
{
  "status": "BAD_REQUEST",
  "code": 400,
  "success": false,
  "message": "Bad Request",
  "errors": {
    "code": 400,
    "status": "BAD_REQUEST",
    "message": "filtro vazio em delete"
  }
}
```
### transferirExpirada
Rota para transferir quantidade de comidas na validade para comidas fora da validade (deve ser o mesmo nome de comida).

exemplo de sucesso:
POST `http://localhost:3000/comida/expirou`
```
--body '{
    "id_dv": "6ae0ab4278df6bcd4ed97b17", 
    "id_fv": "6ae0ab4fc07ff03bcc5edf7e", 
    "quantidade":2
}'
```
```JSON
{
  "status": "ACCEPTED",
  "code": 202,
  "success": true,
  "message": "transferencia feita",
  "data": "transação feita"
}
```
exemplo de erro:
POST `http://localhost:3000/comida/expirou`
```
--body '{
    "id_dv": "6ae0ab4278df6bcd4ed97b17", 
    "id_fv": "6ae0ab4278df6bcd4ed97b18", 
    "quantidade":2
}'
```
```JSON
{
  "status": "NOT_FOUND",
  "code": 404,
  "success": false,
  "message": "Not Found",
  "errors": {
    "code": 404,
    "status": "NOT_FOUND",
    "message": "não encontrou comida fora da validade com esse id"
  }
}
```