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
import { PostNovaCompra } from "../modelos/PostNovaCompra";
import { TemaRepositorio } from "../repositorio/TemaRepositorio";
import { NavioTemaRepositorio } from "../repositorio/NavioTemaRepositorio";
import { ArquivoRepositorio } from "../repositorio/ArquivoRepositorio";
import { CompraRepositorio } from "../repositorio/CompraRepositorio";
import { DbTema } from "../modelos/DbTema";
import { ControllerBase } from "./ControllerBase";
import { MdDetalheTema } from "../modelos/MdDetalheTema";
import { MdResumoTema } from "../modelos/MdResumoTema";
import { PutTema } from "../modelos/PutTema";
import { UtilUrl } from "../UtilUrl";
import { DbNavioTema } from "../modelos/DbNavioTema";
import { DbCompra } from "../modelos/DbCompra";
import { MdDetalheNavioTema } from "../modelos/MdDetalheNavioTema";
import { MdArquivoBase64 } from "../modelos/MdArquivoBase64";
import { MdPreviaNavio } from "../modelos/MdPreviaNavio";
import { MdDetalheTemaAnulavel } from "../modelos/MdDetalheTemaAnulavel";
import { PutEquiparTema } from "../modelos/PutEquiparTema";
import { PutPosicaoEstrategia } from "../modelos/PutPosicaoEstrategia";
import { SalaFluxoRepositorio } from "../repositorio/SalaFluxoRepositorio";
import { PosicaoFluxoRepositorio } from "../repositorio/PosicaoFluxoRepositorio";
import { DbPosicaoFluxo } from "../modelos/DbPosicaoFluxo";
import { MdProgressoNaviosJogadorLogado } from "../modelos/MdProgressoNaviosJogadorLogado";
import { TiroFluxoRepositorio } from "../repositorio/TiroFluxoRepositorio";

@injectable()
class FluxoMultiplayerController extends ControllerBase {
    private _temaRepositorio: TemaRepositorio
    private _navioTemaRepositorio: NavioTemaRepositorio
    private _compraRepositorio: CompraRepositorio
    private _usuarioRepositorio: UsuarioRepositorio
    private _salaFluxoRepositorio: SalaFluxoRepositorio
    private _posicaoFluxoRepositorio: PosicaoFluxoRepositorio
    private _tiroFluxoRepositorio: TiroFluxoRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.TemaRepositorio) temaRepositorio: TemaRepositorio,
        @inject(LiteralServico.NavioTemaRepositorio) navioTemaRepositorio: NavioTemaRepositorio,
        @inject(LiteralServico.CompraRepositorio) compraRepositorio: CompraRepositorio,
        @inject(LiteralServico.UsuarioRepositorio) usuarioRepositorio: UsuarioRepositorio,
        @inject(LiteralServico.SalaFluxoRepositorio) salaFluxoRepositorio: SalaFluxoRepositorio,
        @inject(LiteralServico.PosicaoFluxoRepositorio) posicaoFluxoRepositorio: PosicaoFluxoRepositorio,
        @inject(LiteralServico.TiroFluxoRepositorio) tiroFluxoRepositorio: TiroFluxoRepositorio
    ) {
        super(configBack);
        this._configBack = configBack;
        this._temaRepositorio = temaRepositorio;
        this._navioTemaRepositorio = navioTemaRepositorio;
        this._compraRepositorio = compraRepositorio;
        this._usuarioRepositorio = usuarioRepositorio;
        this._salaFluxoRepositorio = salaFluxoRepositorio;
        this._posicaoFluxoRepositorio = posicaoFluxoRepositorio;
        this._tiroFluxoRepositorio = tiroFluxoRepositorio;
        this.router = Router();
        this.router.put('/atualizarEstrategias', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                await this.atualizarEstrategias(req.body, idUsuarioLogado);
                res.send();
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.get('/detalharProgressoJogadorLogado', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const progressoJogadorLogado = await this.detalharProgressoJogadorLogado(idUsuarioLogado);
                res.send(progressoJogadorLogado);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.get('/detalharProgressoJogadorOponente', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const temaDetalhadoOrDefault = await this.detalharTemaEquipadoUsuarioLogadoOrDefault(idUsuarioLogado);
                res.send(temaDetalhadoOrDefault);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.post('/adicionarTiro', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const listaIdsPosicoesEstrategia = await this.enviarEstrategia(req.body, idUsuarioLogado);
                res.send(listaIdsPosicoesEstrategia);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
    }

    // codifique as actions:

    // autorizado
    // post
    atualizarEstrategias = async (estrategias: PutPosicaoEstrategia[], idUsuarioLogado: string): Promise<void> => {
        
        // Validaçoes
        const salaUsuarioLogadoDb = await this._salaFluxoRepositorio.selectByUsuarioJogandoOrDefault(idUsuarioLogado);
        if (salaUsuarioLogadoDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Voce ainda nao entrou em uma sala';
            throw ex;
        }
        
        // Parse cada resultado
        let posicoesFluxo: DbPosicaoFluxo[] = [];
        for (let iEstrategia of estrategias) {
            let posicaoFluxoParaPush = new DbPosicaoFluxo();
            posicaoFluxoParaPush.id = StringUteis.gerarNovoIdDe24Caracteres();
            posicaoFluxoParaPush.idUsuarioEnviador = idUsuarioLogado;
            posicaoFluxoParaPush.tamanhoQuadradosNavio = iEstrategia.tamanhoQuadradosNavio;
            posicaoFluxoParaPush.numeroLinha = iEstrategia.numeroLinha;
            posicaoFluxoParaPush.numeroColuna = iEstrategia.numeroColuna;
            posicaoFluxoParaPush.orientacao = iEstrategia.orientacao;
        }
        
        // Salvar no mongodb
        await this._posicaoFluxoRepositorio.updateByNumeroRecuperacaoUrlSala(salaUsuarioLogadoDb.numeroRecuperacaoUrl, posicoesFluxo, idUsuarioLogado);
    }

    // autorizado
    // get
    detalharProgressoJogadorLogado = async (idUsuarioLogado: string): Promise<MdProgressoNaviosJogadorLogado> => {
        
        // DbSalaFluxo 1 <- N DbPosicaoFluxo
        // DbSalaFluxo 1 <- N DbTiroFluxo
        
        // Validaçoes
        const salaUsuarioLogadoDb = await this._salaFluxoRepositorio.selectByUsuarioJogandoOrDefault(idUsuarioLogado);
        if (salaUsuarioLogadoDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Voce ainda nao entrou em uma sala';
            throw ex;
        }
        
        const tirosFluxoDb = await this._tiroFluxoRepositorio.selectByNumeroRecuperacaoUrlSalaFluxoQueTenhaIdUsuarioOrDefault(salaUsuarioLogadoDb.numeroRecuperacaoUrl, idUsuarioLogado);
        
        // Obter os temas comprados pelo usuario, montar uma lista de ids de temas para recuperar tanto os temas quanto os navioTema e montar uma lista de numerosRecuperacao dos naviosTema para recuperar os arquivos
        const comprasDb = await this._compraRepositorio.selectMuitasComprasByIdUsuario(idUsuarioLogado);
        const listaIdTemasComprados = comprasDb.map(x => x.idTema);
        const temasDb = await this._temaRepositorio.selectMuitosTemasByListaTemasId(listaIdTemasComprados);
        const naviosTemaDb = await this._navioTemaRepositorio.selectMuitosNaviosTemaByListaTemasId(listaIdTemasComprados);
        const numerosRecuperacaoNaviosTemaDb = naviosTemaDb.map(x => x.numeroRecuperacaoArquivoImagemNavio);
        const arquivosDb = await this._arquivoRepositorio.selectByListaNumerosRecuperacao(numerosRecuperacaoNaviosTemaDb);
        
        // Loop em cada tema comprado
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
    detalharTemaEquipadoUsuarioLogadoOrDefault = async (idUsuarioLogado: string): Promise<MdDetalheTemaAnulavel> => {
        const compraEquipada = await this._compraRepositorio.selectCompraEquipadaByIdUsuarioOrDefault(idUsuarioLogado);
        if (compraEquipada == null)
            return new MdDetalheTemaAnulavel();
        const temaDb = await this._temaRepositorio.selectByIdOrDefault(compraEquipada.idTema);
        if (temaDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 404;
            ex.problema = 'Tema não encontrado.';
            throw ex;
        }
        
        // Detalhamento do tema
        const naviosTemaDb = await this._navioTemaRepositorio.selectMuitosNaviosTemaByTemaId(compraEquipada.idTema);
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
        let temaDetalhadoAnulavel = new MdDetalheTemaAnulavel();
        temaDetalhadoAnulavel.eTemaNulo = false;
        temaDetalhadoAnulavel.detalheTema = temaDetalhado;
        return temaDetalhadoAnulavel;
    }
}

export { FluxoMultiplayerController };
