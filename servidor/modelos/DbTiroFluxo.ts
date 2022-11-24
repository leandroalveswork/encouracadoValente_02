import { DbEncVn } from "./comum/DbEncVn";

export class DbTiroFluxo extends DbEncVn {
    numeroRecuperacaoUrlSalaFluxo: number = 0;
    idUsuarioAlvo: string = '';
    numeroLinha: number = 0;
    numeroColuna: number = 0;
}