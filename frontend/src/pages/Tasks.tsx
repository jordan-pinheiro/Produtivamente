import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Definição da interface Task para corrigir erros de tipagem
interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  completed?: boolean;
  points?: number;
}

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('média');
  const [dueDate, setDueDate] = useState('');
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get('http://localhost:5000/api/tasks');
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      setError('Erro ao carregar tarefas. Por favor, tente novamente.');
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (task: Task | null = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority('média');
      setDueDate('');
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleSubmit = async () => {
    try {
      if (editingTask) {
        // Atualizar tarefa existente
        await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, {
          title,
          description,
          priority,
          dueDate: dueDate || undefined
        });
        
        setSnackbar({
          open: true,
          message: 'Tarefa atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar nova tarefa
        await axios.post('http://localhost:5000/api/tasks', {
          title,
          description,
          priority,
          dueDate: dueDate || undefined
        });
        
        setSnackbar({
          open: true,
          message: 'Tarefa criada com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchTasks();
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar tarefa. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };
  
  const handleCompleteTask = async (taskId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, {
        completed: true
      });
      
      setSnackbar({
        open: true,
        message: 'Tarefa concluída com sucesso! Pontos adicionados.',
        severity: 'success'
      });
      
      fetchTasks();
    } catch (err) {
      console.error('Erro ao concluir tarefa:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao concluir tarefa. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      
      setSnackbar({
        open: true,
        message: 'Tarefa removida com sucesso!',
        severity: 'success'
      });
      
      fetchTasks();
    } catch (err) {
      console.error('Erro ao remover tarefa:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao remover tarefa. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return (
      <Layout title="Tarefas">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Tarefas">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchTasks}>
          Tentar novamente
        </Button>
      </Layout>
    );
  }
  
  // Separar tarefas pendentes e concluídas
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  return (
    <Layout title="Tarefas">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Gerenciar Tarefas</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Tarefa
        </Button>
      </Box>
      
      {/* Tarefas pendentes */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Tarefas Pendentes
      </Typography>
      
      {pendingTasks.length > 0 ? (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {pendingTasks.map(task => (
              <Box key={task._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {task.title}
                      </Typography>
                      <Chip 
                        label={`${task.points} pts`} 
                        size="small" 
                        color={
                          task.priority === 'alta' ? 'error' : 
                          task.priority === 'média' ? 'warning' : 'success'
                        }
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description || 'Sem descrição'}
                    </Typography>
                    
                    {task.dueDate && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Data: {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleCompleteTask(task._id)}
                          title="Marcar como concluída"
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog(task)}
                          title="Editar tarefa"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Excluir tarefa"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Nenhuma tarefa pendente. Adicione novas tarefas para aumentar sua produtividade!
        </Alert>
      )}
      
      {/* Tarefas concluídas */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Tarefas Concluídas
      </Typography>
      
      {completedTasks.length > 0 ? (
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {completedTasks.map(task => (
              <Box key={task._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                <Card sx={{ height: '100%', opacity: 0.7 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1, textDecoration: 'line-through' }}>
                        {task.title}
                      </Typography>
                      <Chip 
                        label={`${task.points} pts`} 
                        size="small" 
                        color="success"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textDecoration: 'line-through' }}>
                      {task.description || 'Sem descrição'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Excluir tarefa"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Alert severity="info">
          Nenhuma tarefa concluída ainda. Complete tarefas para ganhar pontos e subir de nível!
        </Alert>
      )}
      
      {/* Diálogo para criar/editar tarefa */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="priority-label">Prioridade</InputLabel>
            <Select
              labelId="priority-label"
              value={priority}
              label="Prioridade"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="baixa">Baixa</MenuItem>
              <MenuItem value="média">Média</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Data de Conclusão"
            type="date"
            fullWidth
            variant="outlined"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!title}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Botão flutuante para adicionar tarefa */}
      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
      
      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity as any} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Tasks;
