import { Router } from "express";
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
import { ControllerBase } from "./ControllerBase";

@injectable()
class TemaController extends ControllerBase {
    private _temaRepositorio: TemaRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.TemaRepositorio) temaRepositorio: TemaRepositorio
    ) {
        super(configBack);
        this._configBack = configBack;
        this._temaRepositorio = temaRepositorio;
        this.router = Router();
        this.router.post('/adicionar', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const idTemaAdicionado = await this.adicionarTema(req.body, idUsuarioLogado);
                res.send(idTemaAdicionado);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
    }

    // codifique as actions:

    // autorizado
    // post
    adicionarTema = async (novoTema: PostNovoTema, idUsuarioLogado: string): Promise<string> => {
        let camposNulos: string[] = [];
        if (novoTema.nome.length == 0) {
            camposNulos.push('Nome');
        }
        if (novoTema.preco == null || novoTema.preco <= 0) {
            camposNulos.push('Preço');
        }
        if (novoTema.descricao.length == 0) {
            camposNulos.push('Descrição');
        }
        if (camposNulos.length > 0) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Os campos ' + StringUteis.listarEmPt(camposNulos) + ' são obrigatórios';
            throw ex;
        }
        let insertTema = new DbTema();
        insertTema.id = StringUteis.gerarNovoIdDe24Caracteres();
        insertTema.nome = novoTema.nome;
        insertTema.preco = novoTema.preco ?? 0;
        insertTema.descricao = novoTema.descricao;
        await this._temaRepositorio.insertPorOperador(insertTema, idUsuarioLogado);
        return insertTema.id;
    }

}

export { TemaController };