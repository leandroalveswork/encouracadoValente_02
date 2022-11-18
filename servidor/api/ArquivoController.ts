import { Request, Router } from "express";
import { inject, injectable, postConstruct } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { MdExcecao } from "./MdExcecao";
import { StringUteis } from "../uteis/StringUteis";
import { ConfigBack } from "../ConfigBack";
import { ControllerBase } from "./ControllerBase";
import bodyParser from 'body-parser';
import { parse as parseMultipart } from 'parse-multipart-data';
import { ArquivoRepositorio } from "../repositorio/ArquivoRepositorio";
import { DbArquivo } from "../modelos/DbArquivo";

@injectable()
class ArquivoController extends ControllerBase {
    private _arquivoRepositorio: ArquivoRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.ArquivoRepositorio) arquivoRepositorio: ArquivoRepositorio
    ) {
        super(configBack);
        this._configBack = configBack;
        this._arquivoRepositorio = arquivoRepositorio;
        this.router = Router();
        const opcoesBodyParser: bodyParser.Options = {
            inflate: true,
            limit: '1000kb',
            type: '*/*'
        };
        this.router.post('/upload', bodyParser.raw(opcoesBodyParser), async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                await this.uploadArquivo(req.body as Buffer, req.headers['content-type'], req.headers['numero-recuperacao']?.toString(), idUsuarioLogado);
                res.send();
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
    }

    // Codifique as actions:
    
    uploadArquivo = async (buffer: Buffer, headerContentType: string | undefined, headerNumeroRecuperacao: string | undefined, idUsuarioLogado: string): Promise<void> => {
         
        // Validar os headers
        const indexSeparadorContentType = headerContentType?.indexOf(';') ?? -1;
        if (indexSeparadorContentType == -1) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Header Content-Type invalido.';
            throw ex;
        }
        if (headerNumeroRecuperacao == undefined || headerNumeroRecuperacao == '') {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Header Numero-Recuperacao invalido.';
            throw ex;
        }
        const arquivoDbMesmoNumeroRecuperacao = await this._arquivoRepositorio.selectByNumeroRecuperacaoOrDefault(headerNumeroRecuperacao);
        if (arquivoDbMesmoNumeroRecuperacao != null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            // Nao mostrar detalhe de implementaçao - na verdade, houve um conflito de envio de arquivos com mesmo numeroRecuperacao.
            ex.problema = 'Houve um problema, tente novamente.';
            throw ex;
        }
        console.log('dump header numero-recuperacao = [' + headerNumeroRecuperacao + ']');
            
        // Extrair o boundary (separador dos buffers)
        const boundaryKeyValue = (headerContentType as string).substring(((headerContentType as string).indexOf(';') ?? -1) + 1);
        const boundary = boundaryKeyValue.substring(boundaryKeyValue.indexOf('boundary=') + 9);
        
        // Obter os buffers
        const parts = parseMultipart(buffer, boundary);
        
        // Adicionar apenas o primeiro buffer
        const arquivoInsert = new DbArquivo();
        arquivoInsert.id = StringUteis.gerarNovoIdDe24Caracteres();
        arquivoInsert.nomeArquivo = parts[0].filename;
        arquivoInsert.nome = parts[0].name;
        arquivoInsert.tipo = parts[0].type;
        arquivoInsert.buffer = parts[0].data;
        arquivoInsert.numeroRecuperacao = headerNumeroRecuperacao;
        await this._arquivoRepositorio.insertPorOperador(arquivoInsert, idUsuarioLogado);
    }

}

export { ArquivoController };