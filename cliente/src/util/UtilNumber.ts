export class UtilNumber {
    static parseFloatOrDefault = (numero: string): number | null => {
        try {
            try {
                const numeroAsFloat = parseFloat(numero);
                return numeroAsFloat;
            } catch (exc) {
                const numeroCulturaBr = numero.split('').map(iChr => {
                    if (iChr == ',') {
                        return '.';
                    }
                    if (iChr == '.') {
                        return ',';
                    }
                    return iChr;
                }).join('');
                const numeroCulturaBrAsFloat = parseFloat(numeroCulturaBr);
                return numeroCulturaBrAsFloat;
            }
        } catch (exc) {
            return null;    
        }
    }
}