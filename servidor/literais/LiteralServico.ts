const LiteralServico = {

    // geral
    ConfigBack: Symbol.for('ConfigBack'),
    MediadorWs: Symbol.for('MediadorWs'),

    // repositorios
    UsuarioRepositorio: Symbol.for('UsuarioRepositorio'),
    TemaRepositorio: Symbol.for('TemaRepositorio'),
    CompraRepositorio: Symbol.for('CompraRepositorio'),
    NavioTemaRepositorio: Symbol.for('NavioTemaRepositorio'),
    ArquivoRepositorio: Symbol.for('ArquivoRepositorio'),

    // controllers de api
    AutorizacaoController: Symbol.for('AutorizacaoController'),
    TemaController: Symbol.for('TemaController'),
    CompraController: Symbol.for('CompraController'),
    ArquivoController: Symbol.for('ArquivoController'),
};

export { LiteralServico };