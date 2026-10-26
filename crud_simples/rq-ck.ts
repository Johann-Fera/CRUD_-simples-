import requestCheck from "request-check";

export const rc = (requestCheck as any).default();
rc.requiredMessage = ':name não fornecido';

rc.addRule('nome', {
    validator: (nome:string) => nome.trim() != "",
    message: 'o nome não deve ser vazio',
});

rc.addRule('quantidade', {
    validator: (qtd:number) => qtd >= 0,
    message: 'a quantidade não deve ser negativa',
});

rc.addRule('header', {
    validator: (header:string) => header.includes("Bearer"),
    message: 'header deve incluir o Bearer',
})