export class StringUteis {
    static gerarNovoIdDe24Caracteres(): string {
        let novoId = '';
        for (let idxChar = 0; idxChar < 24; idxChar++) {
            novoId += '0123456789abcdef'[Math.floor(Math.random() * 16)];
        }
        return novoId;
    }
    static listarEmPt(itens: string[]): string {
        if (itens.length == 0) {
            return '';
        }
        if (itens.length == 1) {
            return itens[0];
        }
        if (itens.length == 2) {
            return itens[0] + ' e ' + itens[1];
        }
        const contagemItensVirgula = itens.length - 1;
        const startVirgula = itens[0];
        const textoVirgula = itens.slice(1, contagemItensVirgula).reduce((prev, cur) => prev + ', ' + cur, startVirgula);
        return textoVirgula + ' e ' + itens[itens.length - 1];
    }
}