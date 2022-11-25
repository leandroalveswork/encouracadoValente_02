import { DbEncVn } from "./comum/DbEncVn";

export class DbPosicaoFluxo extends DbEncVn {
    numeroRecuperacaoUrlSalaFluxo: number = 0;
    idUsuarioEnviador: string = '';
    tamanhoQuadradosNavio: number = 0;
    numeroLinha: number = 0;
    numeroColuna: number = 0;
    orientacao: number = 0;
}