import React, { useState } from 'react';
import { 
  Typography, Box, Card, CardContent, Button, TextField, Avatar, 
  Divider, Alert, CircularProgress, Snackbar, LinearProgress, Chip
} from '@mui/material';
import { Person as PersonIcon, EmojiEvents as TrophyIcon, Save as SaveIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// 1. Esquema de validação com Yup fora do componente
const validationSchema = Yup.object({
  name: Yup.string()
    .required('O nome é obrigatório'),
  newPassword: Yup.string()
    .min(6, 'A nova senha precisa ter pelo menos 6 caracteres'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'As senhas da nova senha não coincidem')
    .when('newPassword', (newPassword, schema) => {
      // Se 'newPassword' estiver preenchido, então 'confirmPassword' é obrigatório
      return newPassword && newPassword[0] ? schema.required('Confirme a nova senha') : schema;
    }),
  currentPassword: Yup.string()
    .when('newPassword', (newPassword, schema) => {
      // Se 'newPassword' estiver preenchido, então 'currentPassword' é obrigatório
      return newPassword && newPassword[0] ? schema.required('A senha atual é obrigatória para alterar') : schema;
    })
});

const Profile: React.FC = () => {
  const { user, loading: authLoading, reloadUser } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 2. Hook useFormik para gerenciar o formulário
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: validationSchema,
    enableReinitialize: true, // Atualiza o formulário se o 'user' do context mudar
    onSubmit: async (values, { setSubmitting, setFieldError, resetForm }) => {
      try {
        const payload: { name: string; currentPassword?: string; newPassword?: string } = {
          name: values.name,
        };

        // Inclui as senhas no payload apenas se a nova senha foi digitada
        if (values.newPassword) {
          payload.currentPassword = values.currentPassword;
          payload.newPassword = values.newPassword;
        }
        
        // 3. Chamada real à API
        await axios.put(`${process.env.REACT_APP_API_URL}/api/users/profile`, payload);

        setSnackbar({ open: true, message: 'Perfil atualizado com sucesso!', severity: 'success' });
        if(reloadUser) reloadUser(); // Recarrega os dados do usuário no context global
        
        // Reseta o formulário, mantendo o nome e email atualizados, mas limpando os campos de senha
        resetForm({
            values: { ...values, currentPassword: '', newPassword: '', confirmPassword: '' }
        });

      } catch (err: any) {
        const errorMessage = err.response?.data?.msg || 'Erro ao atualizar perfil.';
        // Exibe o erro do backend perto do campo de senha atual, que é o local mais provável do erro
        setFieldError('currentPassword', errorMessage);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Lógica de progresso (já estava perfeita)
  const nextLevelPoints = user?.level ? user.level * 100 : 100;
  const currentLevelPoints = (user?.level ? (user.level - 1) * 100 : 0);
  const pointsInCurrentLevel = user?.points ? user.points - currentLevelPoints : 0;
  const progressPercentage = (pointsInCurrentLevel / (nextLevelPoints - currentLevelPoints)) * 100;

  if (authLoading) {
    return (
      <Layout title="Perfil">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title="Perfil">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Seu Perfil</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Informações do perfil (permanece igual) */}
        <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem', mb: 2 }}>
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>{user?.name}</Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>{user?.email}</Typography>
              <Divider sx={{ width: '100%', my: 2 }} />
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrophyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Nível {user?.level}</Typography>
                  </Box>
                  <Chip label={`${user?.points} pts`} color="primary" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">
                    {pointsInCurrentLevel} / {nextLevelPoints - currentLevelPoints} pontos para o próximo nível
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
              <Divider sx={{ width: '100%', my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Membro desde: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* Formulário de edição conectado ao Formik */}
        <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Editar Informações</Typography>
              <Box component="form" onSubmit={formik.handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    required
                    disabled
                  />
                  <Divider>
                    <Typography variant="body2" color="text.secondary">Alterar Senha (opcional)</Typography>
                  </Divider>
                  <TextField
                    fullWidth
                    label="Senha Atual"
                    name="currentPassword"
                    type="password"
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                    helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                  />
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Nova Senha"
                      name="newPassword"
                      type="password"
                      value={formik.values.newPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                      helperText={formik.touched.newPassword && formik.errors.newPassword}
                    />
                    <TextField
                      fullWidth
                      label="Confirmar Nova Senha"
                      name="confirmPassword"
                      type="password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                      helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={formik.isSubmitting || !formik.dirty}
                    >
                      {formik.isSubmitting ? <CircularProgress size={24} /> : 'Salvar Alterações'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
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

export default Profile;