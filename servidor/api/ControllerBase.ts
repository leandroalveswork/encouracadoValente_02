import { Request, Router } from "express";
import { inject, injectable, postConstruct } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { PostLoginUsuario } from "../modelos/PostLoginUsuario";
import { MdExcecao } from "./MdExcecao";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { MdUsuarioLogado } from "../modelos/MdUsuarioLogado";
import { PostCadastroUsuario } from "../modelos/PostCadastroUsuario";
import { StringUteis } from "../uteis/StringUteis";
import { DbUsuario } from "../modelos/DbUsuario";
import { ConfigBack } from "../ConfigBack";
import { UsuarioRepositorio } from "../repositorio/UsuarioRepositorio";
import { IUsuarioGoogle } from "../modelos/IUsuarioGoogle";
import { PostNovoTema } from "../modelos/PostNovoTema";
import { TemaRepositorio } from "../repositorio/TemaRepositorio";
import { DbTema } from "../modelos/DbTema";

@injectable()
class ControllerBase {
    protected _configBack: ConfigBack
    constructor(
        configBack: ConfigBack,
    ) {
        this._configBack = configBack;
    }

    router: Router;

    protected obterIdUsuarioLogado = async (req: Request<{}, any, any, qs.ParsedQs, Record<string, any>>): Promise<string> => {
        const tokenAcesso = req.headers['x-access-token'];
        if (tokenAcesso == undefined || tokenAcesso == '') {
            let ex = new MdExcecao();
            ex.codigoExcecao = 401;
            ex.problema = 'Usuário não autenticado ou sessão expirada.';
            throw ex;
        }
        try {
            const idUsuarioLogadoWrapper: any = jsonwebtoken.verify(tokenAcesso as string, this._configBack.salDoJwt);
            return idUsuarioLogadoWrapper.id;
        } catch (exc) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 401;
            ex.problema = 'Usuário não autenticado ou sessão expirada.';
            throw ex;
        }
    }
}

export { ControllerBase };