import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import App from './pages/App';

class AppErrorBoundary extends Component {
    state = { error: null };
    static getDerivedStateFromError(error) { return { error }; }
    componentDidCatch(error, info) {
        console.error('ReliefLink rendering error:', error, info);
    }
    render() {
        if (this.state.error) {
            return <main className="page"><p className="eyebrow">ReliefLink</p><h1 className="page-title">We could not load this module.</h1><p className="page-copy">{this.state.error.message || 'An unexpected application error occurred.'}</p><button className="mt-6 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white" onClick={() => window.location.assign('/')}>Return home</button></main>;
        }
        return this.props.children;
    }
}

const rootElement = document.getElementById('app');
if (rootElement) {
    createRoot(rootElement).render(<AppErrorBoundary><BrowserRouter><AuthProvider><NotificationProvider><App /></NotificationProvider></AuthProvider></BrowserRouter></AppErrorBoundary>);
}
