import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { Page } from '../App.tsx';
import type { UserProfile } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import ContentManagement from './admin/ContentManagement.tsx';
import CaseEditor from './admin/CaseEditor.tsx';
import PromoEditor from './admin/PromoEditor.tsx';


// Defines the available tabs in the admin panel.
type AdminTab = 'users' | 'content' | 'cases' | 'promos';

/**
 * The main component for the Admin Panel.
 * It provides a tabbed interface for managing users, content, cases, and promo codes.
 */
const AdminPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { t } = useLanguage();
    const { getAllUsers, adminResetPassword, toggleUserStatus } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [users, setUsers] = useState<UserProfile[]>([]);
    
    // Fetch all users when the component mounts.
    useEffect(() => {
        setUsers(getAllUsers());
    }, []);

    // A function to refresh the user list after an action (e.g., ban, password reset).
    const refreshUsers = () => {
        setUsers(getAllUsers());
    }
    
    /**
     * Handles the password reset action for a user.
     * Shows a confirmation dialog before proceeding.
     */
    const handleResetPassword = async (userId: string, name: string) => {
        if (window.confirm(t('admin_page.reset_password_confirm').replace('{name}', name))) {
            const result = await adminResetPassword(userId);
            if (result.success) {
                alert(`Password for ${name} has been reset to 'password123'.`);
                refreshUsers();
            } else {
                alert(`Failed to reset password: ${result.message}`);
            }
        }
    };

    /**
     * Handles banning or unbanning a user.
     * Shows a confirmation dialog before proceeding.
     */
    const handleToggleStatus = async (user: UserProfile) => {
        const isBanning = user.status !== 'banned';
        const confirmMessage = isBanning 
            ? t('admin_page.ban_user_confirm').replace('{name}', user.name)
            : t('admin_page.unban_user_confirm').replace('{name}', user.name);
        
        if (window.confirm(confirmMessage)) {
            const result = await toggleUserStatus(user.id);
            if (result.success) {
                refreshUsers(); // Refresh the list to show the updated status.
            } else {
                alert(`Action failed: ${result.message}`);
            }
        }
    };


    /**
     * A reusable button component for the main tabs.
     */
    const TabButton: React.FC<{tabId: AdminTab; label: string}> = ({ tabId, label }) => (
         <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tabId
                    ? 'bg-purple-600 text-white' // Active state
                    : 'bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white' // Inactive state
            }`}
        >
            {label}
        </button>
    );

    /**
     * The component for the "User Management" tab, displaying a table of all users.
     */
    const UserManagementTab = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-700">
                <thead className="bg-neutral-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">{t('admin_page.users')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">{t('admin_page.status')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">{t('admin_page.actions')}</th>
                    </tr>
                </thead>
                <tbody className="bg-neutral-900/50 divide-y divide-neutral-800">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-4 object-cover" />
                                {user.name} ({user.role})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-semibold capitalize">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'banned' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                    {user.status === 'banned' ? t('admin_page.banned') : t('admin_page.active')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                <button onClick={() => handleToggleStatus(user)} className={user.status === 'banned' ? "text-green-500 hover:text-green-400" : "text-red-500 hover:text-red-400"} disabled={user.role === 'admin'}>
                                  {user.status === 'banned' ? t('admin_page.unban') : t('admin_page.ban')}
                                </button>
                                <button onClick={() => handleResetPassword(user.id, user.name)} className="text-blue-500 hover:text-blue-400">{t('admin_page.reset_password')}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    // Renders the content of the currently active tab.
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'users': return <UserManagementTab />;
            case 'content': return <ContentManagement />;
            case 'cases': return <CaseEditor />;
            case 'promos': return <PromoEditor />;
            default: return null;
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6">
                 <button onClick={() => setPage('home')} className="flex items-center space-x-2 text-neutral-300 hover:text-purple-400 transition-colors mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <span>{t('admin_page.back_to_home')}</span>
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white" dangerouslySetInnerHTML={{ __html: t('admin_page.title') }} />

                <div className="max-w-5xl mx-auto bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center space-x-2 border-b border-neutral-700 pb-4 mb-6">
                       <TabButton tabId="users" label={t('admin_page.user_management')} />
                       <TabButton tabId="content" label={t('admin_page.content_management')} />
                       <TabButton tabId="cases" label={t('admin_page.case_management')} />
                       <TabButton tabId="promos" label={t('admin_page.promo_management')} />
                    </div>
                    
                    <div>
                        {renderActiveTab()}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdminPage;