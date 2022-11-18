import { DbEncVn } from "./comum/DbEncVn";

export class DbArquivo extends DbEncVn {
    nomeArquivo: string | undefined = undefined;
    nome: string | undefined = undefined;
    tipo: string = '';
    buffer: Buffer = Buffer.from([]);
    numeroRecuperacao: string = '';
}