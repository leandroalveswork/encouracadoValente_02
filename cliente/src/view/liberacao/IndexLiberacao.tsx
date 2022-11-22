import { Button, Card, CardActions, CardContent, Fab, Pagination, styled, TextField, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PosicaoContainerPrevia from '../../components/PosicaoContainerPrevia';
import ConfirmacaoModal from '../../components/confirmacaoModal/ConfirmacaoModal';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ImgNavioVertical from '../../components/imagem/ImgNavioVertical';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdResumoUsuarioLiberavel } from '../../modelos/importarBack/MdResumoUsuarioLiberavel';
import { UtilPagina } from '../../util/UtilPagina';
import AddIcon from '@mui/icons-material/Add';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const WhitePagination = styled(Pagination)({
    color: 'white',
    backgroundColor: 'white',
    borderRadius: '10px'
})

const IndexLiberacao = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [lUsuariosLiberaveis, setLUsuariosLiberaveis] = useState<MdResumoUsuarioLiberavel[]>([]);
    const [pagina, setPagina] = useState(1);
    const [carregouUsuarios, setCarregouUsuarios] = useState(false);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    useEffect(() => {
        clientRest.callGetAutorizado<MdResumoUsuarioLiberavel[]>('/api/liberacao/listar', [])
            .then(rLista => {
                if (rLista.eOk) {
                    setLUsuariosLiberaveis(rLista.body ?? []);
                    setCarregouUsuarios(_ => true);
                } else {
                    setProblemaErro(rLista.problema);
                    setErroEstaAberto(_ => true);
                }
            });
    }, []);

    let qtPaginas = UtilPagina.calcularQtPaginas(lUsuariosLiberaveis.length, 6);
    let usuariosPaginados = UtilPagina.recortarPagina(lUsuariosLiberaveis, pagina, 6);
    
    return (
        <div>
            <h1 style={{color: 'white', fontFamily: 'bungee', textAlign: 'center', marginTop: '16px' }}>Usuários</h1>
            {!carregouUsuarios && <div className='d-flex justify-content-center w-100'>
                <CircularProgress />
            </div>}
            {carregouUsuarios && lUsuariosLiberaveis.length > 0 && <>
                <div className="row" >
                    {usuariosPaginados.map(iResumoUsuario => {
                        return (<div className='col-6' key={iResumoUsuario.id}>
                            <Card style={{marginTop: '10px'}}>
                                <CardContent >
                                    <h3 className="subtitulo">{iResumoUsuario.nome}</h3>
                                    <span>Créditos: </span><strong>R$ {iResumoUsuario.creditos}</strong>
                                </CardContent>
                                <CardActions>
                                    <Button size="medium" variant="contained" onClick={() => navigate('/liberacao/liberarCreditos?idUsuario=' + iResumoUsuario.id)}>Liberar Créditos</Button>
                                </CardActions>
                            </Card>
                        </div>)
                    })}
                </div>
                <div className="d-flex justify-content-center pt-4">
                    <WhitePagination color='standard' variant='outlined' count={qtPaginas} page={pagina} onChange={(ev, pgn) => setPagina(_ => pgn)} />
                </div>
            </>}

            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </div>
    )
}


export default IndexLiberacao
