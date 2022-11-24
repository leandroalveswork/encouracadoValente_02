import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Pagination, styled } from '@mui/material';
import { UtilPagina } from '../util/UtilPagina';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const sala = [
  { title: 'Sala 1', roomID: '1' },
  { title: 'Sala 2', roomID: '2' },
  { title: 'Sala 3', roomID: '3' },
  { title: 'Sala 4', roomID: '4' },
  { title: 'Sala 5', roomID: '5' },
  { title: 'Sala 6', roomID: '6' },
  { title: 'Sala 7', roomID: '7' },
  { title: 'Sala 8', roomID: '8' },
  { title: 'Sala 9', roomID: '9' },
  { title: 'Sala 10', roomID: '10' },
];

export default function ListagemSalas() {

  const navigate = useNavigate();

  const [pagina, setPagina] = useState(1);

  const WhitePagination = styled(Pagination)({
    color: 'white',
    backgroundColor: 'white',
    borderRadius: '10px'
})

  let qtPaginas = UtilPagina.calcularQtPaginas(sala.length, 6);
    // useEffect(() => { qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6); }, [lTemas])

  let salasPaginadas = UtilPagina.recortarPagina(sala, pagina, 6);

  return (
    <main>
      <Container sx={{ mt: 8, py: 1, bgcolor: 'white', borderRadius: '1%' }} maxWidth="md">
        <Typography sx={{ fontFamily: 'Bungee' }}
          mt='20px'
          variant="h4"
          align="center"
          color="black"
        >
          Salas Disponíveis
        </Typography>

        <Container sx={{ py: 8 }} maxWidth="md">
          <Grid justifyContent="center" container spacing={7}>
            {salasPaginadas.map((sala) => (
              <Grid item key={sala.title} md={5}>
                <Card sx={{ border: 1, borderColor: '#9D9D9D', height: '100%' }}>
                  <CardContent sx={{margin: 0, border: 0, paddingBottom: 0}}>
                    <Typography align="center" sx={{ fontFamily: 'Bungee' }} gutterBottom variant="h6">
                      {sala.title}
                    </Typography>                    
                  </CardContent>
                  <CardContent sx={{ display: 'flex', padding: 0, justifyContent: 'space-between', mx: 5}}>
                    <Typography sx={{ color: 'green' , fontFamily: 'Bungee' }}>Player 1</Typography>
                    <Typography>X</Typography>
                    <Typography sx={{ color: 'red', fontFamily: 'Bungee' }}>Player 2</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" variant="contained" sx={{ mx: 'auto' }} onClick={() => navigate('/game/' + sala.roomID)}>ENTRAR</Button>
                  </CardActions>

                </Card>
              </Grid>
            ))}
          </Grid>
          <div className="d-flex justify-content-center pt-4">
                    <WhitePagination color='standard' variant='outlined' count={qtPaginas} page={pagina} onChange={(ev, pgn) => setPagina(_ => pgn)} />
                </div>
        </Container>
      </Container>
    </main>


  );
}