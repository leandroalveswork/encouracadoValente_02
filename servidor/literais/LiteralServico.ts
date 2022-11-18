const LiteralServico = {

    // geral
    ConfigBack: Symbol.for('ConfigBack'),
    MediadorWs: Symbol.for('MediadorWs'),

    // repositorios
    UsuarioRepositorio: Symbol.for('UsuarioRepositorio'),
    TemaRepositorio: Symbol.for('TemaRepositorio'),
    NavioTemaRepositorio: Symbol.for('NavioTemaRepositorio'),
    ArquivoRepositorio: Symbol.for('ArquivoRepositorio'),

    // controllers de api
    AutorizacaoController: Symbol.for('AutorizacaoController'),
    TemaController: Symbol.for('TemaController'),
    ArquivoController: Symbol.for('ArquivoController'),
};

export { LiteralServico };