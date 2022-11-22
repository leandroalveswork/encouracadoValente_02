import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from 'qs';

export class MdExcecao {
    constructor() {
        this.problema = '';
        this.codigoExcecao = 400;
    }
    problema: string
    codigoExcecao: number

    static enviarExcecao = (
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
        res: Response<any, Record<string, any>>,
        exc: any
    ) => {
        console.log(' olha o erro async');
        console.log(exc);
        if (exc instanceof MdExcecao) {
            res.status(exc.codigoExcecao).send(exc.problema);
        } else {
            res.status(500).send('Ocorreu um problema no servidor, tente novamente mais tarde.');
        }
    }
}