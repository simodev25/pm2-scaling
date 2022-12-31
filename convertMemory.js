// Helper to convert memory from units Ki, Mi, Gi, Ti, Pi to bytes and vise versa

const base = 1024;
const formateMemory = (value) => {
    // tslint:disable-next-line:radix

    return parseFloat(value) < 1 ? value.toFixed(3) : bytesToUnitsNumber(parseInt(value));
};

function bytesToUnitsNumber(bytes, precision = 1) {
    const index = Math.floor(Math.log(bytes) / Math.log(base));
    if (!bytes) {
        return 'N/A';
    }
    if (index === 0) {
        return bytes;
    }
    return (bytes / (1024 ** 2)).toFixed(precision);
}

module.exports=formateMemory
