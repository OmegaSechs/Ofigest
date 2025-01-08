// index.js
import express from "express";
import cors from "cors";
import { executeQuery, firebird, dbOptions, executeQueryTrx } from "./database.js";

const app = express();

// Middleware JSON
app.use(express.json());

// Middleware CORS
app.use(cors());

// Rota para listar ordens de serviço
app.get("/ordens-servico", function (req, res) {
    let filtro = [];
    let ssql = `
        SELECT 
            ID, 
            CLIENTE, 
            VEICULO,
            PLACA, 
            SUBSTRING(CAST(data_entrada AS VARCHAR(10)) FROM 1 FOR 10) AS DATA_ENTRADA,
            SUBSTRING(CAST(hora_entrada AS VARCHAR(13)) FROM 1 FOR 8) AS HORA_ENTRADA, 
            TIPO 
        FROM ORDEM_SERVICO 
        WHERE ID > 0
    `;

    // Aplicar filtros dinamicamente
    if (req.query.cliente) {
        ssql += "AND CLIENTE LIKE ? ";
        filtro.push("%" + req.query.cliente + "%");
    }

    if (req.query.veiculo) {
        ssql += "AND VEICULO LIKE ? ";
        filtro.push("%" + req.query.veiculo + "%");
    }

    if (req.query.placa) {
        ssql += "AND PLACA LIKE ? ";
        filtro.push("%" + req.query.placa + "%");
    }

    if (req.query.tipo) {
        ssql += "AND TIPO = ? ";
        filtro.push(req.query.tipo);
    }

    if (req.query.dataEntrada) {
        ssql += "AND DATA_ENTRADA = ? ";
        filtro.push(req.query.dataEntrada);
    }

    if (req.query.dataSaida) {
        ssql += "AND DATA_SAIDA = ? ";
        filtro.push(req.query.dataSaida);
    }

    executeQuery(ssql, filtro, function (err, result) {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            res.status(500).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

app.get('/ordens-servico/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const ordem = await database.getOrdemServicoById(id); // Método que busca no banco
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem não encontrada' });
        }
        res.json(ordem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar a ordem' });
    }
});

// Rota para cadastrar uma nova ordem de serviço
app.post("/ordens-servico", function (req, res) {
    const {
        cliente,
        veiculo,
        placa,
        data_entrada,
        hora_entrada,
        data_saida,
        hora_saida,
        tipo,
        servicos,
        produtos
    } = req.body;

    firebird.attach(dbOptions, function (err, db) {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err); 
            return res.status(500).json(err);
        }

        db.transaction(firebird.ISOLATION_READ_COMMITED, async function (err, transaction) {
            if (err) {
                console.error('Erro ao conectar ao banco de dados:', err); 
                return res.status(500).json(err);
            }

            try {
                // Inserir ordem de serviço
                let ssql = `
                    INSERT INTO ORDEM_SERVICO
                    (CLIENTE, 
                    VEICULO, 
                    PLACA, 
                    DATA_ENTRADA, 
                    HORA_ENTRADA,
                    DATA_SAIDA,
                    HORA_SAIDA, 
                    TIPO)
                    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING ID
                `;
                let result = await executeQueryTrx(transaction, ssql, [
                    cliente,
                    veiculo,
                    placa,
                    data_entrada,
                    hora_entrada,
                    data_saida,
                    hora_saida,
                    tipo
                ]);
                const id_ordem_servico = result.ID;

                // Inserir serviços e produtos na tabela os_itens
                for (const item of [...servicos, ...produtos]) {
                    let tipoItem = item.tipo === 'servico' ? 'S' : 'P';  // Definir tipo 'S' para serviço, 'P' para produto

                    // Buscar preço e descrição na tabela produtos_servicos
                    ssql = `SELECT descricao, preco FROM produtos_servicos WHERE id = ? AND tipo = ?`;
                    let itemDetails = await executeQueryTrx(transaction, ssql, [item.id, tipoItem]);

                    if (itemDetails.length === 0) {
                        throw new Error(`Produto ou serviço não encontrado: ${item.id}`);
                    }

                    const { descricao, preco } = itemDetails[0];
                    const valor_total = preco * item.quantidade;

                    // Inserir o item na tabela os_itens
                    ssql = `
                        INSERT INTO os_itens
                        (os_id, produto_servico_id, quantidade, preco_unitario, total, tipo)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    await executeQueryTrx(transaction, ssql, [
                        id_ordem_servico,
                        item.id,
                        item.quantidade,
                        preco,
                        valor_total,
                        tipoItem
                    ]);
                }

                // Commit da transação
                transaction.commit(function (err) {
                    if (err) {
                        transaction.rollback();
                        res.status(500).json(err);
                    } else {
                        res.status(201).json({ id_ordem_servico });
                    }
                });
            } catch (error) {
                transaction.rollback();
                res.status(500).json(error);
            } finally {
                db.detach();
            }
        });
    });
});

// Inicialização do servidor
app.listen(3000, function () {
    console.log("Servidor rodando na porta 3000");
});
