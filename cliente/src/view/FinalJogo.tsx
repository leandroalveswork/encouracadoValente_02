import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';

export default function FinalJogo() {

  const navigate = useNavigate();
  const { ganhou } = useParams();
  
  const handleClickVoltarSalas = () => {
    
  }
  
  return (
    <main>
      <Container sx={{ mt: 8, py: 1, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: '4%' }} maxWidth="md">
        <Typography sx={{ fontFamily: 'Bungee' }}
          mt='20px'
          variant="h4"
          align="center"
          color="black"
        >
          {(ganhou != undefined && ganhou == 'S') ? 'VOCÊ GANHOU :)' : 'VOCÊ PERDEU :('}
        </Typography>
            
        <Container sx={{ py: 4 }} maxWidth="md">
            <div className='d-flex justify-content-center'>
                {(ganhou != undefined && ganhou == 'S') ? <img src='/assets/bone_de_marinheiro.svg' style={{ height: '40vh' }} /> : <img src='/assets/salva_vidas.svg' style={{ height: '40vh' }} />}
            </div>
            <div className='d-flex justify-content-center mt-4'>
                <Button size="medium" onClick={() => navigate('/salas')} variant="contained">Voltar para as salas</Button>
            </div>
        </Container>
      </Container>
    </main>

  );
}