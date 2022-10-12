import { Button } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserState from '../../integracao/UserState';

const IndexLoja = () => {
    const userState = new UserState();
    
    const navigate = useNavigate();
    return (
        <>
        <span>{`Olá usuário: ${userState.localStorageUser?.nome ?? 'indefinido'}`}</span>
            <h1>Loja</h1>
            <Button size="medium" onClick={() => navigate('/loja/adicionarTema')}>Adicionar tema</Button>
        </>
    )
}


export default IndexLoja