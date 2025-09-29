function toCSV(rows, headerOrder) {
    if (!Array.isArray(rows)) rows = [rows];
    if (rows.length === 0) return "";

    const keys = headerOrder && headerOrder.length ? headerOrder : Object.keys(rows[0] ?? {});
    const esc = (v) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
    };

    const header = keys.map(esc).join(",");
    const body = rows.map(r => keys.map(k => esc(r[k])).join(",")).join("\n");
    return `${header}\n${body}\n`;
}

/**
 * Respond in the best format requested by the client:
 * - application/json       -> JSON (default)
 * - application/hal+json   -> JSON with _links
 * - text/csv               -> CSV (list endpoints)
 *
 * @param {Request} req
 * @param {Response} res
 * @param {object|array} data
 * @param {object} [links]
 * @param {object} [csvOptions]
 * @param {number} [status=200]
 */
function respond(req, res, data, links = {}, csvOptions = {}, status = 200) {
    res.set("Vary", "Accept");

    const preferred = req.accepts(["application/hal+json", "application/json", "text/csv"]) || "application/json";

    if (preferred === "text/csv") {
        let rows = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [data]);
        rows = rows.map(r => {
            const { _links, ...flat } = r || {};
            return flat;
        });

        const csv = toCSV(rows, csvOptions.headerOrder);
        res.status(status).type("text/csv").send(csv);
        return;
    }

    if (preferred === "application/hal+json") {
        const payload = Array.isArray(data) || data?.items
            ? { ...(data.items ? data : { items: data }), _links: links }
            : { ...data, _links: links };
        res.status(status).type("application/hal+json").json(payload);
        return;
    }

    res.status(status).json(data);
}

module.exports = { respond };
