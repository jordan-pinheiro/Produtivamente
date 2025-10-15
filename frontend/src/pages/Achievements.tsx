import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  points: number;
  criteria: string;
  isUnlocked: boolean; // A API agora nos envia este campo
  unlockedAt: string | null; // E a data de desbloqueio
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAchievements();
  }, []);
  
  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get('http://localhost:5000/api/achievements');
       setAchievements(res.data);
    } catch (err: any) {
      console.error('Erro ao buscar conquistas:', err);
      setError(err.response?.data?.msg || 'Erro ao carregar conquistas.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout title="Conquistas">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Conquistas">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchAchievements}>
          Tentar novamente
        </Button>
      </Layout>
    );
  }
  
  // Separar conquistas desbloqueadas e bloqueadas
  const unlockedAchievements = achievements.filter(ach => ach.isUnlocked);
  const lockedAchievements = achievements.filter(ach => !ach.isUnlocked);
  
  // Calcular progresso total
  const totalAchievements = achievements.length;
  const progressPercentage = totalAchievements > 0 
    ? (unlockedAchievements.length / totalAchievements) * 100 
    : 0;
  
  return (
    <Layout title="Conquistas">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Suas Conquistas</Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrophyIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Progresso de Conquistas</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">
              {unlockedAchievements.length} de {totalAchievements} conquistas desbloqueadas
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </CardContent>
      </Card>
      
      {/* Seção de Conquistas Desbloqueadas */}
      <Typography variant="h6" sx={{ mb: 2 }}>Conquistas Desbloqueadas</Typography>
      {unlockedAchievements.length > 0 ? (
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {unlockedAchievements.map(achievement => (
            <Box key={achievement._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <UnlockIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">{achievement.title}</Typography>
                    </Box>
                    <Chip label={`${achievement.points} pts`} size="small" color="success"/>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2 }}>{achievement.description}</Typography>
                  {achievement.unlockedAt && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Desbloqueada em: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Nenhuma conquista desbloqueada ainda. Complete tarefas e desafios para ganhar!
        </Alert>
      )}
      
      {/* Seção de Conquistas Disponíveis (Bloqueadas) */}
      <Typography variant="h6" sx={{ mb: 2 }}>Conquistas Disponíveis</Typography>
      {lockedAchievements.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {lockedAchievements.map(achievement => (
            <Box key={achievement._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LockIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">{achievement.title}</Typography>
                    </Box>
                    <Chip label={`${achievement.points} pts`} size="small" color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {achievement.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                    Critério: {achievement.criteria}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Alert severity="success">
          Parabéns! Você desbloqueou todas as conquistas disponíveis!
        </Alert>
      )}
    </Layout>
  );
};

export default Achievements;
