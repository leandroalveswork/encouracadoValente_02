export class PutUpdateUsuario {
    constructor() {
        this.nome = '';
        this.eAlteracaoSenha = false;
        this.senhaAnterior = '';
        this.senhaNova = '';
    }
    nome: string
    eAlteracaoSenha: boolean
    senhaAnterior: string
    senhaNova: string
}