export class MdUsuarioLogado {
    constructor() {
        this.id = '';
        this.token = '';
        this.nome = '';
        this.email = '';
        this.eSuperuser = false;
        this.eUsuarioGoogle = false;
        this.creditos = 0;
    }
    id: string
    token: string
    nome: string
    email: string
    eSuperuser: boolean
    eUsuarioGoogle: boolean
    creditos: number
}