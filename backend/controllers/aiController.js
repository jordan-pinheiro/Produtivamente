// controllers/aiController.js

// CORREÇÃO: Importando do pacote oficial "@google/generative-ai"
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const Task = require('../models/Task');

// Inicialize a API do Gemini com sua chave de ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Função auxiliar para simplificar as chamadas
async function getAIResponse(prompt) {
  try {
    // Nova linha corrigida:
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
    if (!jsonMatch) {
      console.error("Resposta da IA não era um JSON:", text);
      throw new Error("A resposta da IA não continha um JSON válido.");
    }
    
    const jsonString = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Erro na chamada para a API Gemini:", error);
    throw error;
  }
}

exports.generateTaskSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const completedTasks = await Task.find({ user: req.user.id, completed: true })
      .sort({ createdAt: -1 }).limit(10).select('title priority -_id');

    const prompt = `Atue como um assistente de produtividade. Baseado no usuário de nível ${user.level} e suas tarefas recentes ${JSON.stringify(completedTasks)}, sugira 3 novas tarefas com título, descrição e prioridade. Responda APENAS em formato JSON com a estrutura: {"suggestions": [...]}`;
    
    const suggestions = await getAIResponse(prompt);
    res.json(suggestions);

  } catch (error) {
    res.status(500).json({
      suggestions: [
        { title: "Planejar o dia (fallback)", description: "Reserve 15 minutos para planejar suas tarefas.", priority: "alta" },
      ]
    });
  }
};

exports.generateDailyRoutine = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const pendingTasksToday = await Task.find({ user: req.user.id, completed: false, dueDate: { $lte: new Date() } }).select('title priority -_id');

    const prompt = `Atue como um coach de produtividade. Crie uma rotina diária genérica e motivadora para um usuário de nível ${user.level}.
    As tarefas pendentes dele para hoje são: ${JSON.stringify(pendingTasksToday)}.
    Se a lista de tarefas estiver vazia, crie uma rotina padrão focada em planejamento, trabalho focado (usando técnica Pomodoro) e bem-estar, incluindo pausas.
    Sempre inclua um horário para o início do trabalho, almoço e encerramento do expediente.
    Responda APENAS em formato JSON com a seguinte estrutura: {"routine": [{"time": "HH:MM", "activity": "Descrição da atividade"}]}`;
    
    const routineData = await getAIResponse(prompt);
    res.json(routineData);

  } catch (error) {
    res.status(500).json({
      routine: [
        { time: "08:00", activity: "Planejamento do dia (fallback)" },
        { time: "09:00", activity: "Foco total na tarefa mais importante" }
      ]
    });
  }
};

exports.generateProductivityTips = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const completedTasks = await Task.find({ user: req.user.id, completed: true }).sort({ createdAt: -1 }).limit(20).select('title -_id');

    const prompt = `Como um coach, dê 4 dicas de produtividade para um usuário de nível ${user.level} com este histórico de tarefas: ${JSON.stringify(completedTasks)}. Responda APENAS em formato JSON com a estrutura: {"tips": [{"title": "...", "description": "..."}]}`;
    
    const tipsData = await getAIResponse(prompt);
    res.json(tipsData);

  } catch (error) {
    res.status(500).json({
      tips: [
        { title: "Regra dos 2 Minutos (fallback)", description: "Se uma tarefa leva menos de 2 minutos, faça-a imediatamente." },
      ]
    });
  }
};