import { pool } from './infra/database/pool'
import fs from 'fs'

async function checkMenus() {
    try {
        const res = await pool.query("SELECT key, name, icon FROM app.menus WHERE name ILIKE '%landing%' OR key ILIKE '%landing%'")
        fs.writeFileSync('./check_menus.json', JSON.stringify(res.rows, null, 2))
        console.log('Menus checked')
    } catch (err) {
        fs.writeFileSync('./check_menus_error.txt', err.toString())
    } finally {
        await pool.end()
    }
}

checkMenus()
