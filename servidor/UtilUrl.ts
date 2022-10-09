export class UtilUrl {
    static obterParamPorKey = (url: string, key: string) => {
        const divisaoPorInterrog = url.split('?');
        if (divisaoPorInterrog.length < 2) {
            return undefined;
        }
        const paramsDaUrl = divisaoPorInterrog[1];
        const divisaoPorEComercial = paramsDaUrl.split('&');
        const paramComAKey = divisaoPorEComercial.find(x => x.includes(key + '='));
        if (paramComAKey == undefined) {
            return undefined;
        }
        const divisaoPorIgual = paramComAKey.split('=');
        if (divisaoPorIgual.length < 2) {
            return undefined;
        }
        const vlParam = divisaoPorIgual[1];
        return vlParam;
    }

    static obterNomeAction = (url: string) => {
        const divisaoPorInterrog = url.split('?');
        const caminhoRequisicao = divisaoPorInterrog[0];
        const divisaoPorBarra = caminhoRequisicao.split('/');
        if (divisaoPorBarra.length < 5) {
            return undefined;
        }
        return divisaoPorBarra[4];
    }
}