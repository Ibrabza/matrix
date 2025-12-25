import { useState } from 'react';
import {
  Avatar,
  Upload,
  Form,
  Input,
  Button,
  Modal,
  Typography,
  ConfigProvider,
  theme as antdTheme,
  message,
  Divider,
} from 'antd';
import type { UploadProps } from 'antd';
import { User, Camera, Mail, Lock, AlertTriangle, Trash2, Shield, UserCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text, Paragraph } = Typography;

// Simulate API call
const simulateApiCall = () => new Promise((resolve) => setTimeout(resolve, 1000));

const SettingsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Form instances
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Loading states
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Avatar upload handler
  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    setAvatarLoading(true);
    await simulateApiCall();
    setAvatarLoading(false);
    message.success('Profile photo updated successfully!');
    if (options.onSuccess) {
      options.onSuccess({});
    }
  };

  // Email update handler
  const handleEmailUpdate = async (values: { email: string }) => {
    setEmailLoading(true);
    await simulateApiCall();
    setEmailLoading(false);
    message.success('Email updated successfully!');
    emailForm.resetFields();
    console.log('Email updated to:', values.email);
  };

  // Password change handler
  const handlePasswordChange = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordLoading(true);
    await simulateApiCall();
    setPasswordLoading(false);
    message.success('Password changed successfully!');
    passwordForm.resetFields();
    console.log('Password changed:', values);
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      message.error('Please type DELETE to confirm');
      return;
    }
    setDeleteLoading(true);
    await simulateApiCall();
    setDeleteLoading(false);
    setDeleteModalOpen(false);
    message.success('Account deleted. Redirecting...');
    console.log('Account deleted');
  };

  // Section wrapper component
  const Section = ({
    icon: Icon,
    title,
    description,
    children,
    danger = false,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
    danger?: boolean;
  }) => (
    <div
      className={`p-6 rounded-2xl ${
        danger
          ? isDark
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-red-50 border border-red-200'
          : isDark
            ? 'bg-slate-800/50 border border-white/[0.05]'
            : 'bg-white border border-slate-200'
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            danger
              ? isDark
                ? 'bg-red-500/20 text-red-400'
                : 'bg-red-100 text-red-500'
              : isDark
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-purple-100 text-purple-500'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <Title
            level={4}
            className={`!mb-1 ${
              danger
                ? isDark
                  ? '!text-red-400'
                  : '!text-red-600'
                : isDark
                  ? '!text-white'
                  : '!text-slate-900'
            }`}
          >
            {title}
          </Title>
          <Text className={isDark ? '!text-slate-400' : '!text-slate-500'}>{description}</Text>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 8,
        },
        components: {
          Input: {
            colorBgContainer: isDark ? '#1e293b' : '#ffffff',
            colorBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            activeBorderColor: '#8b5cf6',
            hoverBorderColor: '#8b5cf6',
          },
          Form: {
            labelColor: isDark ? '#cbd5e1' : '#475569',
          },
          Button: {
            primaryColor: '#ffffff',
          },
        },
      }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <Title level={2} className={`!mb-2 ${isDark ? '!text-white' : '!text-slate-900'}`}>
            Settings
          </Title>
          <Paragraph className={isDark ? '!text-slate-400' : '!text-slate-500'}>
            Manage your account settings and preferences
          </Paragraph>
        </div>

        {/* Profile Section - Avatar */}
        <Section
          icon={UserCircle}
          title="Profile Photo"
          description="Update your profile picture visible to others"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                size={80}
                className="!bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg"
                icon={<User className="w-10 h-10" />}
              />
              {avatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Upload
                showUploadList={false}
                customRequest={handleAvatarUpload}
                accept="image/*"
              >
                <Button
                  icon={<Camera className="w-4 h-4" />}
                  loading={avatarLoading}
                  className="!flex !items-center !gap-2"
                >
                  Change Photo
                </Button>
              </Upload>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </Section>

        {/* Email Update Section */}
        <Section
          icon={Mail}
          title="Email Address"
          description="Update the email address associated with your account"
        >
          <Form form={emailForm} layout="vertical" onFinish={handleEmailUpdate}>
            <Form.Item
              name="email"
              label="New Email Address"
              rules={[
                { required: true, message: 'Please enter your new email' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input
                placeholder="you@example.com"
                prefix={<Mail className="w-4 h-4 text-slate-400" />}
                size="large"
              />
            </Form.Item>
            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={emailLoading}
                className="!shadow-lg !shadow-purple-500/25"
              >
                Save Email
              </Button>
            </Form.Item>
          </Form>
        </Section>

        {/* Password Change Section */}
        <Section
          icon={Shield}
          title="Security"
          description="Update your password to keep your account secure"
        >
          <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password
                placeholder="Enter current password"
                prefix={<Lock className="w-4 h-4 text-slate-400" />}
                size="large"
              />
            </Form.Item>

            <Divider
              className={isDark ? '!border-white/[0.08]' : '!border-slate-200'}
              dashed
            />

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password
                placeholder="Enter new password"
                prefix={<Lock className="w-4 h-4 text-slate-400" />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm new password"
                prefix={<Lock className="w-4 h-4 text-slate-400" />}
                size="large"
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={passwordLoading}
                className="!shadow-lg !shadow-purple-500/25"
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Section>

        {/* Danger Zone - Delete Account */}
        <Section
          icon={AlertTriangle}
          title="Danger Zone"
          description="Irreversible actions that affect your account"
          danger
        >
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-red-500/10' : 'bg-red-100/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Trash2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isDark ? 'text-red-400' : 'text-red-500'
                  }`}
                />
                <div>
                  <h4
                    className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}
                  >
                    Delete Account
                  </h4>
                  <p
                    className={`text-sm mt-1 ${isDark ? 'text-red-400/70' : 'text-red-600/70'}`}
                  >
                    Once you delete your account, there is no going back. All your data,
                    courses, and progress will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            <Button
              danger
              onClick={() => setDeleteModalOpen(true)}
              icon={<Trash2 className="w-4 h-4" />}
              className="!flex !items-center !gap-2"
            >
              Delete My Account
            </Button>
          </div>
        </Section>

        {/* Delete Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Account</span>
            </div>
          }
          open={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setDeleteConfirmText('');
          }}
          footer={null}
          centered
          className={isDark ? 'dark-modal' : ''}
        >
          <div className="space-y-4 py-4">
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              This action <strong>cannot be undone</strong>. This will permanently delete
              your account and remove all your data from our servers.
            </p>

            <div
              className={`p-4 rounded-lg ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            >
              <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Please type <strong className="text-red-500">DELETE</strong> to confirm:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                status={deleteConfirmText && deleteConfirmText !== 'DELETE' ? 'error' : undefined}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </Button>
              <Button
                danger
                type="primary"
                onClick={handleDeleteAccount}
                loading={deleteLoading}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default SettingsPage;

