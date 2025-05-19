const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const SHEET_ID = '1WK_upbHnTfQWqL1w7RZK1prADoVyOpC_vjDLuFnlVvQ';

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.post('/webhook', async (req, res) => {
  const { nome, data, horario, procedimento, origem } = req.body;

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const novaLinha = [[
      nome || '', 
      data || '', 
      horario || '', 
      procedimento || '', 
      origem || 'WhatsApp', 
      new Date().toLocaleString('pt-BR')
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Plan1!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: { values: novaLinha },
    });

    res.status(200).json({ status: 'Agendamento registrado com sucesso!' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao registrar o agendamento. Fale com a atendente.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
