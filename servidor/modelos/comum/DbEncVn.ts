export class DbEncVn {
    constructor() {
        this.id = '';
        this.idUsuarioFezInclusao = '';
        this.horaInclusao = new Date();
        this.idUsuarioFezUltimaAtualizacao = '';
        this.horaUltimaAtualizacao = null;
    }
    id: string
    idUsuarioFezInclusao: string
    horaInclusao: Date
    idUsuarioFezUltimaAtualizacao: string
    horaUltimaAtualizacao: Date | null
}