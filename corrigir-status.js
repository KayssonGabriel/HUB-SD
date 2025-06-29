const mongoose = require('mongoose');

async function corrigirStatus() {
    try {
        console.log('🔧 Corrigindo status dos CDs...');
        
        // Conectar ao MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/hub_db');
        console.log('✅ Conectado ao MongoDB');
        
        // Obter referência à coleção
        const db = mongoose.connection.db;
        const collection = db.collection('centrodistribuicaos');
        
        // Atualizar todos os CDs online para ativo
        const updateResult = await collection.updateMany(
            { status: 'online' },
            { $set: { status: 'ativo' } }
        );
        
        console.log(`✅ ${updateResult.modifiedCount} CDs atualizados para status 'ativo'`);
        
        // Verificar resultado
        const cds = await collection.find({}).toArray();
        console.log('📋 Status atual dos CDs:');
        cds.forEach(cd => {
            console.log(`   - ${cd.nome}: ${cd.status}`);
        });
        
        console.log('🎉 Status corrigido com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir status:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar correção
corrigirStatus().catch(error => {
    console.error('❌ Erro durante correção:', error.message);
    process.exit(1);
});
