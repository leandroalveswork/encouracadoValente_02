import { MdArquivoBase64 } from "./MdArquivoBase64";

export class MdDetalheNavioTema {
    id: string = '';
    tamnQuadrados: number = 0;
    nomePersonalizado: string = '';
    arquivoImagemNavio: MdArquivoBase64 | null = null;
    bytesParaUploadArquivo: Blob | null = null;
    numeroRecuperacaoArquivoImagemNavio: string | null = null;
}