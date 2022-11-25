import { DbEncVn } from "./comum/DbEncVn";

export class DbSalaFluxo extends DbEncVn {
    numeroRecuperacaoUrl: number = 0;
    idPlayer1: string | null = null;
    idPlayer2: string | null = null;
    player1CarregouFluxo: boolean = false;
    player2CarregouFluxo: boolean = false;
}