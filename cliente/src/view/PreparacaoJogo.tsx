import { Button, Typography, Card, CardActions, CardContent } from "@mui/material"
import PosicaoContainer from "../components/PosicaoContainer"
import './css/TelaJogo.css'
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../components/imagem/ImgNavioVertical.css"
import ClientRest from '../integracao/ClientRest';
import { MdResumoTema } from "../modelos/importarBack/MdResumoTema";
import { MdSalaDetalhada } from "../modelos/importarBack/MdSalaDetalhada";
import { PutPosicaoEstrategia } from "../modelos/importarBack/PutPosicaoEstrategia";
import { MdTiro } from "../modelos/importarBack/MdTiro";
import { LiteralTipoAtualizacao } from '../modelos/LiteralTipoAtualizacao';
import { LiteralOrientacao } from '../modelos/LiteralOrientacao';
import useWebSocket from "react-use-websocket";
import { useParams, useNavigate } from "react-router-dom";
import { WsEnvelope } from "../modelos/importarBack/WsEnvelope";
import ErroModal from '../components/erroModal/ErroModal';

interface PreparacaoJogoProps {
    tokenAuth: string;
    rotaWs: string;
}

const PreparacaoJogo = (props: PreparacaoJogoProps) => {

    const navigate = useNavigate();
    const audioBarcoChegando = new Audio('/assets/som_barco_chegando.mp3')

    const barcoPequenoRef1 = useRef<any>()
    const barcoPequenoRef2 = useRef<any>()
    const barcoPequenoRef3 = useRef<any>()
    const barcoPequenoRef4 = useRef<any>()
    const barcoMedioRef1 = useRef<any>()
    const barcoMedioRef2 = useRef<any>()
    const barcoMedioRef3 = useRef<any>()
    const barcoGrandeRef1 = useRef<any>()
    const barcoGrandeRef2 = useRef<any>()
    const barcoGiganteRef1 = useRef<any>()

    const QUANTIDADE_ESTRATEGIAS_PARA_SALVAR = 3; // TODO: Voltar para = 10
    const BORDA_NAVIO_SELECIONADO = "1px solid red"

    const { roomId } = useParams()

    const [podeSelecionarPosicoes, setPodeSelecionarPosicoes] = useState<boolean>(false);
    const [barcoSelecionado, setBarcoSelecionado] = useState<any>();
    const [posicoesJaMarcadasParaOBarcoAtual, setPosicoesJaMarcadasParaOBarcoAtual] = useState<Array<number>>([]);
    const [idBarcosSelecionados, setIdBarcosSelecionados] = useState<Array<string>>([]);
    const [totalPosicoesOcupadas, setTotalPosicoesOcupadas] = useState<Array<Array<number>>>([]);
    const [posicaoParaMover, setPosicaoParaMover] = useState<any>()
    const [tamanhoBarcoAtual, setTamanhoBarcoAtual] = useState<number>(0)
    const [eReposicao, setEReposicao] = useState<boolean>(false)

    const [lNaviosParaEnviar, setLNaviosParaEnviar] = useState<PutPosicaoEstrategia[]>([]);

    const [temaBarcoPequenoSrc, setTemaBarcoPequenoSrc] = useState<string>();
    const [temaBarcoMedioSrc, setTemaBarcoMedioSrc] = useState<string>();
    const [temaBarcoGrandeSrc, setTemaBarcoGrandeSrc] = useState<string>();
    const [temaBarcoGiganteSrc, setTemaBarcoGiganteSrc] = useState<string>();

    const fundoDefault = "#DFF4FF"
    const clientRest = new ClientRest();

    const [salaJogando, setSalaJogando] = useState<MdSalaDetalhada | null>(null);
    
    const [estaEsperando, setEstaEsperando] = useState(false);
    const [oponenteCarregouFluxo, setOponenteCarregouFluxo] = useState(false);
    const [podeEnviarEstrategia, setPodeEnviarEstrategia] = useState(false)
    const [barcoParaReposicionar, setBarcoParaReposicionar] = useState<any>()

    const { lastJsonMessage, sendJsonMessage } = useWebSocket(props.rotaWs + '?id=' + roomId);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const [erroOponenteSaiuEstaAberto, setErroOponenteSaiuEstaAberto] = useState(false);
    
    const carregarSala = () => {
        clientRest.callGetAutorizado<MdSalaDetalhada>('/api/fluxoMultiplayer/detalharSala', new MdSalaDetalhada())
            .then(rSala => {
                if (rSala.eOk) {
                    setSalaJogando(_ => rSala.body ?? new MdSalaDetalhada());
                } else {
                    setProblemaErro(_ => rSala.problema);
                    setErroEstaAberto(_ => true);
                }
            });
    }

    useEffect(() => { //TODO: Tratar para criar endpoint que busque somente o tema a partir do ID
        clientRest.callGetAutorizado<MdResumoTema[]>('/api/compra/listarPorIdUsuarioLogado', []).then(async (response) => {
            const idTemaEquipado = await clientRest.callGetAutorizado<string>('/api/compra/obterIdTemaEquipadoUsuarioLogadoOrDefault', '');
            const temaEquipado = response.body!.find(x => x.id == idTemaEquipado.body)

            setTemaBarcoPequenoSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 1)?.arquivo?.dadosBase64)
            setTemaBarcoMedioSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 2)?.arquivo?.dadosBase64)
            setTemaBarcoGrandeSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 3)?.arquivo?.dadosBase64)
            setTemaBarcoGiganteSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 4)?.arquivo?.dadosBase64)
        });

        carregarSala();
      
        // Preparar o UserWebSocket no WS
        let preparacaoUsuarioLogadoWs = new WsEnvelope();
        preparacaoUsuarioLogadoWs.numeroTipoAtualizacao = LiteralTipoAtualizacao.PrepararUsuarioLogadoWs;
        preparacaoUsuarioLogadoWs.tokenAuth = props.tokenAuth;
        sendJsonMessage({ ...preparacaoUsuarioLogadoWs });
    }, []);

    useEffect(() => {
        if (lastJsonMessage) {
            const pedidoAtualizacao = (lastJsonMessage as unknown) as WsEnvelope;
            if (pedidoAtualizacao.numeroTipoAtualizacao == LiteralTipoAtualizacao.ListagemSalas)
                carregarSala();
        }
    }, [lastJsonMessage]);
    
    useEffect(() => {
        if (salaJogando != null) {
            if (salaJogando.totalJogadores < 2) {
                setErroOponenteSaiuEstaAberto(_ => true);
                return;
            }
            if (salaJogando.oponenteCarregouFluxo) {
                setOponenteCarregouFluxo(_ => true);
                if (estaEsperando) {
                    
                    // Cancelar proxima Saida
                    clientRest.callPutAutorizado<undefined>('/api/sala/cancelarProximaSaida', {}, undefined)
                        .then(rCancelarSaida => {
                            if (!rCancelarSaida.eOk) {
                                setProblemaErro(_ => rCancelarSaida.problema);
                                setErroEstaAberto(_ => true);
                                return;
                            }
                                    
                            navigate('/game/play/' + roomId);
                        });
                }
            }
        }
    }, [salaJogando]);

    useEffect(() => {
        if (lNaviosParaEnviar.length == QUANTIDADE_ESTRATEGIAS_PARA_SALVAR) {
            setPodeEnviarEstrategia(true)
        }
    }, [lNaviosParaEnviar])

    useEffect(() => {
        if (barcoParaReposicionar && !barcoSelecionado) {
            const barco = barcoParaReposicionar.barco
            barco.style.border = BORDA_NAVIO_SELECIONADO
            barco.style.borderRadius = '5px'

            if (barcoSelecionado && barcoSelecionado == barco) {
                setPosicoesJaMarcadasParaOBarcoAtual([])
                setPodeSelecionarPosicoes(false)
                setTamanhoBarcoAtual(0)
                barco.style.border = 'none'
                resetFundoPosicoes(posicoesJaMarcadasParaOBarcoAtual)
                setPosicaoParaMover(null)
                setEReposicao(false)
            }
            else {
                setPodeSelecionarPosicoes(true)
                setBarcoSelecionado(barco)
                setTamanhoBarcoAtual(barcoParaReposicionar.tamanhoBarco)
            }
        }
    }, [barcoParaReposicionar]) //Gambeta para que o React renderize corretamente os estados no componente criado a partir do DOM nativo

    const calculaWidth = (tamanho: number) => {
        return `${tamanho * 30}px`
    }

    const handleBarcoOnClick = (barcoRef: React.MutableRefObject<any>, tamanhoBarco: number) => {
        barcoRef.current.style.border = BORDA_NAVIO_SELECIONADO
        barcoRef.current.style.borderRadius = '5px'
        if (barcoSelecionado) {
            barcoSelecionado.style.border = 'none'
            resetFundoPosicoes(posicoesJaMarcadasParaOBarcoAtual)
            setPosicoesJaMarcadasParaOBarcoAtual([])
            setBarcoSelecionado(null)
            setTamanhoBarcoAtual(0)
            setPosicaoParaMover(null)
        }

        if (barcoSelecionado && barcoSelecionado == barcoRef.current) {
            setPodeSelecionarPosicoes(false)
        }
        else {
            setPodeSelecionarPosicoes(true)
            setBarcoSelecionado(barcoRef.current)
            setTamanhoBarcoAtual(tamanhoBarco)
        }
    }

    const handleReposicionarNavio = (event: any, tamanhoBarco: number) => {
        setEReposicao(true)
        setBarcoParaReposicionar({ barco: event.currentTarget, tamanhoBarco })
    }

    const resetFundoPosicoes = (posicoes: Array<number>) => {
        for (let posicao of posicoes) {
            const posicaoSelecionada = document.getElementById(`user-${posicao < 10 ? '0' + posicao : posicao}`)
            posicaoSelecionada!.style.backgroundColor = fundoDefault
        }
    }

    const handlePosicaoOnClick = (event: any) => {
        const idPosicaoSelecionada = Number(event.currentTarget.id.replace("user-", ""))
        let ePosicaoValida = true
        let errorMessage: string | null = null

        if (totalPosicoesOcupadas.flat().includes(idPosicaoSelecionada)) {
            ePosicaoValida = false
            errorMessage = "Posição já ocupada por outra embarcação."
        } else if (posicoesJaMarcadasParaOBarcoAtual.length > 0) {
            const ultimaPosicaoMarcada = posicoesJaMarcadasParaOBarcoAtual[posicoesJaMarcadasParaOBarcoAtual.length - 1]

            if (posicoesJaMarcadasParaOBarcoAtual.length == 1) {
                ePosicaoValida = idPosicaoSelecionada == ultimaPosicaoMarcada + 10
                    || idPosicaoSelecionada == ultimaPosicaoMarcada - 10
                    || idPosicaoSelecionada == ultimaPosicaoMarcada + 1 //TODO: TRATAR PARA PERMITIR MARCAR SOMENTE DIREÇÕES HORIZONTAIS OU VERTICAIS CERTINHO (BUG EM ALGUNS CASOS)
                    || idPosicaoSelecionada == ultimaPosicaoMarcada - 1

                errorMessage = !ePosicaoValida ? "Posição inválida. Selecione uma posição adjacente à última posição selecionada." : errorMessage
            }

            if (posicoesJaMarcadasParaOBarcoAtual.includes(idPosicaoSelecionada)) {
                ePosicaoValida = false
                errorMessage = "Posicão já selecionada. Selecione uma posição não selecionada anteriormente."
            }

            if (posicoesJaMarcadasParaOBarcoAtual.length >= tamanhoBarcoAtual) {
                ePosicaoValida = false
                errorMessage = "Você já selecionou o número máximo de casas para essa embarcação ocupar."
            }
        }

        if (ePosicaoValida) {
            setPosicoesJaMarcadasParaOBarcoAtual(previousState => [...previousState, idPosicaoSelecionada])

            const clientX = event.clientX
            const clientY = event.clientY

            const tamanhoRetangulo = event.currentTarget.getBoundingClientRect()

            const localX = (clientX - tamanhoRetangulo.left)
            const localY = (clientY - tamanhoRetangulo.top)

            if (posicaoParaMover == null || posicoesJaMarcadasParaOBarcoAtual[0] > idPosicaoSelecionada) {
                setPosicaoParaMover({ x: localX, y: localY, event })
            }

            event.currentTarget.style.backgroundColor = 'red'
        }
        else {
            setErroEstaAberto(_ => true);
            setProblemaErro(_ => errorMessage ?? '');
        }
    }

    const parseCoordenadaAsTiro = (coordenada: number): MdTiro => {
        let coordAsString: string = coordenada + '';
        if (coordAsString.length == 1)
            coordAsString = '0' + coordAsString;
        return { numeroLinha: parseInt(coordAsString[0]), numeroColuna: parseInt(coordAsString[1]), acertou: false };
    }

    const handleEnviarNavioOnClick = () => {
        if (posicoesJaMarcadasParaOBarcoAtual.length < tamanhoBarcoAtual) {
            setErroEstaAberto(_ => true);
            setProblemaErro(_ => "Você ainda não selecionou todas as posições necessárias para comandar o envio desse navio para a posição.");
            return;
        }

        const barcoMovido = document.createElement("img")
        barcoMovido.src = barcoSelecionado.src
        barcoMovido.id = barcoSelecionado.id + '-posicionado'
        barcoMovido.style.height = '30px'
        barcoMovido.style.width = `${calculaWidth(tamanhoBarcoAtual)}`
        barcoMovido.style.left = posicaoParaMover.x + 15 + 'px'
        barcoMovido.style.top = posicaoParaMover.y + 'px'
        barcoMovido.onclick = (event) => handleReposicionarNavio(event, tamanhoBarcoAtual)
        barcoMovido.style.cursor = 'pointer'
        posicaoParaMover.event.target.style.zIndex = '1000'


        const ePosicaoVertical = posicoesJaMarcadasParaOBarcoAtual[0] + 10 == posicoesJaMarcadasParaOBarcoAtual[1] || posicoesJaMarcadasParaOBarcoAtual[0] - 10 == posicoesJaMarcadasParaOBarcoAtual[1]

        if (ePosicaoVertical) {
            barcoMovido.className = 'imagem-vertical';

            // Salvar para envio de navio vertical
            const menorCoordenada = posicoesJaMarcadasParaOBarcoAtual.sort((a, b) => a - b)[0];
            const menorTiro = parseCoordenadaAsTiro(menorCoordenada);
            let posicaoEstrategiaASalvar = new PutPosicaoEstrategia();
            posicaoEstrategiaASalvar.tamanhoQuadradosNavio = tamanhoBarcoAtual;
            posicaoEstrategiaASalvar.numeroLinha = menorTiro.numeroLinha;
            posicaoEstrategiaASalvar.numeroColuna = menorTiro.numeroColuna;
            posicaoEstrategiaASalvar.orientacao = LiteralOrientacao.Baixo;
            setLNaviosParaEnviar(previousState => [...previousState, posicaoEstrategiaASalvar]);
        } else {
            // Salvar para envio de navio horizontal
            const menorCoordenadaHorz = posicoesJaMarcadasParaOBarcoAtual.sort((a, b) => a - b)[0];
            const menorTiroHorz = parseCoordenadaAsTiro(menorCoordenadaHorz);
            let posicaoEstrategiaASalvarHorz = new PutPosicaoEstrategia();
            posicaoEstrategiaASalvarHorz.tamanhoQuadradosNavio = tamanhoBarcoAtual;
            posicaoEstrategiaASalvarHorz.numeroLinha = menorTiroHorz.numeroLinha;
            posicaoEstrategiaASalvarHorz.numeroColuna = menorTiroHorz.numeroColuna;
            posicaoEstrategiaASalvarHorz.orientacao = LiteralOrientacao.Direita;
            setLNaviosParaEnviar(previousState => [...previousState, posicaoEstrategiaASalvarHorz ]);
        }
    
        posicaoParaMover.event.target.appendChild(barcoMovido)
        barcoSelecionado.style.border = 'none'
        barcoSelecionado.style.opacity = '0.2'
        barcoSelecionado.style.cursor = 'not-allowed'
        setPodeSelecionarPosicoes(false)
        setPosicaoParaMover(null)
        setTotalPosicoesOcupadas(previousState => {
            return [...previousState, [...posicoesJaMarcadasParaOBarcoAtual]]
        })
        resetFundoPosicoes(posicoesJaMarcadasParaOBarcoAtual)
        setPosicoesJaMarcadasParaOBarcoAtual([])
        setTamanhoBarcoAtual(0)
        if (eReposicao) {
            console.log("eReposicao", eReposicao)
            setEReposicao(false)
            console.log(lNaviosParaEnviar.filter(navio => posicoesJaMarcadasParaOBarcoAtual
                .find(posicao => posicao.toString()[0] == navio.numeroLinha.toString() && posicao.toString()[1] == navio.numeroColuna.toString()) == undefined))
            setTotalPosicoesOcupadas(totalPosicoesOcupadas.filter(posicoes => posicoes.includes(posicoesJaMarcadasParaOBarcoAtual[0])))
            //TODO: TRATAR PARA REMOVER O NAVIO DA LISTA NO CASO DE REPOSICIONAMENTO (NAS DUAS ESTRUTURAS - ENVIO PARA A API E LISTA DE CONTROLE)
            //TODO: ESSA TRATATIVA CORRIGIRÁ O BUG CASO SE TENTE REPOSICIONAR O NAVIO E ELE PERMITE SELECIONAR A POSIÇÃO EM QUE ESTÁ A OUTRA EMBARCAÇÃO
            //TODO: TRATAR PARA PERMITIR MARCAR SOMENTE DIREÇÕES HORIZONTAIS OU VERTICAIS CERTINHO (BUG EM ALGUNS CASOS)
            barcoSelecionado.style.display = 'none'
        }
        else {
            setIdBarcosSelecionados(previousState => [...previousState, barcoSelecionado.id])
        }
        setBarcoSelecionado(null)
        audioBarcoChegando.play()
    }

    const handleSalvarEstrategiaOnClick = () => {
        // Validar se enviou todos os navios
        if (lNaviosParaEnviar.length < QUANTIDADE_ESTRATEGIAS_PARA_SALVAR) {
            setErroEstaAberto(_ => true);
            setProblemaErro(_ => "Você ainda não enviou todos os navios em suas posições.");
            return;
        }

        // Enviar para Api
        clientRest.callPutAutorizado<undefined>('/api/fluxoMultiplayer/atualizarEstrategias', lNaviosParaEnviar, undefined)
            .then(async (rAtualizacao) => {
                if (!rAtualizacao.eOk) {
                    setErroEstaAberto(_ => true);
                    setProblemaErro(_ => rAtualizacao.problema);
                    return;
                }
                if (oponenteCarregouFluxo) {
                
                    // Notificar outros clients
                    let pedidoAtualizarListagemSala = new WsEnvelope();
                    pedidoAtualizarListagemSala.numeroTipoAtualizacao = LiteralTipoAtualizacao.ListagemSalas;
                    pedidoAtualizarListagemSala.tokenAuth = props.tokenAuth;
                    sendJsonMessage({ ...pedidoAtualizarListagemSala });
                    
                    // Cancelar proxima Saida
                    let rCancelarSaida = await clientRest.callPutAutorizado<undefined>('/api/sala/cancelarProximaSaida', {}, undefined);
                    if (!rCancelarSaida.eOk) {
                        setProblemaErro(_ => rCancelarSaida.problema);
                        setErroEstaAberto(_ => true);
                        return;
                    }
                            
                    navigate('/game/play/' + roomId);
                    return;
                }
                
                // Notificar outros clients
                let pedidoAtualizarListagemSalaEsperando = new WsEnvelope();
                pedidoAtualizarListagemSalaEsperando.numeroTipoAtualizacao = LiteralTipoAtualizacao.ListagemSalas;
                pedidoAtualizarListagemSalaEsperando.tokenAuth = props.tokenAuth;
                sendJsonMessage({ ...pedidoAtualizarListagemSalaEsperando });
                
                setEstaEsperando(_ => true);
            });
    }
    
    const handleFecharErroOponenteSaiuOnClick = () => {
        setErroEstaAberto(_ => false);
        navigate('/salas');
    }
    
    //TODO: Tratar para organizar os elementos corretamente em tela
    return (
        <div>
            <div className='titulo-wrapper'>
                <h1>ENCOURAÇADO VALENTE</h1>
            </div>
            <div className="container-tabuleiros">
                {!estaEsperando && <>
                    <Typography textAlign="center" style={{ fontFamily: "bungee", color: "black" }}>É HORA DE PREPARAR A SUA ESTRATÉGIA</Typography>
                    <div style={{ alignContent: 'center', paddingLeft: '5%', display: 'flex', flexDirection: 'row' }}>
                        <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='user' clickable={podeSelecionarPosicoes} />
                        <div>
                            <img id="barcoPequeno1"
                                ref={barcoPequenoRef1}
                                style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }}
                                src={temaBarcoPequenoSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoPequeno1') && handleBarcoOnClick(barcoPequenoRef1, 1)} />

                            <img id="barcoPequeno2"
                                ref={barcoPequenoRef2}
                                style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }}
                                src={temaBarcoPequenoSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoPequeno2') && handleBarcoOnClick(barcoPequenoRef2, 1)} />

                            <img id="barcoPequeno3"
                                ref={barcoPequenoRef3}
                                style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }}
                                src={temaBarcoPequenoSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoPequeno3') && handleBarcoOnClick(barcoPequenoRef3, 1)} />

                            <img id="barcoPequeno4"
                                ref={barcoPequenoRef4}
                                style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }}
                                src={temaBarcoPequenoSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoPequeno4') && handleBarcoOnClick(barcoPequenoRef4, 1)} />

                            <img id="barcoMedio1"
                                ref={barcoMedioRef1}
                                style={{ height: '30px', width: calculaWidth(2), cursor: 'pointer' }}
                                src={temaBarcoMedioSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoMedio1') && handleBarcoOnClick(barcoMedioRef1, 2)} />

                            <img id="barcoMedio2"
                                ref={barcoMedioRef2}
                                style={{ height: '30px', width: calculaWidth(2), cursor: 'pointer' }}
                                src={temaBarcoMedioSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoMedio2') && handleBarcoOnClick(barcoMedioRef2, 2)} />

                            <img id="barcoMedio3"
                                ref={barcoMedioRef3}
                                style={{ height: '30px', width: calculaWidth(2), cursor: 'pointer' }}
                                src={temaBarcoMedioSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoMedio3') && handleBarcoOnClick(barcoMedioRef3, 2)} />

                            <img id="barcoGrande1"
                                ref={barcoGrandeRef1}
                                style={{ height: '30px', width: calculaWidth(3), cursor: 'pointer' }}
                                src={temaBarcoGrandeSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoGrande1') && handleBarcoOnClick(barcoGrandeRef1, 3)} />

                            <img id="barcoGrande2"
                                ref={barcoGrandeRef2}
                                style={{ height: '30px', width: calculaWidth(3), cursor: 'pointer' }}
                                src={temaBarcoGrandeSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoGrande2') && handleBarcoOnClick(barcoGrandeRef2, 3)} />

                            <img id="barcoGigante"
                                ref={barcoGiganteRef1}
                                style={{ height: '30px', width: calculaWidth(4), cursor: 'pointer' }}
                                src={temaBarcoGiganteSrc}
                                onClick={() => !idBarcosSelecionados.includes('barcoGigante') && handleBarcoOnClick(barcoGiganteRef1, 4)} />
                        </div>
                    </div>

                    <div className="row g-0">
                        <Button disabled={!podeSelecionarPosicoes} onClick={handleEnviarNavioOnClick}> Enviar navio para a posição </Button>
                        <Button disabled={!podeEnviarEstrategia} onClick={handleSalvarEstrategiaOnClick}> Salvar Estrategia </Button>
                    </div>
                </>}
                {estaEsperando && <Card sx={{ border: 1, borderColor: '#9D9D9D', height: '100%' }}>
                    <CardContent sx={{ margin: 0, border: 0, paddingBottom: 0 }}>
                        <Typography align="center" sx={{ fontFamily: 'Bungee' }} gutterBottom variant="h6">
                            Aguardando o oponente...
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" variant="contained" color="error" onClick={() => navigate('/salas')}>SAIR</Button>
                    </CardActions>

                </Card>}

            </div>
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
            <ErroModal estaAberto={erroOponenteSaiuEstaAberto} onFechar={() => handleFecharErroOponenteSaiuOnClick()} problema='O seu oponente se desconectou!' />
        </div>
    )
}

export default PreparacaoJogo;