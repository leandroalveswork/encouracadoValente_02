import { Typography } from "@mui/material"
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

export interface TelaJogoProps {
    tokenAuth: string;
    rotaWs: string;
}

const TelaJogo = (props: TelaJogoProps) => {

    const posicoesJaMarcadas: Array<string> = []
    
    const navigate = useNavigate();
    const { roomId } = useParams()
    
    const clientRest = new ClientRest();

    const [salaJogando, setSalaJogando] = useState<MdSalaDetalhada | null>(null);
    const [progressoJogadorLogado, setProgressoJogadorLogado] = useState<MdProgressoNaviosJogador | null>(null);
    const [progressoJogadorInimigo, setProgressoJogadorInimigo] = useState<MdProgressoNaviosJogador | null>(null);

    const [temaBarcoPequenoSrc, setTemaBarcoPequenoSrc] = useState<string>();
    const [temaBarcoMedioSrc, setTemaBarcoMedioSrc] = useState<string>();
    const [temaBarcoGrandeSrc, setTemaBarcoGrandeSrc] = useState<string>();
    const [temaBarcoGiganteSrc, setTemaBarcoGiganteSrc] = useState<string>();

    const { lastJsonMessage, sendJsonMessage } = useWebSocket(props.rotaWs + '?id=' + roomId);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const [erroOponenteSaiuEstaAberto, setErroOponenteSaiuEstaAberto] = useState(false);

    const handlePosicaoOnClick = (event: any) => {
        if (!posicoesJaMarcadas.includes(event.currentTarget.id)) {
            event.currentTarget.style.backgroundColor = 'black'
            posicoesJaMarcadas.push(event.currentTarget.id)
            sendJsonMessage({ idPosicao: event.currentTarget.id, roomId })
        }
    }
    
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
                console.table(rJogadorLogado);
                if (rJogadorLogado.eOk) {
                    setProgressoJogadorLogado(_ => rJogadorLogado.body ?? new MdProgressoNaviosJogador());
                } else {
                    setProblemaErro(_ => rJogadorLogado.problema);
                    setErroEstaAberto(_ => true);
                    estaExibindoErro = true;
                }
                console.table(rJogadorOponente);
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

        carregarSala();
        carregarProgressos();
      
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
            if (pedidoAtualizacao.numeroTipoAtualizacao == LiteralTipoAtualizacao.FluxoJogo)
                carregarProgressos();
        }
    }, [lastJsonMessage]);
    
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
                    <div>
                        <Typography textAlign="center" style={{ fontFamily: "bungee", color: "gray" }}>VOCE</Typography>
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
                                            cssLeftAsPx={(iNavio.numeroColuna)*30}
                                            cssTopAsPx={(iNavio.numeroLinha)*30} />
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
                                            cssLeftAsPx={(iNavio.numeroColuna)*30}
                                            cssTopAsPx={(iNavio.numeroLinha)*30} />
                                    </div>);
                                }
                            })}
                            {progressoJogadorLogado != null && progressoJogadorLogado.tiros.map((iNavio, idxNavio) => (
                                iNavio.acertou ? <CloseOutlinedIcon color="error"
                                    sx={{ top: (iNavio.numeroLinha*30) + 'px',
                                        left: (iNavio.numeroColuna*30) + 'px',
                                        position: 'absolute',
                                        fontSize: '30px' }} /> : <CircleOutlinedIcon color="error" 
                                    sx={{ top: (iNavio.numeroLinha*30) + 'px',
                                        left: (iNavio.numeroColuna*30) + 'px',
                                        position: 'absolute',
                                        fontSize: '30px' }} /> 
                            ))}
                        </div>
                    </div>
                    <div>
                        <Typography textAlign="center" style={{ fontFamily: "bungee", color: "gray" }}>INIMIGO</Typography>
                        <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='opponent' clickable={true} backgroundColor="#EBEBEB" />
                    </div>
                </div>
            </div>
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
            <ErroModal estaAberto={erroOponenteSaiuEstaAberto} onFechar={() => handleFecharErroOponenteSaiuOnClick()} problema='O seu oponente se desconectou!' />
        </div>
    )
}

export default TelaJogo