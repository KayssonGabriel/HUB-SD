const mongoose = require('mongoose');

async function limparBanco() {
    try {
        console.log('🧹 Limpando banco de dados...');
        
        // Conectar ao MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/hub_db');
        console.log('✅ Conectado ao MongoDB');
        
        // Obter referência à coleção
        const db = mongoose.connection.db;
        const collection = db.collection('centrodistribuicaos');
        
        // Listar índices existentes
        console.log('📋 Índices existentes:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`   - ${JSON.stringify(index.key)}`);
        });
        
        // Remover todos os documentos
        console.log('🗑️  Removendo todos os documentos...');
        const deleteResult = await collection.deleteMany({});
        console.log(`✅ ${deleteResult.deletedCount} documentos removidos`);
        
        // Remover índices problemáticos (manter apenas _id)
        console.log('🔧 Removendo índices problemáticos...');
        try {
            await collection.dropIndex('endereco.ip_1_endereco.porta_1');
            console.log('✅ Índice endereco.ip_1_endereco.porta_1 removido');
        } catch (error) {
            console.log('ℹ️  Índice endereco.ip_1_endereco.porta_1 não existe');
        }
        
        try {
            await collection.dropIndex('endereco_1_porta_1');
            console.log('✅ Índice endereco_1_porta_1 removido');
        } catch (error) {
            console.log('ℹ️  Índice endereco_1_porta_1 não existe');
        }
        
        try {
            await collection.dropIndex('nome_1');
            console.log('✅ Índice nome_1 removido');
        } catch (error) {
            console.log('ℹ️  Índice nome_1 não existe');
        }
        
        // Recriar índices corretos
        console.log('🔨 Recriando índices corretos...');
        await collection.createIndex({ nome: 1 }, { unique: true });
        console.log('✅ Índice único por nome criado');
        
        await collection.createIndex({ endereco: 1, porta: 1 }, { unique: true });
        console.log('✅ Índice único por endereco+porta criado');
        
        // Verificar índices finais
        console.log('📋 Índices finais:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(index => {
            console.log(`   - ${JSON.stringify(index.key)}`);
        });
        
        console.log('🎉 Banco de dados limpo com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao limpar banco:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar limpeza
limparBanco().catch(error => {
    console.error('❌ Erro durante limpeza:', error.message);
    process.exit(1);
});
