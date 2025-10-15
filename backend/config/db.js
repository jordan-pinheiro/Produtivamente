const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://gabrielguedesoc:ctxOXSLHxr0qivJn@clusterprodutivamente.5k8wupu.mongodb.net/?retryWrites=true&w=majority&appName=ClusterProdutivamente";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conexão com MongoDB estabelecida com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
