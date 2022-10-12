import { Button, Card, CardActions, CardContent, Pagination, styled, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdResumoTema } from '../../modelos/importarBack/MdResumoTema';
import { UtilPagina } from '../../util/UtilPagina';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const IndexLoja = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [lTemas, setLTemas] = useState<MdResumoTema[]>([]);
    const [pagina, setPagina] = useState(1);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    useEffect(() => {
        clientRest.callGetAutorizado<MdResumoTema[]>('/api/tema/listar', [])
            .then(rLista => {
                if (rLista.eOk) {
                    setLTemas(rLista.body ?? []);
                } else {
                    setProblemaErro(rLista.problema);
                    setErroEstaAberto(_ => true);
                }
            });
    }, []);

    let qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6);
    useEffect(() => { qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6); }, [lTemas])

    let temasPaginados = UtilPagina.recortarPagina(lTemas, pagina, 6);
    useEffect(() => { temasPaginados = UtilPagina.recortarPagina(lTemas, pagina, 6); }, [lTemas, pagina])
    console.log(qtPaginas);
    
    
    
    return (
        <>
            <span>{`Olá usuário: ${userState.localStorageUser?.nome ?? 'indefinido'}`}</span>
            <h1>Loja</h1>
            {lTemas.length > 0 && <>
                <div className="row">
                    {temasPaginados.map(iResumoTema => {
                        return (<div className='col-6' key={iResumoTema.id}>
                            <Card>

                                <CardContent>
                                    <h3 className="subtitulo">{iResumoTema.nome}</h3>
                                    <span>{iResumoTema.descricao}</span>
                                </CardContent>
                                <CardActions>
                                    <Button size="medium" onClick={() => {}}>{'Comprar - R$ ' + iResumoTema.preco}</Button>
                                    <Button size="medium" variant="contained" onClick={() => {}}>Ver mais</Button>
                                </CardActions>
                            </Card>
                        </div>)
                    })}
                </div>
                <div className="d-flex justify-content-center pt-4">
                    <Pagination count={qtPaginas} page={pagina} onChange={(ev, pgn) => setPagina(_ => pgn)} />
                </div>
            </>}
            {lTemas.length == 0 && <span>Nenhum tema adicionado ainda.</span>}
            <div className="d-flex justify-content-end pt-4">
                <Button size="medium" onClick={() => navigate('/loja/adicionarTema')}>Adicionar tema</Button>
            </div>
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default IndexLoja