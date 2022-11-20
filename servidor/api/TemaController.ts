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
import { table } from "console";
import { NavioTemaRepositorio } from "../repositorio/NavioTemaRepositorio";
import { DbNavioTema } from "../modelos/DbNavioTema";
import { MdDetalheNavioTema } from "../modelos/MdDetalheNavioTema";
import { ArquivoRepositorio } from "../repositorio/ArquivoRepositorio";
import { MdArquivoBase64 } from "../modelos/MdArquivoBase64";
import { MdPreviaNavio } from "../modelos/MdPreviaNavio";

@injectable()
class TemaController extends ControllerBase {
    private _temaRepositorio: TemaRepositorio
    private _navioTemaRepositorio: NavioTemaRepositorio
    private _arquivoRepositorio: ArquivoRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.TemaRepositorio) temaRepositorio: TemaRepositorio,
        @inject(LiteralServico.NavioTemaRepositorio) navioTemaRepositorio: NavioTemaRepositorio,
        @inject(LiteralServico.ArquivoRepositorio) arquivoRepositorio: ArquivoRepositorio
    ) {
        super(configBack);
        this._configBack = configBack;
        this._temaRepositorio = temaRepositorio;
        this._navioTemaRepositorio = navioTemaRepositorio;
        this._arquivoRepositorio = arquivoRepositorio;
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
                // console.log('inicio detalhe');
                
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const idTema = UtilUrl.obterParamPorKey(req.url ?? '', 'id');
                if (idTema == undefined || idTema == '') {
                    let ex = new MdExcecao();
                    ex.codigoExcecao = 400;
                    ex.problema = 'Formato da url incorreta';
                    throw ex;
                }
                // console.log(req.url);
                
                // console.log(idTema);
                
                // console.log('   idTema detalhe');
                
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
                if (idTema == undefined || idTema == '') {
                    let ex = new MdExcecao();
                    ex.codigoExcecao = 400;
                    ex.problema = 'Formato da url incorreta';
                    throw ex;
                }
                await this.excluirPorId(idTema);
                res.send();
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
        if (novoTema.naviosTema.length == 0) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'É obrigatório preencher pelo menos um navio para adicionar um tema.';
            throw ex;
        }
        let insertTema = new DbTema();
        insertTema.id = StringUteis.gerarNovoIdDe24Caracteres();
        insertTema.nome = novoTema.nome;
        insertTema.preco = novoTema.preco ?? 0;
        insertTema.descricao = novoTema.descricao;
        let lInsertNaviosTema: DbNavioTema[] = [];
        for (let iNovoNavioTema of novoTema.naviosTema) {
            let navioTemaParaPush = new DbNavioTema();
            navioTemaParaPush.id = StringUteis.gerarNovoIdDe24Caracteres();
            navioTemaParaPush.idTema = insertTema.id;
            navioTemaParaPush.tamnQuadrados = iNovoNavioTema.tamnQuadrados;
            navioTemaParaPush.nomePersonalizado = iNovoNavioTema.nomePersonalizado;
            navioTemaParaPush.numeroRecuperacaoArquivoImagemNavio = iNovoNavioTema.numeroRecuperacaoArquivoImagemNavio;
            lInsertNaviosTema.push(navioTemaParaPush);
        }
        await this._temaRepositorio.insertPorOperador(insertTema, idUsuarioLogado);
        await this._navioTemaRepositorio.insertMuitosNaviosTema(lInsertNaviosTema, idUsuarioLogado);
        return insertTema.id;
    }

    // autorizado
    // get
    listar = async (): Promise<MdResumoTema[]> => {
        const temasDb = await this._temaRepositorio.selectAll();
        const naviosTemaDb = await this._navioTemaRepositorio.selectAll();
        const arquivosDb = await this._arquivoRepositorio.selectAll();
        let listaTemas: MdResumoTema[] = [];
        for (let iTemaDb of temasDb) {
            
            // Dados do tema
            let iTemaParaPush = new MdResumoTema();
            iTemaParaPush.id = iTemaDb.id;
            iTemaParaPush.nome = iTemaDb.nome;
            iTemaParaPush.preco = iTemaDb.preco;
            iTemaParaPush.descricao = iTemaDb.descricao;
            
            // Loop nos naviosTema para pegar cada previa
            iTemaParaPush.previas = [];
            const naviosTemaPrevia = naviosTemaDb
                .filter(x => x.idTema == iTemaDb.id)
                .sort((a, b) => a.tamnQuadrados - b.tamnQuadrados);
            for (let iNavioTemaPrevia of naviosTemaPrevia) {
                
                // Recuperar o arquivo
                const arquivoPrevia = arquivosDb.find(x => x.numeroRecuperacao == iNavioTemaPrevia.numeroRecuperacaoArquivoImagemNavio);
                if (arquivoPrevia == undefined)
                    continue;
                    
                // Parsear em MdPreviaNavio
                let arquivoBase64 = new MdArquivoBase64();
                arquivoBase64.nomeArquivo = arquivoPrevia.nomeArquivo;
                arquivoBase64.nome = arquivoPrevia.nome;
                arquivoBase64.tipo = arquivoPrevia.tipo;
                arquivoBase64.dadosBase64 = arquivoPrevia.buffer.toString('base64');
                let previaNavioParaPush = new MdPreviaNavio();
                previaNavioParaPush.tamanhoQuadrados = iNavioTemaPrevia.tamnQuadrados;
                previaNavioParaPush.arquivo = arquivoBase64;
                previaNavioParaPush.linkLocal = '';
                
                // Fim do loop, adicionando a previa
                iTemaParaPush.previas.push(previaNavioParaPush);
            }
            listaTemas.push(iTemaParaPush);
        }
        return listaTemas;
    }

    // autorizado
    // get
    detalharPorId = async (id: string): Promise<MdDetalheTema> => {
        const temaDb = await this._temaRepositorio.selectByIdOrDefault(id);
        // table(temaDb);
        if (temaDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Tema não encontrado.';
            throw ex;
        }
        // console.log('tema selected');
        const naviosTemaDb = await this._navioTemaRepositorio.selectMuitosNaviosTemaByTemaId(id);
        const numerosRecuperacaoNaviosTemaDb = naviosTemaDb.map(x => x.numeroRecuperacaoArquivoImagemNavio);
        const arquivosNaviosTemaDb = await this._arquivoRepositorio.selectByListaNumerosRecuperacao(numerosRecuperacaoNaviosTemaDb);
        
        let temaDetalhado = new MdDetalheTema();
        temaDetalhado.id = temaDb.id;
        temaDetalhado.nome = temaDb.nome;
        temaDetalhado.preco = temaDb.preco;
        temaDetalhado.descricao = temaDb.descricao;
        for (let iNavioTemaDb of naviosTemaDb) {
            let navioTemaParaPush = new MdDetalheNavioTema();
            navioTemaParaPush.id = iNavioTemaDb.id;
            navioTemaParaPush.tamnQuadrados = iNavioTemaDb.tamnQuadrados;
            navioTemaParaPush.nomePersonalizado = iNavioTemaDb.nomePersonalizado;
            const arquivoNavioTemaDb = arquivosNaviosTemaDb.find(x => x.numeroRecuperacao == iNavioTemaDb.numeroRecuperacaoArquivoImagemNavio);
            if (arquivoNavioTemaDb == undefined)
                continue;
            let arquivoBase64 = new MdArquivoBase64();
            arquivoBase64.nomeArquivo = arquivoNavioTemaDb.nomeArquivo;
            arquivoBase64.nome = arquivoNavioTemaDb.nome;
            arquivoBase64.tipo = arquivoNavioTemaDb.tipo;
            arquivoBase64.dadosBase64 = arquivoNavioTemaDb.buffer.toString('base64');
            navioTemaParaPush.arquivoImagemNavio = arquivoBase64;
            navioTemaParaPush.numeroRecuperacaoArquivoImagemNavio = iNavioTemaDb.numeroRecuperacaoArquivoImagemNavio;
            temaDetalhado.naviosTema.push(navioTemaParaPush);
        }
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
        if (tema.naviosTema.length == 0) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'É obrigatório preencher pelo menos um navio para alterar um tema.';
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
        let lNaviosAtualizados: DbNavioTema[] = [];
        for (let iNavioTema of tema.naviosTema) {
            let navioTemaParaPush = new DbNavioTema();
            navioTemaParaPush.id = StringUteis.gerarNovoIdDe24Caracteres();
            navioTemaParaPush.idTema = tema.id;
            navioTemaParaPush.tamnQuadrados = iNavioTema.tamnQuadrados;
            navioTemaParaPush.nomePersonalizado = iNavioTema.nomePersonalizado;
            navioTemaParaPush.numeroRecuperacaoArquivoImagemNavio = iNavioTema.numeroRecuperacaoArquivoImagemNavio;
            lNaviosAtualizados.push(navioTemaParaPush);
        }
        await this._temaRepositorio.updatePorOperador(updateTema, idUsuarioLogado);
        await this._navioTemaRepositorio.updateMuitosNaviosTemaByTemaId(updateTema.id, lNaviosAtualizados, idUsuarioLogado);
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
        const naviosTemaDb = await this._navioTemaRepositorio.selectMuitosNaviosTemaByTemaId(id);
        const numerosRecuperacaoNaviosTemaDb = naviosTemaDb.map(x => x.numeroRecuperacaoArquivoImagemNavio);
        
        await this._temaRepositorio.deleteById(id);
        await this._navioTemaRepositorio.deleteMuitosNaviosTemaByTemaId(id);
        await this._arquivoRepositorio.deleteByListaNumerosRecuperacao(numerosRecuperacaoNaviosTemaDb);
    }
}

export { TemaController };