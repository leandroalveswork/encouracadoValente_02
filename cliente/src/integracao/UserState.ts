import { MdUsuarioLogado } from "../modelos/importarBack/MdUsuarioLogado";

class UserState {
    get localStorageUser(): MdUsuarioLogado | null {
        try {
            return JSON.parse(localStorage.user) as MdUsuarioLogado;
        } catch (er) {
            return null;
        }
    }
    set localStorageUser(valor: MdUsuarioLogado | null) {
        if (valor == null) {
            localStorage.setItem('user', '');
            return;
        }
        localStorage.setItem('user', JSON.stringify(valor));
    }
}

export default UserState