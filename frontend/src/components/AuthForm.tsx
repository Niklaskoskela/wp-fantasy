// Login and Registration form component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Link,
} from '@mui/material';
import { useLoginMutation, useRegisterMutation, useForgotPasswordMutation } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function AuthForm() {
  const [tabValue, setTabValue] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Forgot password form state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  // API mutations
  const [loginMutation, { isLoading: loginLoading, error: loginError }] = useLoginMutation();
  const [registerMutation, { isLoading: registerLoading, error: registerError }] = useRegisterMutation();
  const [forgotPasswordMutation, { isLoading: forgotPasswordLoading, error: forgotPasswordError }] = useForgotPasswordMutation();
  
  // Success states
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setShowForgotPassword(false);
    setRegisterSuccess(false);
    setForgotPasswordSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation(loginForm).unwrap();
      login(result.user, result.token);
      // Redirect to teams page after successful login
      navigate('/teams');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }
    
    try {
      const result = await registerMutation({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      }).unwrap();
      
      setRegisterSuccess(true);
      // Auto-login after successful registration
      login(result.user, result.token);
      // Redirect to teams page after successful registration
      navigate('/teams');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPasswordMutation({ email: forgotPasswordEmail }).unwrap();
      setForgotPasswordSuccess(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
    }
  };

  if (showForgotPassword) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Reset Password
            </Typography>
            
            {forgotPasswordSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Password reset instructions have been sent to your email.
              </Alert>
            ) : (
              <form onSubmit={handleForgotPassword}>
                {forgotPasswordError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {(forgotPasswordError as any)?.data?.error || 'Failed to send reset email'}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={forgotPasswordLoading}
                  sx={{ mb: 2 }}
                >
                  {forgotPasswordLoading ? <CircularProgress size={24} /> : 'Send Reset Email'}
                </Button>
              </form>
            )}
            
            <Link
              component="button"
              variant="body2"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Water Polo Fantasy League
          </Typography>
          
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              {loginError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {(loginError as any)?.data?.error || 'Login failed'}
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Username or Email"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loginLoading}
                sx={{ mb: 2 }}
              >
                {loginLoading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
              
              <Link
                component="button"
                variant="body2"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Link>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {registerSuccess ? (
              <Alert severity="success">
                Registration successful! Welcome to the league!
              </Alert>
            ) : (
              <form onSubmit={handleRegister}>
                {registerError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {(registerError as any)?.data?.error || 'Registration failed'}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  label="Username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  helperText="3-50 characters, letters, numbers, underscores, and hyphens only"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  helperText="8+ characters with uppercase, lowercase, number, and special character"
                />
                
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  required
                  error={registerForm.password !== registerForm.confirmPassword && registerForm.confirmPassword !== ''}
                  helperText={registerForm.password !== registerForm.confirmPassword && registerForm.confirmPassword !== '' ? 'Passwords do not match' : ''}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={registerLoading || registerForm.password !== registerForm.confirmPassword}
                  sx={{ mb: 2 }}
                >
                  {registerLoading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </form>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
