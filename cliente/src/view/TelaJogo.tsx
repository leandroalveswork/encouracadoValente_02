import { Typography } from "@mui/material"
import { useEffect } from "react"
import { useParams } from "react-router"
import useWebSocket from "react-use-websocket"
import PosicaoContainer from "../components/PosicaoContainer"
import './css/TelaJogo.css'

export interface TelaJogoProps {
    backendUrl: string;
}

const TelaJogo = ({ backendUrl }: TelaJogoProps) => {

    const posicoesJaMarcadas: Array<string> = []
    const { roomId } = useParams()

    const { lastMessage, sendJsonMessage } = useWebSocket(`${backendUrl}?id=${roomId}`)

    const handlePosicaoOnClick = (event: any) => {
        if (!posicoesJaMarcadas.includes(event.currentTarget.id)) {
            event.currentTarget.style.backgroundColor = 'black'
            posicoesJaMarcadas.push(event.currentTarget.id)
            sendJsonMessage({ idPosicao: event.currentTarget.id, roomId })
        }
    }

    useEffect(() => {
        if (lastMessage) {
            const data = JSON.parse(lastMessage.data)
            const idParaEncontrarPosicao = data.idPosicao.replace('opponent', 'user')
            const posicao = window.document.getElementById(idParaEncontrarPosicao)
            posicao!.style.backgroundColor = 'black' //TODO: Trocar para simbolo que representa posicao atingida sem navio ou com navio (de acordo com o backend)
        }
    }, [lastMessage])

    return (
        <div>
            <div className='titulo-wrapper'>
                <h1>ENCOURAÇADO VALENTE</h1>
            </div>
            <div className="container-tabuleiros">
                <Typography textAlign="center" style={{ fontFamily: "bungee", color: "black" }}>É HORA DO ATAQUE</Typography>
                <div className="container-tabuleiros-element">
                    <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='user' clickable={false} />
                    <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='opponent' clickable={true} backgroundColor="#EBEBEB" />
                </div>
            </div>
        </div>
    )
}

export default TelaJogo