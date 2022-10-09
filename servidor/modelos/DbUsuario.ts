import { DbEncVn } from "./comum/DbEncVn";

export class DbUsuario extends DbEncVn {
    constructor() {
        super();
        this.nome = '';
        this.email = '';
        this.senha = '';
        this.eSuperuser = false;
        this.eUsuarioGoogle = false;
    }
    nome: string
    email: string
    senha: string
    eSuperuser: boolean
    eUsuarioGoogle: boolean
}