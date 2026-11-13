/* Funções puras compartilhadas pelas consultas e testes, sem dependência do DOM. */
(function (root) {
    function localDay(date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    function events(records) {
        return records.flatMap(record => {
            if (record.dataHora) {
                const [date, time = '00:00:00'] = String(record.dataHora).split('T');
                return [{
                    recordId: record.id, date, time,
                    type: record.entrada ? 'Entrada' : 'Saída',
                    user: record.carro?.usuario,
                    plate: record.placaLida || record.carro?.placa || 'Sem placa',
                    parking: record.estacionamento
                }];
            }
            const common = { recordId: record.id, date: record.data, user: record.carro?.usuario,
                plate: record.carro?.placa || 'Sem placa', parking: record.estacionamento };
            const result = [];
            if (record.horarioEntrada) result.push({ ...common, type: 'Entrada', time: record.horarioEntrada });
            if (record.horarioSaida) result.push({ ...common, type: 'Saída', time: record.horarioSaida });
            return result;
        }).sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`) || Number(b.recordId) - Number(a.recordId));
    }
    function normalize(value) { return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
    function matches(values, term) { return normalize(values.join(' ')).includes(normalize(term.trim())); }
    const model = { localDay, events, normalize, matches };
    if (typeof module !== 'undefined' && module.exports) module.exports = model;
    else root.ConsultaModel = model;
})(typeof window !== 'undefined' ? window : globalThis);
