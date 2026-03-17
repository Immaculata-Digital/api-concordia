import { pool } from './src/infra/database/pool';

async function getImmaculataId() {
    try {
        const result = await pool.query("SELECT uuid FROM app.tenants WHERE slug = 'immaculata'");
        console.log('IMMACULATA_UUID:', result.rows[0]?.uuid);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

getImmaculataId();
