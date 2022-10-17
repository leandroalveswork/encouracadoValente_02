import UserState from '../integracao/UserState';

const Home = () => {
    const userState = new UserState();
    return (
        <>
            <h1 style={ {color: 'white' }}>{`Olá usuário: ${userState.localStorageUser?.nome ?? 'indefinido'}`}</h1>
        </>
    )
}


export default Home