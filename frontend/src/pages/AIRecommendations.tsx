import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Snackbar
} from '@mui/material';
import { 
  Lightbulb as TipIcon,
  Schedule as ScheduleIcon,
  CheckCircle as TaskIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AIRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState<boolean[]>([false, false, false]);
  const [error, setError] = useState<(string | null)[]>([null, null, null]);
  const [taskSuggestions, setTaskSuggestions] = useState<any[]>([]);
  const [dailyRoutine, setDailyRoutine] = useState<any[]>([]);
  const [productivityTips, setProductivityTips] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    if (user) {
      fetchTaskSuggestions();
      fetchDailyRoutine();
      fetchProductivityTips();
    }
  }, [user]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const fetchTaskSuggestions = async () => {
    setLoading(prev => [true, prev[1], prev[2]]);
    setError(prev => [null, prev[1], prev[2]]);
    
    try {
      // ===== MODIFICAÇÃO AQUI =====
      // Enviando um corpo vazio. O backend agora é responsável por coletar os dados do usuário.
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/task-suggestions`, {});
      
      setTaskSuggestions(res.data.suggestions);
    } catch (err: any) {
      console.error('Erro ao buscar sugestões de tarefas:', err);
      setError(prev => [err.response?.data?.msg || 'Erro ao carregar sugestões.', prev[1], prev[2]]);
    } finally {
      setLoading(prev => [false, prev[1], prev[2]]);
    }
  };
  
  const fetchDailyRoutine = async () => {
    setLoading(prev => [prev[0], true, prev[2]]);
    setError(prev => [prev[0], null, prev[2]]);
    
    try {
      // ===== MODIFICAÇÃO AQUI =====
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/daily-routine`, {});
      
      setDailyRoutine(res.data.routine);
    } catch (err: any) {
      console.error('Erro ao buscar rotina diária:', err);
      setError(prev => [prev[0], err.response?.data?.msg || 'Erro ao carregar rotina.', prev[2]]);
    } finally {
      setLoading(prev => [prev[0], false, prev[2]]);
    }
  };
  
  const fetchProductivityTips = async () => {
    setLoading(prev => [prev[0], prev[1], true]);
    setError(prev => [prev[0], prev[1], null]);
    
    try {
      // ===== MODIFICAÇÃO AQUI =====
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/productivity-tips`, {});
      
      setProductivityTips(res.data.tips);
    } catch (err: any) {
      console.error('Erro ao buscar dicas de produtividade:', err);
      setError(prev => [prev[0], prev[1], err.response?.data?.msg || 'Erro ao carregar dicas.']);
    } finally {
      setLoading(prev => [prev[0], prev[1], false]);
    }
  };
  
  const handleAddTask = async (task: any) => {
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        title: task.title,
        description: task.description,
        priority: task.priority.toLowerCase()
      });
      
      setSnackbar({
        open: true,
        message: 'Tarefa adicionada com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao adicionar tarefa:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao adicionar tarefa. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const renderTaskSuggestions = () => {
    if (loading[0]) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error[0]) {
      return (
        <Box>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error[0]}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchTaskSuggestions}
          >
            Tentar novamente
          </Button>
        </Box>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {taskSuggestions.map((task, index) => (
            <Box key={index} sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      {task.title}
                    </Typography>
                    <Chip 
                      label={task.priority} 
                      size="small" 
                      color={
                        task.priority.toLowerCase() === 'alta' ? 'error' : 
                        task.priority.toLowerCase() === 'média' ? 'warning' : 'success'
                      }
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>
                  
                  {task.estimatedTime && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Tempo estimado: {task.estimatedTime}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleAddTask(task)}
                    >
                      Adicionar Tarefa
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  
  const renderDailyRoutine = () => {
    if (loading[1]) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error[1]) {
      return (
        <Box>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error[1]}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchDailyRoutine}
          >
            Tentar novamente
          </Button>
        </Box>
      );
    }
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Rotina Diária Personalizada
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {dailyRoutine.map((item, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  <ScheduleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={item.time} 
                  secondary={item.activity} 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchDailyRoutine}
            >
              Gerar Nova Rotina
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  const renderProductivityTips = () => {
    if (loading[2]) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error[2]) {
      return (
        <Box>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error[2]}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchProductivityTips}
          >
            Tentar novamente
          </Button>
        </Box>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {productivityTips.map((tip, index) => (
            <Box key={index} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TipIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {tip.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1">
                    {tip.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchProductivityTips}
          >
            Gerar Novas Dicas
          </Button>
        </Box>
      </Box>
    );
  };
  
  return (
    <Layout title="Recomendações IA">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Recomendações Inteligentes</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Sugestões personalizadas baseadas no seu comportamento e nível de produtividade.
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="ai recommendations tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<TaskIcon />} 
              label="Sugestões de Tarefas" 
              id="ai-tab-0" 
              aria-controls="ai-tabpanel-0" 
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label="Rotina Diária" 
              id="ai-tab-1" 
              aria-controls="ai-tabpanel-1" 
            />
            <Tab 
              icon={<TipIcon />} 
              label="Dicas de Produtividade" 
              id="ai-tab-2" 
              aria-controls="ai-tabpanel-2" 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {renderTaskSuggestions()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderDailyRoutine()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {renderProductivityTips()}
        </TabPanel>
      </Box>
      
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

export default AIRecommendations;
