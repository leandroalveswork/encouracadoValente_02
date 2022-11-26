import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Pagination, styled } from '@mui/material';
import { UtilPagina } from '../util/UtilPagina';
import ClientRest from '../integracao/ClientRest';
import { MdSalaDisponivel } from '../modelos/importarBack/MdSalaDisponivel';
import { PutEntrarSala } from '../modelos/importarBack/PutEntrarSala';
import { WsEnvelope } from '../modelos/importarBack/WsEnvelope';
import { LiteralTipoAtualizacao } from '../modelos/LiteralTipoAtualizacao';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWebSocket from "react-use-websocket";
import ErroModal from '../components/erroModal/ErroModal';

interface ListagemSalasProps {
  tokenAuth: string;
  rotaWs: string;
}

export default function ListagemSalas(props: ListagemSalasProps) {

  const navigate = useNavigate();
  
  const clientRest = new ClientRest();

  const [lSalas, setLSalas] = useState<MdSalaDisponivel[]>([]);
  const [carregouSalas, setCarregouSalas] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [roomIdEspera, setRoomIdEspera] = useState<number | null>(null);
  const [estaEsperando, setEstaEsperando] = useState(false);

  const WhitePagination = styled(Pagination)({
    color: 'white',
    backgroundColor: 'white',
    borderRadius: '10px'
})

  let qtPaginas = UtilPagina.calcularQtPaginas(lSalas.length, 6);
    // useEffect(() => { qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6); }, [lTemas])

  let salasPaginadas = UtilPagina.recortarPagina(lSalas, pagina, 6);

  const { lastJsonMessage, sendJsonMessage } = useWebSocket(props.rotaWs);
  
  const [erroEstaAberto, setErroEstaAberto] = useState(false);
  const [problemaErro, setProblemaErro] = useState('');
  
  const carregarSalas = () => {
    clientRest.callGetAutorizado<MdSalaDisponivel[]>('/api/sala/listarDisponiveis', [])
      .then(async (rLista) => {
        // console.log('salas carregadas');
        if (rLista.eOk) {
          setLSalas(_ => rLista.body ?? []);
          setCarregouSalas(_ => true);
          if (!estaEsperando)
            return;
          const salaEspera = (rLista.body ?? []).find(x => x.numeroRecuperacaoUrl == roomIdEspera);
          
          // Se a sala nao esta mais disponivel, um jogador entrou
          if (salaEspera == undefined) {
    
            // Cancelar proxima Saida
            let rCancelarSaida = await clientRest.callPutAutorizado<undefined>('/api/sala/cancelarProximaSaida', {}, undefined);
            if (!rCancelarSaida.eOk) {
              setProblemaErro(_ => rCancelarSaida.problema);
              setErroEstaAberto(_ => true);
              return;
            }
            
            navigate('/game/prepare/' + roomIdEspera?.toString() ?? '');
          }
        } else {
          setProblemaErro(_ => rLista.problema);
          setErroEstaAberto(_ => true);
        }
      });
  }
  
  useEffect(() => {
    carregarSalas();
      
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
        carregarSalas();
    }
  }, [lastJsonMessage]);

  const handleClickEntrar = async (numeroRecuperacaoUrlSala: number) => {
    
    const salaEntrada = lSalas.find(x => x.numeroRecuperacaoUrl == numeroRecuperacaoUrlSala);
    if (salaEntrada == null)
      return;
      
    // Entrar pela Api
    let putEntrar = new PutEntrarSala();
    putEntrar.numeroRecuperacaoUrl = numeroRecuperacaoUrlSala;
    const rEntrar = await clientRest.callPutAutorizado<undefined>('/api/sala/entrar', putEntrar, undefined);
    if (!rEntrar.eOk) {
      setProblemaErro(_ => rEntrar.problema);
      setErroEstaAberto(_ => true);
      return;
    }
    
    if (salaEntrada.totalJogadores == 1) {
      
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
            
      navigate('/game/prepare/' + numeroRecuperacaoUrlSala);
      return;
    }
    
    // Notificar outros clients
    let pedidoAtualizarListagemSalaEsperando = new WsEnvelope();
    pedidoAtualizarListagemSalaEsperando.numeroTipoAtualizacao = LiteralTipoAtualizacao.ListagemSalas;
    pedidoAtualizarListagemSalaEsperando.tokenAuth = props.tokenAuth;
    sendJsonMessage({ ...pedidoAtualizarListagemSalaEsperando });
    
    setRoomIdEspera(_ => numeroRecuperacaoUrlSala);
    setEstaEsperando(_ => true);
  }
  
  return (
    <main>
      <Container sx={{ mt: 8, py: 1, bgcolor: 'white', borderRadius: '1%' }} maxWidth="md">
        <Typography sx={{ fontFamily: 'Bungee' }}
          mt='20px'
          variant="h4"
          align="center"
          color="black"
        >
          {estaEsperando ? 'Salas Disponíveis' : 'Esperando Jogador'}
        </Typography>

        <Container sx={{ py: 8 }} maxWidth="md">
          {!estaEsperando && <> <Grid justifyContent="center" container spacing={7}>
            {salasPaginadas.map((sala) => (
              <Grid item key={sala.numeroRecuperacaoUrl} md={5}>
                <Card sx={{ border: 1, borderColor: '#9D9D9D', height: '100%' }}>
                  <CardContent sx={{margin: 0, border: 0, paddingBottom: 0}}>
                    <Typography align="center" sx={{ fontFamily: 'Bungee' }} gutterBottom variant="h6">
                      {'Sala #' + sala.numeroRecuperacaoUrl}
                    </Typography>
                  </CardContent>
                  <CardContent sx={{ display: 'flex', padding: 0, justifyContent: 'space-between', mx: 5}}>
                    {/* <Typography sx={{ color: 'green' , fontFamily: 'Bungee' }}>Player 1</Typography> */}
                    <Typography>Jogadores:</Typography>
                    <Typography sx={{ fontFamily: 'Bungee' }}>{sala.totalJogadores.toString() + '/2'}</Typography>
                    {/* <Typography sx={{ color: 'red', fontFamily: 'Bungee' }}>Player 2</Typography> */}
                  </CardContent>
                  <CardActions>
                    <Button size="small" variant="contained" sx={{ mx: 'auto' }} onClick={() => handleClickEntrar(sala.numeroRecuperacaoUrl)}>CONECTAR</Button>
                  </CardActions>

                </Card>
              </Grid>
            ))}
          </Grid>
          <div className="d-flex justify-content-center pt-4">
            <WhitePagination color='standard' variant='outlined' count={qtPaginas} page={pagina} onChange={(ev, pgn) => setPagina(_ => pgn)} />
          </div> </>}
          {estaEsperando && <Card sx={{ border: 1, borderColor: '#9D9D9D', height: '100%' }}>
            <CardContent sx={{margin: 0, border: 0, paddingBottom: 0}}>
              <Typography align="center" sx={{ fontFamily: 'Bungee' }} gutterBottom variant="h6">
                {'Sala #' + roomIdEspera?.toString() ?? ''}
              </Typography>
            </CardContent>
            <CardContent sx={{ display: 'flex', padding: 0, justifyContent: 'space-between', mx: 5}}>
              {/* <Typography sx={{ color: 'green' , fontFamily: 'Bungee' }}>Player 1</Typography> */}
              <Typography>Jogadores:</Typography>
              <Typography sx={{ fontFamily: 'Bungee' }}>1/2</Typography>
              {/* <Typography sx={{ color: 'red', fontFamily: 'Bungee' }}>Player 2</Typography> */}
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" disabled color="inherit" >CONECTADO</Button>
              <Button size="small" variant="contained" color="error" onClick={() => window.location.reload()}>SAIR</Button>
            </CardActions>

          </Card>}
        </Container>
      </Container>
      <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
    </main>

  );
}