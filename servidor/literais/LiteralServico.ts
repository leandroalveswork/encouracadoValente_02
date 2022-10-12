const LiteralServico = {

    // geral
    ConfigBack: Symbol.for('ConfigBack'),
    MediadorWs: Symbol.for('MediadorWs'),

    // repositorios
    UsuarioRepositorio: Symbol.for('UsuarioRepositorio'),
    TemaRepositorio: Symbol.for('TemaRepositorio'),

    // controllers de api
    AutorizacaoController: Symbol.for('AutorizacaoController'),
    TemaController: Symbol.for('TemaController'),
};

export { LiteralServico };