import { CircularProgressProps, Typography, Box, CircularProgress } from "@mui/material"
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import useWebSocket from "react-use-websocket"
import ClientRest from "../integracao/ClientRest"
import PosicaoContainer from "../components/PosicaoContainer"
import './css/TelaJogo.css'
import { MdResumoTema } from "../modelos/importarBack/MdResumoTema"
import { MdSalaDetalhada } from "../modelos/importarBack/MdSalaDetalhada"
import { MdProgressoNaviosJogador } from "../modelos/importarBack/MdProgressoNaviosJogador"
import { WsEnvelope } from "../modelos/importarBack/WsEnvelope"
import { LiteralTipoAtualizacao } from "../modelos/LiteralTipoAtualizacao"
import { LiteralOrientacao } from '../modelos/LiteralOrientacao';
import ImgNavioVertical from '../components/imagem/ImgNavioVertical';
import ErroModal from '../components/erroModal/ErroModal';
import ImgNavioHorizontal from '../components/imagem/ImgNavioHorizontal';
import { PostTiroFluxo } from "../modelos/importarBack/PostTiroFluxo";
import { MdDetalheTema } from "../modelos/importarBack/MdDetalheTema";

const SEGUNDOS_TIMER = 15;

const CircularProgressWithLabel = (
    props: CircularProgressProps & { value: number },
) => {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                >{`${Math.ceil((1 - props.value * 0.01) * SEGUNDOS_TIMER)}s`}</Typography>
            </Box>
        </Box>
    );
}

export interface TelaJogoProps {
    tokenAuth: string;
    rotaWs: string;
}

const TelaJogo = (props: TelaJogoProps) => {

    const DESTAQUE_FUNDO_VEZ_JOGADOR = "#FBE9E7";

    const posicoesJaMarcadas: Array<string> = []
    const musicaJogo = new Audio('/assets/music.mp3')
    const somAcertouHit = new Audio('/assets/HitExplosion.mp3')
    const somErrouHit = new Audio('/assets/SplashSound.mp3')

    const navigate = useNavigate();
    const { roomId } = useParams()

    const clientRest = new ClientRest();

    const [salaJogando, setSalaJogando] = useState<MdSalaDetalhada | null>(null);
    const [progressoJogadorLogado, setProgressoJogadorLogado] = useState<MdProgressoNaviosJogador | null>(null);
    const [progressoJogadorInimigo, setProgressoJogadorInimigo] = useState<MdProgressoNaviosJogador | null>(null);
    const [estaEsperandoInimigoAtirar, setEstaEsperandoInimigoAtirar] = useState(false);

    const [temaBarcoPequenoSrc, setTemaBarcoPequenoSrc] = useState<string>();
    const [temaBarcoMedioSrc, setTemaBarcoMedioSrc] = useState<string>();
    const [temaBarcoGrandeSrc, setTemaBarcoGrandeSrc] = useState<string>();
    const [temaBarcoGiganteSrc, setTemaBarcoGiganteSrc] = useState<string>();

    const [temaBarcoPequenoSrcInimigo, setTemaBarcoPequenoSrcInimigo] = useState<string>();
    const [temaBarcoMedioSrcInimigo, setTemaBarcoMedioSrcInimigo] = useState<string>();
    const [temaBarcoGrandeSrcInimigo, setTemaBarcoGrandeSrcInimigo] = useState<string>();
    const [temaBarcoGiganteSrcInimigo, setTemaBarcoGiganteSrcInimigo] = useState<string>();
    const [nomeInimigo, setNomeInimigo] = useState('Inimigo');

    const [comecoTimerCalculado, setComecoTimerCalculado] = useState((new Date()).getTime());
    const [dateAgoraExato, setDateAgoraExato] = useState(new Date());
    const [progressTimer, setProgressTimer] = useState(0);

    const { lastJsonMessage, sendJsonMessage } = useWebSocket(props.rotaWs + '?id=' + roomId);
    const [tirosDisparadosUsuario, setTirosDisparadosUsuario] = useState<number>(0)
    const [tirosDisparadosInimigo, setTirosDisparadosInimigo] = useState<number>(0)

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const [erroOponenteSaiuEstaAberto, setErroOponenteSaiuEstaAberto] = useState(false);


    useEffect(() => {
        musicaJogo.loop = true;
        musicaJogo.play();
        return () => {
            musicaJogo.pause();
        }
    }, [])

    useEffect(() => {
        if (progressoJogadorLogado && progressoJogadorInimigo) {
            dispararSonsDeHit(progressoJogadorLogado, tirosDisparadosUsuario)
            dispararSonsDeHit(progressoJogadorInimigo, tirosDisparadosInimigo)

            if(progressoJogadorLogado!.tiros.length > tirosDisparadosUsuario){
                setTirosDisparadosUsuario(progressoJogadorLogado.tiros.length)
            }
            if(progressoJogadorInimigo!.tiros.length > tirosDisparadosInimigo){
                setTirosDisparadosInimigo(progressoJogadorInimigo.tiros.length)
            }

        }
    }, [progressoJogadorInimigo, progressoJogadorLogado])

    const parseCoordenadaAsTiro = (coordenada: number): PostTiroFluxo => {
        let coordAsString: string = coordenada + '';
        if (coordAsString.length == 1)
            coordAsString = '0' + coordAsString;
        return { numeroLinha: parseInt(coordAsString[0]), numeroColuna: parseInt(coordAsString[1]) };
    }

    const dispararSonsDeHit = (progressoJogador: MdProgressoNaviosJogador | null, tirosDisparados: number) => {
        if (progressoJogador!.tiros && progressoJogador!.tiros.length > tirosDisparados) {
            if (progressoJogador!.tiros[progressoJogador!.tiros.length - 1].acertou) {
                somAcertouHit.play()
            }
            else {
                somErrouHit.play()
            }
        }
    }

    const handlePosicaoOnClick = (event: any) => {
        if (isNaN(Number(event.currentTarget.id.replace("opponent-", ""))))
            return;
        if (posicoesJaMarcadas.includes(event.currentTarget.id))
            return;

        setEstaEsperandoInimigoAtirar(_ => true);
        // Estilizaçao
        event.currentTarget.style.opacity = 0.2;

        posicoesJaMarcadas.push(event.currentTarget.id);

        // Enviar para Api
        const coordenadaSelecionada = Number(event.currentTarget.id.replace("opponent-", ""));
        // console.log(event.currentTarget.id);
        // console.log(coordenadaSelecionada);
        const payloadTiro = parseCoordenadaAsTiro(coordenadaSelecionada);
        clientRest.callPostAutorizado<string>('/api/fluxoMultiplayer/adicionarTiro', payloadTiro, '')
            .then(rTiro => {
                if (!rTiro.eOk) {
                    setProblemaErro(_ => rTiro.problema);
                    setErroEstaAberto(_ => true);
                    return;
                }

                carregarProgressos();

                // Notificar outros clients
                let notificarTiro = new WsEnvelope();
                notificarTiro.numeroTipoAtualizacao = LiteralTipoAtualizacao.FluxoJogo;
                notificarTiro.tokenAuth = props.tokenAuth;
                sendJsonMessage({ ...notificarTiro });
                // sendJsonMessage({ idPosicao: event.currentTarget.id, roomId })
            });

    }

    const carregarSala = (precisaCarregarTemaInimigo: boolean = false) => {
        clientRest.callGetAutorizado<MdSalaDetalhada>('/api/fluxoMultiplayer/detalharSala', new MdSalaDetalhada())
            .then(async (rSala) => {
                if (rSala.eOk) {
                    setSalaJogando(_ => rSala.body ?? new MdSalaDetalhada());
                    if (precisaCarregarTemaInimigo) {
                        setNomeInimigo(_ => rSala.body?.nomeUsuarioInimigo ?? 'Inimigo');
                        const temaInimigo = (await clientRest.callGetAutorizado<MdDetalheTema>('/api/tema/detalharPorId?id=' + (rSala.body?.idTemaInimigo ?? ''), new MdDetalheTema()))?.body;
                        if (temaInimigo == undefined || temaInimigo == null) {
                            setTemaBarcoPequenoSrcInimigo(_ => temaBarcoPequenoSrc);
                            setTemaBarcoMedioSrcInimigo(_ => temaBarcoMedioSrc);
                            setTemaBarcoGrandeSrcInimigo(_ => temaBarcoGrandeSrc);
                            setTemaBarcoGiganteSrcInimigo(_ => temaBarcoGiganteSrc);
                            return;
                        }
                        setTemaBarcoPequenoSrcInimigo("data:image/*;base64," + temaInimigo.naviosTema.find(x => x.tamnQuadrados == 1)?.arquivoImagemNavio?.dadosBase64)
                        setTemaBarcoMedioSrcInimigo("data:image/*;base64," + temaInimigo.naviosTema.find(x => x.tamnQuadrados == 2)?.arquivoImagemNavio?.dadosBase64)
                        setTemaBarcoGrandeSrcInimigo("data:image/*;base64," + temaInimigo.naviosTema.find(x => x.tamnQuadrados == 3)?.arquivoImagemNavio?.dadosBase64)
                        setTemaBarcoGiganteSrcInimigo("data:image/*;base64," + temaInimigo.naviosTema.find(x => x.tamnQuadrados == 4)?.arquivoImagemNavio?.dadosBase64)
                    }
                } else {
                    setProblemaErro(_ => rSala.problema);
                    setErroEstaAberto(_ => true);
                }
            });
    }

    const carregarCallbacksProgressos = async () => {
        return [
            await clientRest.callGetAutorizado<MdProgressoNaviosJogador>('/api/fluxoMultiplayer/detalharProgressoJogadorLogado', new MdProgressoNaviosJogador()),
            await clientRest.callGetAutorizado<MdProgressoNaviosJogador>('/api/fluxoMultiplayer/detalharProgressoJogadorOponente', new MdProgressoNaviosJogador())
        ];
    }
    const carregarProgressos = () => {
        carregarCallbacksProgressos()
            .then(([rJogadorLogado, rJogadorOponente]) => {
                let estaExibindoErro = false;
                if (rJogadorLogado.eOk) {
                    setProgressoJogadorLogado(_ => rJogadorLogado.body ?? new MdProgressoNaviosJogador());

                    if ((rJogadorLogado.body ?? new MdProgressoNaviosJogador()).estaNaVezDoJogador)
                        setEstaEsperandoInimigoAtirar(_ => false);
                    else
                        setEstaEsperandoInimigoAtirar(_ => true);
                    const horaRecomecoAsDate = new Date((rJogadorLogado.body ?? new MdProgressoNaviosJogador()).horaRecomecoTimer);
                    setComecoTimerCalculado(_ => horaRecomecoAsDate.getTime());
                } else {
                    setProblemaErro(_ => rJogadorLogado.problema);
                    setErroEstaAberto(_ => true);
                    estaExibindoErro = true;
                }
                if (rJogadorOponente.eOk) {
                    setProgressoJogadorInimigo(_ => rJogadorOponente.body ?? new MdProgressoNaviosJogador());
                } else {
                    if (!estaExibindoErro) {
                        setProblemaErro(_ => rJogadorOponente.problema);
                        setErroEstaAberto(_ => true);
                    }
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

        carregarSala(true);
        carregarProgressos();

        // Preparar o UserWebSocket no WS
        let preparacaoUsuarioLogadoWs = new WsEnvelope();
        preparacaoUsuarioLogadoWs.numeroTipoAtualizacao = LiteralTipoAtualizacao.PrepararUsuarioLogadoWs;
        preparacaoUsuarioLogadoWs.tokenAuth = props.tokenAuth;
        sendJsonMessage({ ...preparacaoUsuarioLogadoWs });

        // Timer
        const timer = setInterval(() => {
            setDateAgoraExato(_ => new Date());
        }, 66);
        return () => clearInterval(timer);
    }, []);

    // Timer
    useEffect(() => {
        const millisegundosPassados = dateAgoraExato.getTime() - comecoTimerCalculado;
        setProgressTimer(_ => millisegundosPassados < SEGUNDOS_TIMER * 1000 ? ((millisegundosPassados / (SEGUNDOS_TIMER * 1000)) * 100) : 100);
    }, [comecoTimerCalculado, dateAgoraExato]);
    useEffect(() => {
        if (progressTimer === 100) {
            if (estaEsperandoInimigoAtirar)
                return;

            setEstaEsperandoInimigoAtirar(_ => true);

            // Enviar tiro que e vez passada (numeroLinha igual a -1)
            const payloadTiro = new PostTiroFluxo();
            payloadTiro.numeroLinha = -1;
            payloadTiro.numeroColuna = 0;
            clientRest.callPostAutorizado<string>('/api/fluxoMultiplayer/adicionarTiro', payloadTiro, '')
                .then(rTiro => {
                    if (!rTiro.eOk) {
                        setProblemaErro(_ => rTiro.problema);
                        setErroEstaAberto(_ => true);
                        return;
                    }

                    carregarProgressos();

                    // Notificar outros clients
                    let notificarTiro = new WsEnvelope();
                    notificarTiro.numeroTipoAtualizacao = LiteralTipoAtualizacao.FluxoJogo;
                    notificarTiro.tokenAuth = props.tokenAuth;
                    sendJsonMessage({ ...notificarTiro });
                });
        }
    }, [progressTimer]);

    useEffect(() => {
        if (lastJsonMessage) {
            const pedidoAtualizacao = (lastJsonMessage as unknown) as WsEnvelope;
            if (pedidoAtualizacao.numeroTipoAtualizacao == LiteralTipoAtualizacao.ListagemSalas)
                carregarSala();
            if (pedidoAtualizacao.numeroTipoAtualizacao == LiteralTipoAtualizacao.FluxoJogo) {
                carregarProgressos();
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if (salaJogando != null) {
            if (salaJogando.totalJogadores < 2)
                setErroOponenteSaiuEstaAberto(_ => true);
        }
    }, [salaJogando]);

    const calcularSrc = (tamanhoQuadrados: number): string => {
        if (tamanhoQuadrados == 1)
            return temaBarcoPequenoSrc ?? '';
        if (tamanhoQuadrados == 2)
            return temaBarcoMedioSrc ?? '';
        if (tamanhoQuadrados == 3)
            return temaBarcoGrandeSrc ?? '';
        if (tamanhoQuadrados == 4)
            return temaBarcoGiganteSrc ?? '';
        return '';
    }

    const calcularSrcInimigo = (tamanhoQuadrados: number): string => {
        if (tamanhoQuadrados == 1)
            return temaBarcoPequenoSrcInimigo ?? '';
        if (tamanhoQuadrados == 2)
            return temaBarcoMedioSrcInimigo ?? '';
        if (tamanhoQuadrados == 3)
            return temaBarcoGrandeSrcInimigo ?? '';
        if (tamanhoQuadrados == 4)
            return temaBarcoGiganteSrcInimigo ?? '';
        return '';
    }

    const handleFecharErroOponenteSaiuOnClick = () => {
        setErroOponenteSaiuEstaAberto(_ => false);
        navigate('/salas');
    }

    return (
        <div>
            <div className='titulo-wrapper'>
                <h1>ENCOURAÇADO VALENTE</h1>
            </div>
            <div className="container-tabuleiros">
                <Typography textAlign="center" style={{ fontFamily: "bungee", color: "black" }}>É HORA DO ATAQUE</Typography>
                <div className="d-flex justify-content-between">
                    <div style={{ backgroundColor: estaEsperandoInimigoAtirar ? 'initial' : DESTAQUE_FUNDO_VEZ_JOGADOR }}>
                        <Typography textAlign="center" style={{ fontFamily: "bungee", color: "gray" }}>VOCÊ</Typography>
                        <div style={{ position: 'relative' }}>
                            <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='user' clickable={false} />
                            {progressoJogadorLogado != null && progressoJogadorLogado.naviosTotais.map((iNavio, idxNavio) => {
                                if (iNavio.orientacao == LiteralOrientacao.Baixo) {
                                    return (<div key={idxNavio} className='d-inline'>
                                        <ImgNavioVertical
                                            dadosBase64=''
                                            eSrcBase64={false}
                                            srcImagem={calcularSrc(iNavio.tamanhoQuadradosNavio)}
                                            tamanhoQuadrados={iNavio.tamanhoQuadradosNavio}
                                            altImagem='seu navio'
                                            ePositionAbsolute={true}
                                            cssLeftAsPx={(iNavio.numeroColuna) * 30}
                                            cssTopAsPx={(iNavio.numeroLinha) * 30} />
                                    </div>);
                                }
                                if (iNavio.orientacao == LiteralOrientacao.Direita) {
                                    return (<div key={idxNavio} className='d-inline'>
                                        <ImgNavioHorizontal
                                            dadosBase64=''
                                            eSrcBase64={false}
                                            srcImagem={calcularSrc(iNavio.tamanhoQuadradosNavio)}
                                            tamanhoQuadrados={iNavio.tamanhoQuadradosNavio}
                                            altImagem='seu navio'
                                            ePositionAbsolute={true}
                                            cssLeftAsPx={(iNavio.numeroColuna) * 30}
                                            cssTopAsPx={(iNavio.numeroLinha) * 30} />
                                    </div>);
                                }
                            })}
                            {progressoJogadorLogado != null && progressoJogadorLogado.tiros.map((iNavio, idxNavio) => (
                                iNavio.acertou ? <CloseOutlinedIcon color="error" key={idxNavio}
                                    sx={{
                                        top: (iNavio.numeroLinha * 30) + 'px',
                                        left: (iNavio.numeroColuna * 30) + 'px',
                                        position: 'absolute',
                                        fontSize: '30px'
                                    }} /> : <CircleOutlinedIcon color="error" key={idxNavio}
                                        sx={{
                                            top: (iNavio.numeroLinha * 30) + 'px',
                                            left: (iNavio.numeroColuna * 30) + 'px',
                                            position: 'absolute',
                                            fontSize: '30px'
                                        }} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div style={{ height: '100px' }}>
                        </div>
                        <CircularProgressWithLabel value={progressTimer} />
                    </div>
                    <div style={{ backgroundColor: estaEsperandoInimigoAtirar ? DESTAQUE_FUNDO_VEZ_JOGADOR : 'initial' }}>
                        <Typography textAlign="center" style={{ fontFamily: "bungee", color: "gray" }}>{nomeInimigo}</Typography>
                        <div style={{ position: 'relative' }}>
                            <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='opponent' clickable={!estaEsperandoInimigoAtirar} backgroundColor="#EBEBEB" />
                            {progressoJogadorInimigo != null && progressoJogadorInimigo.naviosTotais.map((iNavio, idxNavio) => {
                                if (iNavio.orientacao == LiteralOrientacao.Baixo) {
                                    return (<div key={idxNavio} className='d-inline'>
                                        <ImgNavioVertical
                                            dadosBase64=''
                                            eSrcBase64={false}
                                            srcImagem={calcularSrcInimigo(iNavio.tamanhoQuadradosNavio)}
                                            tamanhoQuadrados={iNavio.tamanhoQuadradosNavio}
                                            altImagem='navio inimigo'
                                            ePositionAbsolute={true}
                                            cssLeftAsPx={(iNavio.numeroColuna) * 30}
                                            cssTopAsPx={(iNavio.numeroLinha) * 30} />
                                    </div>);
                                }
                                if (iNavio.orientacao == LiteralOrientacao.Direita) {
                                    return (<div key={idxNavio} className='d-inline'>
                                        <ImgNavioHorizontal
                                            dadosBase64=''
                                            eSrcBase64={false}
                                            srcImagem={calcularSrcInimigo(iNavio.tamanhoQuadradosNavio)}
                                            tamanhoQuadrados={iNavio.tamanhoQuadradosNavio}
                                            altImagem='navio inimigo'
                                            ePositionAbsolute={true}
                                            cssLeftAsPx={(iNavio.numeroColuna) * 30}
                                            cssTopAsPx={(iNavio.numeroLinha) * 30} />
                                    </div>);
                                }
                            })}
                            {progressoJogadorInimigo != null && progressoJogadorInimigo.tiros.map((iNavio, idxNavio) => (
                                iNavio.acertou ? <CloseOutlinedIcon color="error" key={idxNavio}
                                    sx={{
                                        top: (iNavio.numeroLinha * 30) + 'px',
                                        left: (iNavio.numeroColuna * 30) + 'px',
                                        position: 'absolute',
                                        fontSize: '30px'
                                    }} /> : <CircleOutlinedIcon color="error" key={idxNavio}
                                        sx={{
                                            top: (iNavio.numeroLinha * 30) + 'px',
                                            left: (iNavio.numeroColuna * 30) + 'px',
                                            position: 'absolute',
                                            fontSize: '30px'
                                        }} />
                            ))}
                        </div>
                    </div>
                </div>
                <Typography textAlign="center" style={{ fontFamily: "bungee", color: "gray" }}>{!estaEsperandoInimigoAtirar ? 'SUA VEZ' : 'AGUARDE O ADVERSÁRIO JOGAR'}</Typography>
            </div>
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
            <ErroModal estaAberto={erroOponenteSaiuEstaAberto} onFechar={() => handleFecharErroOponenteSaiuOnClick()} problema='O seu oponente se desconectou!' />
        </div>
    )
}

export default TelaJogo