/* Funções puras compartilhadas pelas consultas e testes, sem dependência do DOM. */
(function (root) {
    function localDay(date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    function events(records) {
        return records.flatMap(record => {
            if (record.dataHora) {
                const [date, time] = record.dataHora.split('T');
                return [{ recordId: record.id, date, time: time || '00:00:00',
                    user: record.carro?.usuario, plate: record.placaLida || record.carro?.placa || 'Sem placa',
                    parking: record.estacionamento, authorized: record.autorizado,
                    type: record.autorizado === false ? 'Acesso negado' : record.entrada ? 'Entrada' : 'Saída' }];
            }
            const common = { recordId: record.id, date: record.data, user: record.carro?.usuario,
                plate: record.placaLida || record.carro?.placa || 'Sem placa', parking: record.estacionamento };
            const result = [];
            if (record.horarioEntrada) result.push({ ...common, type: 'Entrada', time: record.horarioEntrada });
            if (record.horarioSaida) result.push({ ...common, type: 'Saída', time: record.horarioSaida });
            return result;
        }).sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`) || Number(b.recordId) - Number(a.recordId));
    }
    function openCount(records, date, parkingId) {
        const present = new Set();
        events(records).filter(e => e.date <= date && (!parkingId || Number(e.parking?.idEstacionamento) === Number(parkingId)))
            .reverse().forEach(e => {
                const key = `${e.parking?.idEstacionamento}:${e.plate}`;
                if (e.type === 'Entrada') present.add(key);
                if (e.type === 'Saída') present.delete(key);
            });
        return present.size;
    }
    function validCpf(value) {
        const cpf = String(value).replace(/\D/g, '');
        if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) return false;
        return [9, 10].every(size => {
            const sum = [...cpf.slice(0, size)].reduce((total, digit, i) => total + Number(digit) * (size + 1 - i), 0);
            const digit = (sum * 10) % 11;
            return Number(cpf[size]) === (digit === 10 ? 0 : digit);
        });
    }
    function normalize(value) { return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
    function matches(values, term) { return normalize(values.join(' ')).includes(normalize(term.trim())); }
    const model = { localDay, events, openCount, validCpf, normalize, matches };
    if (typeof module !== 'undefined' && module.exports) module.exports = model;
    else root.ConsultaModel = model;
})(typeof window !== 'undefined' ? window : globalThis);
