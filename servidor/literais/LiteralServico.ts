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
    SalaFluxoRepositorio: Symbol.for('SalaFluxoRepositorio'),
    PosicaoFluxoRepositorio: Symbol.for('PosicaoFluxoRepositorio'),
    TiroFluxoRepositorio: Symbol.for('TiroFluxoRepositorio'),

    // controllers de api
    AutorizacaoController: Symbol.for('AutorizacaoController'),
    TemaController: Symbol.for('TemaController'),
    CompraController: Symbol.for('CompraController'),
    LiberacaoController: Symbol.for('LiberacaoController'),
    ArquivoController: Symbol.for('ArquivoController'),
    FluxoMultiplayerController: Symbol.for('FluxoMultiplayerController'),
    SalaController: Symbol.for('SalaController'),
};

export { LiteralServico };