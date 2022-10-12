import UserState from '../integracao/UserState';

const Home = () => {
    const userState = new UserState();
    return (
        <>
            <h1>{`Olá usuário: ${userState.localStorageUser?.nome ?? 'indefinido'}`}</h1>
        </>
    )
}


export default Home