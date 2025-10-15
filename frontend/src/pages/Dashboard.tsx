import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon // <-- GARANTA QUE ELE ESTÁ SENDO IMPORTADO AQUI
} from '@mui/material';
import {
  CheckCircle as TaskIcon,
  EmojiEvents as AchievementIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface Task {
  _id: string;
  title: string;
  priority: 'alta' | 'média' | 'baixa';
  completed: boolean;
}

interface Achievement {
  _id: string;
  title: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    unlockedAchievements: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`);
      const { stats, recentTasks, recentAchievements } = response.data;
      setStats(stats);
      setRecentTasks(recentTasks);
      setRecentAchievements(recentAchievements);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = user?.points || 0;
  const nextLevelPoints = user?.level ? user.level * 100 : 100;
  const currentLevelPoints = user?.level ? (user.level - 1) * 100 : 0;
  const pointsInCurrentLevel = totalPoints - currentLevelPoints;
  const progressPercentage = nextLevelPoints > currentLevelPoints 
    ? (pointsInCurrentLevel / (nextLevelPoints - currentLevelPoints)) * 100
    : 0;

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Dashboard">
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchDashboardData}>Tentar novamente</Button>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Bem-vindo, {user?.name}!</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Este é o seu centro de produtividade. Continue focado e alcance seus objetivos!
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flexGrow: 1, minWidth: '200px' }}><Card><CardContent><Typography variant="h6" gutterBottom>Tarefas Pendentes</Typography><Typography variant="h3">{stats.pendingTasks}</Typography></CardContent></Card></Box>
        <Box sx={{ flexGrow: 1, minWidth: '200px' }}><Card><CardContent><Typography variant="h6" gutterBottom>Tarefas Concluídas</Typography><Typography variant="h3">{stats.completedTasks}</Typography></CardContent></Card></Box>
        <Box sx={{ flexGrow: 1, minWidth: '200px' }}><Card><CardContent><Typography variant="h6" gutterBottom>Conquistas</Typography><Typography variant="h3">{stats.unlockedAchievements}</Typography></CardContent></Card></Box>
        <Box sx={{ flexGrow: 1, minWidth: '200px' }}><Card sx={{ bgcolor: 'primary.main', color: 'white' }}><CardContent><Typography variant="h6" gutterBottom>Pontos Totais</Typography><Typography variant="h3">{totalPoints}</Typography></CardContent></Card></Box>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Nível {user?.level}</Typography>
            <Chip label={`${pointsInCurrentLevel} / ${nextLevelPoints - currentLevelPoints} pts`} color="primary" />
          </Box>
          <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 10, borderRadius: 5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Faltam {Math.max(0, (nextLevelPoints - currentLevelPoints) - pointsInCurrentLevel)} pontos para o próximo nível
          </Typography>
        </CardContent>
      </Card>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tarefas Recentes</Typography>
              <Divider sx={{ my: 2 }} />
              {recentTasks.length > 0 ? (
                <List dense>
                  {recentTasks.map(task => (
                    <ListItem key={task._id}
                      secondaryAction={<Chip label={task.priority} size="small"
                        color={task.priority === 'alta' ? 'error' : task.priority === 'média' ? 'warning' : 'info'} />}
                    >
                      <ListItemIcon> {/* <-- CORRIGIDO AQUI */}
                        <TaskIcon color={task.completed ? 'success' : 'action'} />
                      </ListItemIcon>
                      <ListItemText primary={task.title} sx={{ textDecoration: task.completed ? 'line-through' : 'none' }} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" variant="outlined">Nenhuma tarefa recente para mostrar.</Alert>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" size="small" onClick={() => navigate('/tasks')}>Ver Todas as Tarefas</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Conquistas Recentes</Typography>
              <Divider sx={{ my: 2 }} />
              {recentAchievements.length > 0 ? (
                <List dense>
                  {recentAchievements.map(ach => (
                    <ListItem key={ach._id}>
                      <ListItemIcon> {/* <-- E CORRIGIDO AQUI */}
                        <AchievementIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={ach.title} secondary={ach.description} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" variant="outlined">Nenhuma conquista recente. Continue assim!</Alert>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" size="small" onClick={() => navigate('/achievements')}>Ver Todas as Conquistas</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Layout>
  );
};

export default Dashboard;