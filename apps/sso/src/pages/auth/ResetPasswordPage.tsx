import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, ArrowLeft } from 'lucide-react';
import type { ResetPasswordFormData } from '../../types';
import { ROUTES } from '../../constants';

/**
 * 密码重置页面组件
 * GitHub 风格的密码重置界面
 */
export const ResetPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 模拟密码重置请求
   */
  const mockResetPassword = async (email: string): Promise<void> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟成功响应（在实际应用中，这里应该调用真实的API）
    console.log('Password reset email sent to:', email);
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      await mockResetPassword(formData.email);
      setIsSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
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

  /**
   * 重新发送邮件
   */
  const handleResend = () => {
    setIsSubmitted(false);
    setError(null);
  };

  if (isSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <Github size={32} />
              <h1>Check your email</h1>
            </div>
          </div>

          {/* Success Message */}
          <div className="auth-form-container">
            <div className="auth-success">
              <div className="auth-success-icon">
                <Mail size={48} />
              </div>
              <h2>Reset link sent</h2>
              <p>
                We've sent a password reset link to{' '}
                <strong>{formData.email}</strong>
              </p>
              <p className="text-muted">
                If you don't see the email, check your spam folder or{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={handleResend}
                >
                  try again
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <Link to={ROUTES.LOGIN} className="auth-back-link">
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Github size={32} />
            <h1>Reset your password</h1>
          </div>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Reset Form */}
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="alert alert-error" role="alert">
                <span>{error}</span>
                <button
                  type="button"
                  className="alert-close"
                  onClick={() => setError(null)}
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

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner" />
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <Link to={ROUTES.LOGIN} className="auth-back-link">
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};