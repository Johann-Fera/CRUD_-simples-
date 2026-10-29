import is from "isness";
import requestCheck from "request-check";

export const rc = (requestCheck).default();
rc.requiredMessage = ':name não fornecido';

rc.addRule('nome', 
    {
    validator: (nome:string) => !is.whitespace(nome),
    message: 'o nome não deve ser vazio',
    },
    {
    validator: (nome:string) => {
        const nomeSemEspaco = nome.replaceAll(" ","");
        if (is.alphanumeric(nomeSemEspaco)) {
            return true
        }
    },
    message: 'o nome deve conter somente letras e/ou numeros',
    }
);

rc.addRule('quantidade', {
    validator: (qtd:number) => qtd >= 0,
    message: 'a quantidade não deve ser negativa',
});

rc.addRule('header', {
    validator: (header:string) => header.includes("Bearer"),
    message: 'header deve incluir o Bearer',
})