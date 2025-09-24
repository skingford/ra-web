import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { LoginFormData } from '../../types';
import { ROUTES } from '../../constants';

/**
 * 登录页面组件
 * GitHub 风格的登录界面
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: 'admin@example.com',
    password: 'password',
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
    
    const result = await login(formData);
    
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
            <h1>Sign in to SSO</h1>
          </div>
        </div>

        {/* Login Form */}
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
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Link to={ROUTES.RESET_PASSWORD} className="form-link">
                  Forgot password?
                </Link>
              </div>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${validationErrors.password ? 'form-input-error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="current-password"
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

            {/* Remember Me */}
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="form-checkbox-label">Remember me</span>
              </label>
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
                  Signing in...
                </>
              ) : (
                'Sign in'
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
              Continue with GitHub
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            New to our platform?{' '}
            <Link to={ROUTES.REGISTER} className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};