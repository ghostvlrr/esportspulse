import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { updateUser } from '../store/slices/authSlice';
import { userService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username,
        email: user.email,
      }));
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const response = await userService.getFavorites();
      setFavorites(response);
    } catch (error) {
      console.error('Favoriler yüklenirken hata oluştu:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        ...formData,
        username: user.username,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = {
        username: formData.username,
        email: formData.email,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      };

      const response = await userService.updateProfile(updatedUser);
      dispatch(updateUser(response));
      setIsEditing(false);
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
    }
  };

  const handleRemoveFavorite = async (type: string, id: string) => {
    try {
      await userService.removeFavorite(type, id);
      loadFavorites();
    } catch (error) {
      console.error('Favori kaldırılırken hata oluştu:', error);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={user.avatar}
              sx={{ width: 100, height: 100 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {user.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                {t('common.edit')}
              </Button>
            )}
          </Box>

          <Divider />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label={t('profile.settings', 'Ayarlar')} />
              <Tab label={t('profile.favorites', 'Favoriler')} />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('auth.username')}
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('auth.email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                {isEditing && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        {t('profile.changePassword', 'Şifre Değiştir')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('profile.currentPassword', 'Mevcut Şifre')}
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('profile.newPassword', 'Yeni Şifre')}
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('profile.confirmNewPassword', 'Yeni Şifre Tekrar')}
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </Grid>
                  </>
                )}

                {isEditing && (
                  <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        t('common.save')
                      )}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {loadingFavorites ? (
              <LoadingSpinner />
            ) : favorites.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                {t('profile.noFavorites', 'Henüz favori eklenmemiş')}
              </Typography>
            ) : (
              <List>
                {favorites.map((favorite) => (
                  <ListItem
                    key={`${favorite.type}-${favorite.id}`}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveFavorite(favorite.type, favorite.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <FavoriteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={favorite.title}
                      secondary={String(t(`favorites.${favorite.type}`, { defaultValue: favorite.type }))}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 