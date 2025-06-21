import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useGetAllUsersQuery, useAdminResetPasswordMutation, useUpdateUserMutation } from '../api/authApi';
import { User, UserRole } from '../../../shared/src/types';
import { AuthUser } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

export const AdminUserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error } = useGetAllUsersQuery();
  const [resetPassword] = useAdminResetPasswordMutation();
  const [updateUser] = useUpdateUserMutation();

  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'reset' | 'edit'>('reset');
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: UserRole.USER,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResetPassword = async (userId: string) => {
    try {
      await resetPassword(userId).unwrap();
      setFeedback({ type: 'success', message: 'Password reset successfully' });
      setDialogOpen(false);
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.data?.message || 'Failed to reset password' });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser({
        userId: selectedUser.id,
        updates: editForm,
      }).unwrap();
      setFeedback({ type: 'success', message: 'User updated successfully' });
      setDialogOpen(false);
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.data?.message || 'Failed to update user' });
    }
  };

  const openResetDialog = (user: AuthUser) => {
    setSelectedUser(user);
    setDialogType('reset');
    setDialogOpen(true);
  };

  const openEditDialog = (user: AuthUser) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setDialogType('edit');
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load users
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 2 }}
        >
          {feedback.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === UserRole.ADMIN ? 'secondary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEditDialog(user)}
                      disabled={user.id === currentUser?.id}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => openResetDialog(user)}
                    >
                      Reset Password
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'reset' ? 'Reset Password' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'reset' ? (
            <Typography>
              Are you sure you want to reset the password for{' '}
              <strong>{selectedUser?.username}</strong>? A password reset email will be sent to{' '}
              <strong>{selectedUser?.email}</strong>.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editForm.role}
                  label="Role"
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                >
                  <MenuItem value={UserRole.USER}>User</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={
              dialogType === 'reset'
                ? () => selectedUser && handleResetPassword(selectedUser.id)
                : handleUpdateUser
            }
            variant="contained"
            color={dialogType === 'reset' ? 'warning' : 'primary'}
          >
            {dialogType === 'reset' ? 'Reset Password' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
