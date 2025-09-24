import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterFormData } from '../../types';
import { ROUTES } from '../../constants';

/**
 * 注册页面组件
 * GitHub 风格的注册界面
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    clearError();
    
    const result = await register(formData);
    
    if (result.success) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // 清除对应字段的验证错误
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Github size={32} />
            <h1>Create your account</h1>
          </div>
        </div>

        {/* Register Form */}
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="alert alert-error" role="alert">
                <span>{error}</span>
                <button
                  type="button"
                  className="alert-close"
                  onClick={clearError}
                  aria-label="Close error message"
                >
                  ×
                </button>
              </div>
            )}

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" size={16} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  className={`form-input ${validationErrors.username ? 'form-input-error' : ''}`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="username"
                  required
                />
              </div>
              {validationErrors.username && (
                <span className="form-error">{validationErrors.username}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" size={16} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${validationErrors.email ? 'form-input-error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
              {validationErrors.email && (
                <span className="form-error">{validationErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${validationErrors.password ? 'form-input-error' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {validationErrors.password && (
                <span className="form-error">{validationErrors.password}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={16} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-input ${validationErrors.confirmPassword ? 'form-input-error' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span className="form-error">{validationErrors.confirmPassword}</span>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <span className="form-checkbox-label">
                  I agree to the{' '}
                  <Link to="/terms" className="form-link" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="form-link" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {validationErrors.acceptTerms && (
                <span className="form-error">{validationErrors.acceptTerms}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* OAuth Buttons */}
          <div className="auth-oauth">
            <button className="btn btn-outline btn-block" type="button">
              <Github size={16} />
              Sign up with GitHub
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};