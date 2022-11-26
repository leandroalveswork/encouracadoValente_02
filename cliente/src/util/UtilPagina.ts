export class UtilPagina {
    static calcularQtPaginas = (qtResultados: number, qtResultadosPorPagina: number): number => {
        // console.log(qtResultados);
        
        return Math.ceil(qtResultados / qtResultadosPorPagina);
    }

    static recortarPagina = <T>(resultados: T[], paginaAtual: number, qtResultadosPorPagina: number): T[] => {
        if (resultados.length == 0) {
            return [];
        }
        const qtPaginas = this.calcularQtPaginas(resultados.length, qtResultadosPorPagina);
        let paginaAtualSafe = paginaAtual;
        if (paginaAtualSafe < 1) {
            paginaAtualSafe = 1;
        }
        if (paginaAtualSafe > qtPaginas) {
            paginaAtualSafe = qtPaginas;
        }
        const recorte = resultados.filter((res, idx) =>
            (idx + 1 > (paginaAtualSafe - 1) * qtResultadosPorPagina) &&
            (idx + 1 <= paginaAtualSafe * qtResultadosPorPagina)
        );
        return recorte;
    }

    static qtResultadosPorPaginaPadrao: number = 10;
}