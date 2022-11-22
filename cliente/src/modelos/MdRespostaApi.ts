export default class MdRespostaApi<T> {
    constructor() {
        this.statusCode = 200;
        this.problema = '';
        this.body = null;
    }
    statusCode: number
    problema: string
    body: T | null
    get eOk() {
        return 200 <= this.statusCode && this.statusCode <= 299;
    }
}