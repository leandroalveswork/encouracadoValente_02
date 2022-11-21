import { Router } from "express";
import { inject, injectable, postConstruct } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { MdExcecao } from "./MdExcecao";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { MdUsuarioLogado } from "../modelos/MdUsuarioLogado";
import { PostCadastroUsuario } from "../modelos/PostCadastroUsuario";
import { StringUteis } from "../uteis/StringUteis";
import { DbUsuario } from "../modelos/DbUsuario";
import { ConfigBack } from "../ConfigBack";
import { UsuarioRepositorio } from "../repositorio/UsuarioRepositorio";
import { ControllerBase } from "./ControllerBase";
import { UtilUrl } from "../UtilUrl";
import { PutAdicaoCreditos } from "../modelos/PutAdicaoCreditos";

@injectable()
class LiberacaoController extends ControllerBase {
    private _usuarioRepositorio: UsuarioRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.UsuarioRepositorio) usuarioRepositorio: UsuarioRepositorio,
    ) {
        super(configBack);
        this._configBack = configBack;
        this._usuarioRepositorio = usuarioRepositorio;
        this.router = Router();
        this.router.put('/adicionarCreditos', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                await this.adicionarCreditos(req.body, idUsuarioLogado);
                res.send();
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
    }

    // codifique as actions:

    // autorizado
    // put
    adicionarCreditos = async (adicaoCreditos: PutAdicaoCreditos, idUsuarioLogado: string): Promise<void> => {
        
        // Validaçoes
        if (adicaoCreditos.valorParaAdicionar <= 0) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'É obrigatório informar o valor para adicionar.';
            throw ex;
        }
        const usuarioCreditadoDb = await this._usuarioRepositorio.selectByIdOrDefault(adicaoCreditos.idUsuarioCreditado);
        if (usuarioCreditadoDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Usuário creditado não encontrado';
            throw ex;
        }
        
        // Creditar na conta
        const saldo = usuarioCreditadoDb.creditos != undefined ? usuarioCreditadoDb.creditos : 0; 
        let usuarioAtual = new DbUsuario();
        usuarioAtual = usuarioCreditadoDb;
        usuarioAtual.creditos = saldo + adicaoCreditos.valorParaAdicionar;
        await this._usuarioRepositorio.updatePorOperador(usuarioAtual, idUsuarioLogado);
    }

}

export { LiberacaoController };
