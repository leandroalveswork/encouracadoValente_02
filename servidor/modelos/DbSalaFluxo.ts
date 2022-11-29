import { DbEncVn } from "./comum/DbEncVn";

export class DbSalaFluxo extends DbEncVn {
    numeroRecuperacaoUrl: number = 0;
    idPlayer1: string | null = null;
    idPlayer2: string | null = null;
    player1CarregouFluxo: boolean = false;
    player2CarregouFluxo: boolean = false;
    horaCancelamentoSaidaPlayer1: Date | null = null;
    horaCancelamentoSaidaPlayer2: Date | null = null;
    horaUltimaConexaoPlayer1: Date | undefined = undefined;
    horaUltimaConexaoPlayer2: Date | undefined = undefined;
}