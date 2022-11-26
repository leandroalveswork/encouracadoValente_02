import { DbEncVn } from "./comum/DbEncVn";

export class DbUsuario extends DbEncVn {
    constructor() {
        super();
        this.nome = '';
        this.email = '';
        this.senha = '';
        this.eSuperuser = false;
        this.eUsuarioGoogle = false;
        this.creditos = undefined;
    }
    nome: string
    email: string
    senha: string
    eSuperuser: boolean
    eUsuarioGoogle: boolean
    creditos: number | undefined
}