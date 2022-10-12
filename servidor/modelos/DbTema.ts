import { DbEncVn } from "./comum/DbEncVn";

export class DbTema extends DbEncVn {
    constructor() {
        super();
        this.nome = '';
        this.preco = 0;
        this.descricao = '';
    }
    nome: string
    preco: number 
    descricao: string
}