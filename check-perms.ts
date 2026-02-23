import { pool } from './src/infra/database/pool'
async function check() {
    try {
        const res = await pool.query("SELECT features FROM app.access_groups WHERE code = 'ADM'")
        console.log('ADM Features:', JSON.stringify(res.rows[0].features, null, 2))
    } catch (e) {
        console.error(e)
    }
    process.exit(0)
}
check()
