import { DbEncVn } from "./comum/DbEncVn";

export class DbCompra extends DbEncVn {
    idTema: string = '';
    idUsuarioComprador: string = '';
    estaEquipado: boolean = false;
}