import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component to catch and display React errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.icon}>😢</div>
            <h1 className={styles.title}>Algo deu errado</h1>
            <p className={styles.message}>
              Desculpe, ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {this.state.error && import.meta.env.DEV && (
              <details className={styles.details}>
                <summary>Detalhes do erro (modo desenvolvimento)</summary>
                <div className={styles.errorText}>
                  <strong>Erro:</strong> {this.state.error.message}
                  {this.state.errorInfo && (
                    <>
                      <br />
                      <br />
                      <strong>Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <button className={styles.retryButton} onClick={this.handleRetry}>
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
