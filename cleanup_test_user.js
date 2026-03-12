
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

async function cleanup() {
  const cpf = '42907612832';
  try {
    console.log(`Limpando dados para o CPF: ${cpf}...`);
    
    // Buscar UUID da pessoa
    const personRes = await pool.query("SELECT uuid, usuario_id FROM app.people WHERE REPLACE(REPLACE(cpf_cnpj, '.', ''), '-', '') = $1", [cpf]);
    
    for (const row of personRes.rows) {
      const personId = row.uuid;
      const userId = row.usuario_id;
      
      console.log(`Removendo registros para Person: ${personId}, User: ${userId}`);
      
      await pool.query("DELETE FROM app.pluvyt_clients WHERE person_id = $1", [personId]);
      await pool.query("DELETE FROM app.people_contacts WHERE people_id = $1", [personId]);
      await pool.query("DELETE FROM app.people WHERE uuid = $1", [personId]);
      if (userId) {
        await pool.query("DELETE FROM app.users WHERE uuid = $1", [userId]);
      }
    }
    
    // Também remover por e-mail se sobrar algo
    const email = 'jonatha.gu@gmail.com';
    const userRes = await pool.query("SELECT uuid FROM app.users WHERE email = $1", [email]);
    for (const row of userRes.rows) {
        await pool.query("DELETE FROM app.users WHERE uuid = $1", [row.uuid]);
    }

    console.log("Limpeza concluída com sucesso.");
  } catch (err) {
    console.error("Erro na limpeza:", err);
  } finally {
    await pool.end();
  }
}

cleanup();
