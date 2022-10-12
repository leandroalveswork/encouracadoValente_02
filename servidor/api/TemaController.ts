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
import { MdDetalheTema } from "../modelos/MdDetalheTema";
import { MdResumoTema } from "../modelos/MdResumoTema";
import { PutTema } from "../modelos/PutTema";
import { UtilUrl } from "../UtilUrl";

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
                const idTemaAdicionado = await this.adicionar(req.body, idUsuarioLogado);
                res.send(idTemaAdicionado);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.get('/listar', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const temasResumidos = await this.listar();
                res.send(temasResumidos);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.get('/detalharPorId', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const idTema = UtilUrl.obterParamPorKey(req.url ?? '', 'id');
                if (idTema == undefined) {
                    let ex = new MdExcecao();
                    ex.codigoExcecao = 400;
                    ex.problema = 'Formato da url incorreta';
                    throw ex;
                }
                const temaDetalhado = await this.detalharPorId(idTema);
                res.send(temaDetalhado);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.put('/alterar', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                await this.alterar(req.body, idUsuarioLogado);
                res.send();
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.delete('/excluirPorId', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const idTema = UtilUrl.obterParamPorKey(req.url ?? '', 'id');
                if (idTema == undefined) {
                    let ex = new MdExcecao();
                    ex.codigoExcecao = 400;
                    ex.problema = 'Formato da url incorreta';
                    throw ex;
                }
                const temaDetalhado = await this.detalharPorId(idTema);
                await this.excluirPorId(idTema);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        })
    }

    // codifique as actions:

    // autorizado
    // post
    adicionar = async (novoTema: PostNovoTema, idUsuarioLogado: string): Promise<string> => {
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

    // autorizado
    // get
    listar = async (): Promise<MdResumoTema[]> => {
        const temasDb = await this._temaRepositorio.selectAll();
        let listaTemas: MdResumoTema[] = []
        for (let iTemaDb of temasDb) {
            let iTemaParaPush = new MdResumoTema();
            iTemaParaPush.id = iTemaDb.id;
            iTemaParaPush.nome = iTemaDb.nome;
            iTemaParaPush.preco = iTemaDb.preco;
            iTemaParaPush.descricao = iTemaDb.descricao;
            listaTemas.push(iTemaParaPush);
        }
        return listaTemas;
    }

    // autorizado
    // get
    detalharPorId = async (id: string): Promise<MdDetalheTema> => {
        const temaDb = await this._temaRepositorio.selectByIdOrDefault(id);
        if (temaDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Tema não encontrado.';
            throw ex;
        }
        let temaDetalhado = new MdDetalheTema();
        temaDetalhado.id = temaDb.id;
        temaDetalhado.nome = temaDb.nome;
        temaDetalhado.preco = temaDb.preco;
        temaDetalhado.descricao = temaDb.descricao;
        return temaDetalhado;
    }

    // autorizado
    // put
    alterar = async (tema: PutTema, idUsuarioLogado: string): Promise<void> => {
        let camposNulos: string[] = [];
        if (tema.nome.length == 0) {
            camposNulos.push('Nome');
        }
        if (tema.preco == null || tema.preco <= 0) {
            camposNulos.push('Preço');
        }
        if (tema.descricao.length == 0) {
            camposNulos.push('Descrição');
        }
        if (camposNulos.length > 0) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Os campos ' + StringUteis.listarEmPt(camposNulos) + ' são obrigatórios';
            throw ex;
        }
        const temaDb = await this._temaRepositorio.selectByIdOrDefault(tema.id);
        if (temaDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Tema não encontrado.';
            throw ex;
        }
        let updateTema = new DbTema();
        updateTema.id = tema.id;
        updateTema.nome = tema.nome;
        updateTema.preco = tema.preco ?? 0;
        updateTema.descricao = tema.descricao;
        await this._temaRepositorio.updatePorOperador(updateTema, idUsuarioLogado);
    }

    // autorizado
    // delete
    excluirPorId = async (id: string): Promise<void> => {
        const temaDb = await this._temaRepositorio.selectByIdOrDefault(id);
        if (temaDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Tema não encontrado.';
            throw ex;
        }
        await this._temaRepositorio.deleteById(id);
    }
}

export { TemaController };